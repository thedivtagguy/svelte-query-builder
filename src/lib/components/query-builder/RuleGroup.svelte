<script lang="ts">
	import { findPath, generateID, isRuleGroup, isRuleGroupType } from '@react-querybuilder/core';
	import type { Path, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
	import { getQueryBuilderContext } from '../../state/context.js';
	import Rule from './Rule.svelte';
	import Self from './RuleGroup.svelte';
	import { cn } from '$lib/utils.js';

	let { path }: { path: Path } = $props();

	const ctx = getQueryBuilderContext();
	const { state, schema } = ctx;

	const isRoot = $derived(path.length === 0);
	const group = $derived(
		path.length === 0 ? state.query : (findPath(path, state.query) as RuleGroupTypeAny),
	);
	const combinator = $derived(
		isRuleGroupType(group) ? group.combinator : (schema.combinators[0] as { value: string })?.value ?? 'and',
	);
	const not = $derived(!!group.not);
	const children = $derived(group.rules ?? []);

	function onCombinatorChange(next: string) {
		state.updateProp(path, 'combinator', next);
	}
	function onNotChange(next: boolean) {
		state.updateProp(path, 'not', next);
	}
	function onAddRule() {
		const firstField = schema.fields[0];
		const fieldName = (firstField?.value ?? firstField?.name ?? '') as string;
		const operators = schema.getOperators(fieldName);
		const firstOperator = (operators[0] as { value?: string } | undefined);
		const operatorValue = (firstOperator?.value ?? '') as string;
		const newRule: RuleType = {
			id: generateID(),
			field: fieldName,
			operator: operatorValue,
			value: '',
		};
		state.addRule(newRule, path);
	}
	function onAddGroup() {
		const newGroup: RuleGroupTypeAny = {
			id: generateID(),
			combinator: 'and',
			rules: [],
			// Strip combinator if IC mode is on (Phase 2 will handle this properly)
		} as RuleGroupTypeAny;
		state.addGroup(newGroup, path);
	}
	function onClone() {
		state.cloneNode(path);
	}
	function onRemove() {
		state.removeNode(path);
	}

	const CombinatorSelector = $derived(schema.controls.combinatorSelector);
	const NotToggle = $derived(schema.controls.notToggle);
	const AddRuleAction = $derived(schema.controls.addRuleAction);
	const AddGroupAction = $derived(schema.controls.addGroupAction);
	const CloneAction = $derived(schema.controls.cloneGroupAction);
	const RemoveAction = $derived(schema.controls.removeGroupAction);

	const common = $derived({
		path,
		level: path.length,
		schema,
	});

	function childKey(child: RuleType | RuleGroupTypeAny | string, index: number): string {
		if (typeof child === 'string') return `combinator-${index}`;
		return (child.id ?? `${index}`) as string;
	}
</script>

<div
	class={cn(
		'svelte-rqb-group rounded-md border bg-card p-3 shadow-xs',
		schema.classnames.ruleGroup,
	)}
	data-rqb-element="rule-group"
	data-level={path.length}
	data-path={JSON.stringify(path)}
>
	<div
		class={cn(
			'svelte-rqb-group-header flex flex-wrap items-center gap-2 pb-2',
			schema.classnames.header,
		)}
		data-rqb-element="rule-group-header"
	>
		<CombinatorSelector
			{...common}
			options={schema.combinators}
			value={combinator}
			title={schema.translations.combinators?.title}
			className={schema.classnames.combinators}
			onChange={onCombinatorChange}
		/>
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
	<div
		class={cn(
			'svelte-rqb-group-body flex flex-col gap-2 border-l-2 border-muted pl-3',
			schema.classnames.body,
		)}
		data-rqb-element="rule-group-body"
	>
		{#each children as child, i (childKey(child, i))}
			{#if typeof child === 'string'}
				<!-- Independent combinator placeholder; Phase 2 wires this up -->
				<span class="text-xs text-muted-foreground uppercase">{child}</span>
			{:else if isRuleGroup(child)}
				<Self path={[...path, i]} />
			{:else}
				<Rule path={[...path, i]} />
			{/if}
		{/each}
	</div>
</div>
