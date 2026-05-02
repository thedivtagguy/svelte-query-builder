<script lang="ts">
	import { findPath } from '@react-querybuilder/core';
	import type { Path, RuleType } from '@react-querybuilder/core';
	import { getQueryBuilderContext } from '../../state/context.js';
	import { cn } from '$lib/utils.js';

	let { path }: { path: Path } = $props();

	const ctx = getQueryBuilderContext();
	const { state, schema } = ctx;

	// Re-derive the rule from the live query on every reactive read.
	const rule = $derived(findPath(path, state.query) as RuleType);

	const valueEditorType = $derived(
		schema.getValueEditorType(rule.field, rule.operator),
	);
	const inputType = $derived(schema.getInputType(rule.field, rule.operator));
	const operators = $derived(schema.getOperators(rule.field));
	const values = $derived(schema.getValues(rule.field, rule.operator));

	function onFieldChange(next: string) {
		state.updateProp(path, 'field', next);
	}
	function onOperatorChange(next: string) {
		state.updateProp(path, 'operator', next);
	}
	function onValueChange(next: unknown) {
		state.updateProp(path, 'value', next);
	}
	function onClone() {
		state.cloneNode(path);
	}
	function onRemove() {
		state.removeNode(path);
	}

	const FieldSelector = $derived(schema.controls.fieldSelector);
	const OperatorSelector = $derived(schema.controls.operatorSelector);
	const ValueEditor = $derived(schema.controls.valueEditor);
	const CloneAction = $derived(schema.controls.cloneRuleAction);
	const RemoveAction = $derived(schema.controls.removeRuleAction);

	const common = $derived({
		path,
		level: path.length,
		schema,
	});
</script>

<div
	class={cn('svelte-rqb-rule flex flex-wrap items-center gap-2 py-1.5', schema.classnames.rule)}
	data-rqb-element="rule"
	data-level={path.length}
	data-path={JSON.stringify(path)}
>
	<FieldSelector
		{...common}
		options={schema.fields}
		value={rule.field}
		title={schema.translations.fields?.title}
		className={schema.classnames.fields}
		onChange={onFieldChange}
	/>
	<OperatorSelector
		{...common}
		options={operators}
		value={rule.operator}
		title={schema.translations.operators?.title}
		className={schema.classnames.operators}
		onChange={onOperatorChange}
	/>
	{#if ValueEditor}
		<ValueEditor
			{...common}
			field={rule.field}
			operator={rule.operator}
			value={rule.value}
			type={valueEditorType}
			inputType={inputType}
			values={values}
			rule={rule}
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
