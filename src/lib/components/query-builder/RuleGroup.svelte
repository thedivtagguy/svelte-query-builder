<script lang="ts">
	import {
		findPath,
		generateID,
		getValidationClassNames,
		isRuleGroup,
		isRuleGroupType,
	} from '@react-querybuilder/core';
	import type { Path, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
	import { dndzone } from 'svelte-dnd-action';
	import type { DndEvent, Item } from 'svelte-dnd-action';
	import { getQueryBuilderContext } from '../../state/context.js';
	import Rule from './Rule.svelte';
	import Self from './RuleGroup.svelte';
	import { cn } from '$lib/utils.js';

	interface DndItem extends Item {
		id: string;
		__type: 'rule' | 'group' | 'combinator';
		__payload: unknown;
	}

	let { path, parentDisabled }: { path: Path; parentDisabled?: boolean } = $props();

	const ctx = getQueryBuilderContext();
	const qb = ctx.state;
	const schema = ctx.schema;

	const isRoot = $derived(path.length === 0);
	const group = $derived(
		path.length === 0 ? qb.query : (findPath(path, qb.query) as RuleGroupTypeAny),
	);
	const groupDisabled = $derived(
		!!group?.disabled || !!parentDisabled || qb.isPathDisabled(path),
	);
	const groupMuted = $derived(!!group?.muted || qb.isPathMuted(path));
	const isStandard = $derived(isRuleGroupType(group));
	const combinator = $derived(
		isStandard ? group.combinator : ((schema.combinators[0] as { value: string })?.value ?? 'and'),
	);
	const not = $derived(!!group.not);
	const children = $derived(group.rules ?? []);

	const validationClassname = $derived(
		getValidationClassNames((group?.id ? schema.validationMap[group.id] : undefined) ?? true),
	);
	const userClassname = $derived(schema.getRuleGroupClassname(group));

	function onCombinatorChange(next: string) {
		// Standard mode: combinator on group. IC mode: combinator string in rules array.
		if (schema.independentCombinators) {
			// Update all combinator strings in this group's rules array
			const rules = (group.rules as Array<unknown>).map((r) => (typeof r === 'string' ? next : r));
			qb.updateProp(path, 'rules', rules);
		} else {
			qb.updateCombinatorAt(path, next);
		}
	}
	function onNotChange(next: boolean) {
		qb.updateProp(path, 'not', next);
	}
	function onAddRule() {
		const firstField = schema.fields[0];
		const fieldName = (firstField?.value ?? firstField?.name ?? '') as string;
		const operators = schema.getOperators(fieldName);
		const firstOperator = operators[0] as { value?: string } | undefined;
		const operatorValue = (firstOperator?.value ?? '') as string;
		const newRule: RuleType = {
			id: generateID(),
			field: fieldName,
			operator: operatorValue,
			value: '',
		};
		qb.addRule(newRule, path);
	}
	function onAddGroup() {
		const newGroup: RuleGroupTypeAny = schema.independentCombinators
			? ({ id: generateID(), rules: [] } as unknown as RuleGroupTypeAny)
			: ({ id: generateID(), combinator: 'and', rules: [] } as RuleGroupTypeAny);
		qb.addGroup(newGroup, path);
	}
	function onClone() {
		qb.cloneNode(path);
	}
	function onRemove() {
		if (groupDisabled) return;
		qb.removeNode(path);
	}
	function onToggleLock() {
		qb.toggleDisabled(path);
	}
	function onToggleMute() {
		qb.toggleMuted(path);
	}
	function onShiftUp() {
		qb.moveNode(path, 'up');
	}
	function onShiftDown() {
		qb.moveNode(path, 'down');
	}
	function onInlineCombinatorChange(index: number, next: string) {
		const rules = [...(group.rules as Array<unknown>)];
		rules[index] = next;
		qb.updateProp(path, 'rules', rules);
	}

	const CombinatorSelector = $derived(schema.controls.combinatorSelector);
	const InlineCombinatorComp = $derived(schema.controls.inlineCombinator);
	const NotToggle = $derived(schema.controls.notToggle);
	const AddRuleAction = $derived(schema.controls.addRuleAction);
	const AddGroupAction = $derived(schema.controls.addGroupAction);
	const CloneAction = $derived(schema.controls.cloneGroupAction);
	const RemoveAction = $derived(schema.controls.removeGroupAction);
	const LockAction = $derived(schema.controls.lockGroupAction);
	const MuteAction = $derived(schema.controls.muteGroupAction);
	const ShiftActions = $derived(schema.controls.shiftActions);
	const DragHandle = $derived(schema.controls.dragHandle);

	const common = $derived({ path, level: path.length, schema, disabled: groupDisabled });

	const accessibleDesc = $derived(
		schema.accessibleDescriptionGenerator
			? schema.accessibleDescriptionGenerator({ path, qbId: schema.qbId })
			: undefined,
	);

	function childKey(child: RuleType | RuleGroupTypeAny | string, index: number): string {
		if (typeof child === 'string') return `combinator-${index}`;
		return (child.id ?? `${index}`) as string;
	}

	// Render a single non-IC child (rule or group) at index `i`
	function indexInRules(i: number): number {
		return i;
	}

	// ---- Drag & drop ----
	// Build dndzone-friendly items (each must have stable `id`). For IC mode we
	// only drag actual rules/groups — combinator strings stay where they are
	// after reorder is committed.
	const dndItems = $derived.by((): DndItem[] => {
		const items: DndItem[] = [];
		for (const c of children as Array<RuleType | RuleGroupTypeAny | string>) {
			if (typeof c === 'string') continue;
			items.push({
				id: (c.id ?? generateID()) as string,
				__type: isRuleGroup(c) ? 'group' : 'rule',
				__payload: c,
			});
		}
		return items;
	});

	function commitDnd(items: DndItem[]) {
		// Reconstruct rules array preserving IC combinator strings between items.
		const next: Array<unknown> = [];
		for (let i = 0; i < items.length; i++) {
			next.push(items[i].__payload);
			if (schema.independentCombinators && i < items.length - 1) {
				const existing = (children as Array<unknown>).filter((c) => typeof c === 'string') as string[];
				next.push(existing[i] ?? (schema.combinators[0] as { value: string })?.value ?? 'and');
			}
		}
		qb.updateProp(path, 'rules', next);
	}

	function onDndConsider(e: CustomEvent<DndEvent<Item>>) {
		// svelte-dnd-action mutates `items` in-place during drag; we re-render
		// from a local snapshot so the dragged element appears in flight.
		consideredItems = e.detail.items as DndItem[];
	}
	function onDndFinalize(e: CustomEvent<DndEvent<Item>>) {
		consideredItems = null;
		commitDnd(e.detail.items as DndItem[]);
	}

	let consideredItems = $state<DndItem[] | null>(null);
	const renderedItems = $derived(consideredItems ?? dndItems);
</script>

<div
	class={cn(
		'svelte-rqb-group rounded-md border bg-card p-3 shadow-xs',
		isRoot && schema.classnames.queryBuilder,
		schema.classnames.ruleGroup,
		userClassname,
		validationClassname,
		groupDisabled && cn('opacity-60', schema.classnames.disabled),
		groupMuted && cn('italic', schema.classnames.muted),
	)}
	data-rqb-element="rule-group"
	data-level={path.length}
	data-path={JSON.stringify(path)}
	aria-disabled={groupDisabled || undefined}
	aria-label={accessibleDesc}
>
	<div
		class={cn(
			'svelte-rqb-group-header flex flex-wrap items-center gap-2 pb-2',
			schema.classnames.header,
		)}
		data-rqb-element="rule-group-header"
	>
		{#if schema.enableDragAndDrop && !isRoot && DragHandle}
			<DragHandle
				{...common}
				label={schema.translations.dragHandle?.label}
				title={schema.translations.dragHandle?.title}
				className={schema.classnames.dragHandle}
			/>
		{/if}
		{#if schema.showShiftActions && !isRoot && ShiftActions}
			<ShiftActions
				{...common}
				titles={{
					shiftUp: schema.translations.shiftActionUp?.title,
					shiftDown: schema.translations.shiftActionDown?.title,
				}}
				labels={{
					shiftUp: schema.translations.shiftActionUp?.label,
					shiftDown: schema.translations.shiftActionDown?.label,
				}}
				className={schema.classnames.shiftActions}
				ruleOrGroup={group}
				shiftUp={onShiftUp}
				shiftDown={onShiftDown}
			/>
		{/if}
		{#if !schema.independentCombinators}
			<CombinatorSelector
				{...common}
				options={schema.combinators}
				value={combinator}
				title={schema.translations.combinators?.title}
				className={schema.classnames.combinators}
				onChange={onCombinatorChange}
			/>
		{/if}
		{#if schema.showNotToggle && NotToggle}
			<NotToggle
				{...common}
				checked={not}
				label={schema.translations.notToggle?.label}
				title={schema.translations.notToggle?.title}
				className={schema.classnames.notToggle}
				onChange={onNotChange}
			/>
		{/if}
		{#if AddRuleAction}
			<AddRuleAction
				{...common}
				label={schema.translations.addRule?.label}
				title={schema.translations.addRule?.title}
				className={schema.classnames.addRule}
				onClick={onAddRule}
			/>
		{/if}
		{#if AddGroupAction}
			<AddGroupAction
				{...common}
				label={schema.translations.addGroup?.label}
				title={schema.translations.addGroup?.title}
				className={schema.classnames.addGroup}
				onClick={onAddGroup}
			/>
		{/if}
		{#if !isRoot && schema.showCloneButtons && CloneAction}
			<CloneAction
				{...common}
				label={schema.translations.cloneRuleGroup?.label}
				title={schema.translations.cloneRuleGroup?.title}
				className={schema.classnames.cloneGroup}
				ruleOrGroup={group}
				onClick={onClone}
			/>
		{/if}
		{#if !isRoot && schema.showLockButtons && LockAction}
			<LockAction
				{...common}
				disabled={false}
				label={groupDisabled
					? schema.translations.lockGroupDisabled?.label
					: schema.translations.lockGroup?.label}
				title={groupDisabled
					? schema.translations.lockGroupDisabled?.title
					: schema.translations.lockGroup?.title}
				className={schema.classnames.lockGroup}
				ruleOrGroup={group}
				onClick={onToggleLock}
			/>
		{/if}
		{#if !isRoot && schema.showMuteButtons && MuteAction}
			<MuteAction
				{...common}
				label={groupMuted
					? schema.translations.unmuteGroup?.label
					: schema.translations.muteGroup?.label}
				title={groupMuted
					? schema.translations.unmuteGroup?.title
					: schema.translations.muteGroup?.title}
				className={schema.classnames.muteGroup}
				ruleOrGroup={group}
				onClick={onToggleMute}
			/>
		{/if}
		{#if !isRoot && RemoveAction}
			<RemoveAction
				{...common}
				label={schema.translations.removeGroup?.label}
				title={schema.translations.removeGroup?.title}
				className={schema.classnames.removeGroup}
				ruleOrGroup={group}
				onClick={onRemove}
			/>
		{/if}
	</div>
	{#if schema.enableDragAndDrop}
		<div
			class={cn(
				'svelte-rqb-group-body flex flex-col gap-2 border-l-2 border-muted pl-3',
				schema.classnames.body,
			)}
			data-rqb-element="rule-group-body"
			use:dndzone={{
				items: renderedItems,
				type: 'svelte-rqb-rules',
				dropTargetStyle: {},
				flipDurationMs: 150,
				dragDisabled: groupDisabled,
			}}
			onconsider={onDndConsider}
			onfinalize={onDndFinalize}
		>
			{#each renderedItems as item, i (item.id)}
				<div data-dnd-id={item.id}>
					{#if item.__type === 'group'}
						<Self path={[...path, indexInRules(i)]} parentDisabled={groupDisabled} />
					{:else}
						<Rule path={[...path, indexInRules(i)]} parentDisabled={groupDisabled} />
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div
			class={cn(
				'svelte-rqb-group-body flex flex-col gap-2 border-l-2 border-muted pl-3',
				schema.classnames.body,
			)}
			data-rqb-element="rule-group-body"
		>
			{#each children as child, i (childKey(child, i))}
				{#if typeof child === 'string'}
					<div
						class={cn('svelte-rqb-inline-combinator', schema.classnames.betweenRules)}
						data-rqb-element="inline-combinator"
					>
						<InlineCombinatorComp
							{...common}
							options={schema.combinators}
							value={child}
							className={schema.classnames.combinators}
							title={schema.translations.combinators?.title}
							onChange={(v) => onInlineCombinatorChange(i, v)}
							rules={children}
						/>
					</div>
				{:else if isRuleGroup(child)}
					<Self path={[...path, indexInRules(i)]} parentDisabled={groupDisabled} />
				{:else}
					<Rule path={[...path, indexInRules(i)]} parentDisabled={groupDisabled} />
				{/if}
			{/each}
		</div>
	{/if}
</div>
