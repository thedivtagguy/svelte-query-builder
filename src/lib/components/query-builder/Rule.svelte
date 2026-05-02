<script lang="ts">
	import { findPath, getValidationClassNames } from '@react-querybuilder/core';
	import type { MatchMode, Path, RuleType } from '@react-querybuilder/core';
	import { getQueryBuilderContext } from '../../state/context.js';
	import { cn } from '$lib/utils.js';

	let { path, parentDisabled }: { path: Path; parentDisabled?: boolean } = $props();

	const ctx = getQueryBuilderContext();
	const qb = ctx.state;
	const schema = ctx.schema;

	const rule = $derived(findPath(path, qb.query) as RuleType);
	const ruleDisabled = $derived(!!rule?.disabled || !!parentDisabled || qb.isPathDisabled(path));
	const ruleMuted = $derived(!!rule?.muted || qb.isPathMuted(path));

	const valueEditorType = $derived(schema.getValueEditorType(rule.field, rule.operator));
	const inputType = $derived(schema.getInputType(rule.field, rule.operator));
	const operators = $derived(schema.getOperators(rule.field));
	const values = $derived(schema.getValues(rule.field, rule.operator));
	const valueSources = $derived(schema.getValueSources(rule.field, rule.operator));
	const matchModes = $derived(schema.getMatchModes(rule.field));

	const validationClassname = $derived(
		getValidationClassNames((rule?.id ? schema.validationMap[rule.id] : undefined) ?? true),
	);
	const userClassname = $derived(schema.getRuleClassname(rule));

	function onFieldChange(next: string) {
		qb.updateProp(path, 'field', next);
	}
	function onOperatorChange(next: string) {
		qb.updateProp(path, 'operator', next);
	}
	function onValueChange(next: unknown) {
		qb.updateProp(path, 'value', next);
	}
	function onValueSourceChange(next: string) {
		qb.updateProp(path, 'valueSource', next);
		qb.updateProp(path, 'value', '');
	}
	function onMatchModeChange(next: MatchMode) {
		qb.updateProp(path, 'match', { mode: next, threshold: 1 } as never);
	}
	function onMatchThresholdChange(next: number) {
		const current = (rule.match ?? { mode: 'all' }) as { mode: MatchMode; threshold?: number };
		qb.updateProp(path, 'match', { ...current, threshold: next } as never);
	}
	function onClone() {
		qb.cloneNode(path);
	}
	function onRemove() {
		if (ruleDisabled) return;
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

	const FieldSelector = $derived(schema.controls.fieldSelector);
	const OperatorSelector = $derived(schema.controls.operatorSelector);
	const ValueSourceSelector = $derived(schema.controls.valueSourceSelector);
	const MatchModeEditor = $derived(schema.controls.matchModeEditor);
	const ValueEditor = $derived(schema.controls.valueEditor);
	const CloneAction = $derived(schema.controls.cloneRuleAction);
	const RemoveAction = $derived(schema.controls.removeRuleAction);
	const LockAction = $derived(schema.controls.lockRuleAction);
	const MuteAction = $derived(schema.controls.muteRuleAction);
	const ShiftActions = $derived(schema.controls.shiftActions);
	const DragHandle = $derived(schema.controls.dragHandle);

	const common = $derived({ path, level: path.length, schema, disabled: ruleDisabled });

	const accessibleDesc = $derived(
		schema.accessibleDescriptionGenerator
			? schema.accessibleDescriptionGenerator({ path, qbId: schema.qbId })
			: undefined,
	);

	const showValueSource = $derived(valueSources.length > 1);
	const matchInfo = $derived(rule.match as { mode: MatchMode; threshold?: number } | undefined);
</script>

<div
	class={cn(
		'svelte-rqb-rule flex flex-wrap items-center gap-2 py-1.5',
		schema.classnames.rule,
		userClassname,
		validationClassname,
		ruleDisabled && cn('opacity-60', schema.classnames.disabled),
		ruleMuted && cn('italic', schema.classnames.muted),
	)}
	data-rqb-element="rule"
	data-level={path.length}
	data-path={JSON.stringify(path)}
	aria-disabled={ruleDisabled || undefined}
	aria-label={accessibleDesc}
>
	{#if schema.enableDragAndDrop && DragHandle}
		<DragHandle
			{...common}
			label={schema.translations.dragHandle?.label}
			title={schema.translations.dragHandle?.title}
			className={schema.classnames.dragHandle}
		/>
	{/if}
	{#if schema.showShiftActions && ShiftActions}
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
			ruleOrGroup={rule}
			shiftUp={onShiftUp}
			shiftDown={onShiftDown}
		/>
	{/if}
	<FieldSelector
		{...common}
		options={schema.fields}
		value={rule.field}
		title={schema.translations.fields?.title}
		className={schema.classnames.fields}
		onChange={onFieldChange}
	/>
	{#if matchModes && MatchModeEditor}
		<MatchModeEditor
			{...common}
			options={matchModes}
			matchMode={matchInfo?.mode ?? 'all'}
			matchThreshold={matchInfo?.threshold}
			title={schema.translations.matchMode?.title}
			className={schema.classnames.matchMode}
			onChangeMode={onMatchModeChange}
			onChangeThreshold={onMatchThresholdChange}
		/>
	{/if}
	<OperatorSelector
		{...common}
		options={operators}
		value={rule.operator}
		title={schema.translations.operators?.title}
		className={schema.classnames.operators}
		onChange={onOperatorChange}
	/>
	{#if showValueSource && ValueSourceSelector}
		<ValueSourceSelector
			{...common}
			options={valueSources}
			value={(rule.valueSource as string | undefined) ?? 'value'}
			title={schema.translations.valueSourceSelector?.title}
			className={schema.classnames.valueSource}
			onChange={onValueSourceChange}
		/>
	{/if}
	{#if ValueEditor}
		<ValueEditor
			{...common}
			field={rule.field}
			operator={rule.operator}
			value={rule.value}
			valueSource={(rule.valueSource as 'value' | 'field' | undefined) ?? 'value'}
			type={valueEditorType}
			inputType={inputType}
			values={values}
			rule={rule}
			listsAsArrays={schema.listsAsArrays}
			title={schema.translations.value?.title}
			className={schema.classnames.value}
			onChange={onValueChange}
		/>
	{/if}
	{#if schema.showCloneButtons && CloneAction}
		<CloneAction
			{...common}
			label={schema.translations.cloneRule?.label}
			title={schema.translations.cloneRule?.title}
			className={schema.classnames.cloneRule}
			ruleOrGroup={rule}
			onClick={onClone}
		/>
	{/if}
	{#if schema.showLockButtons && LockAction}
		<LockAction
			{...common}
			disabled={false}
			label={ruleDisabled
				? schema.translations.lockRuleDisabled?.label
				: schema.translations.lockRule?.label}
			title={ruleDisabled
				? schema.translations.lockRuleDisabled?.title
				: schema.translations.lockRule?.title}
			className={schema.classnames.lockRule}
			ruleOrGroup={rule}
			onClick={onToggleLock}
		/>
	{/if}
	{#if schema.showMuteButtons && MuteAction}
		<MuteAction
			{...common}
			label={ruleMuted
				? schema.translations.unmuteRule?.label
				: schema.translations.muteRule?.label}
			title={ruleMuted
				? schema.translations.unmuteRule?.title
				: schema.translations.muteRule?.title}
			className={schema.classnames.muteRule}
			ruleOrGroup={rule}
			onClick={onToggleMute}
		/>
	{/if}
	{#if RemoveAction}
		<RemoveAction
			{...common}
			label={schema.translations.removeRule?.label}
			title={schema.translations.removeRule?.title}
			className={schema.classnames.removeRule}
			ruleOrGroup={rule}
			onClick={onRemove}
		/>
	{/if}
</div>
