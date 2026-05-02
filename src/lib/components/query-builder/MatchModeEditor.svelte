<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import ValueSelector from './ValueSelector.svelte';
	import { cn } from '$lib/utils.js';
	import type { MatchMode } from '@react-querybuilder/core';
	import type { MatchModeEditorProps } from '../../types.js';

	let {
		options,
		matchMode,
		matchThreshold,
		title,
		className,
		disabled,
		onChangeMode,
		onChangeThreshold,
		path,
		level,
		schema,
	}: MatchModeEditorProps = $props();

	const showThreshold = $derived(
		matchMode === 'atLeast' || matchMode === 'atMost' || matchMode === 'exactly',
	);
</script>

<span
	class={cn('inline-flex items-center gap-2', className)}
	data-rqb-element="match-mode-editor"
>
	<ValueSelector
		{options}
		value={matchMode}
		title={title ?? 'Match mode'}
		{disabled}
		onChange={(v) => onChangeMode(v as MatchMode)}
		{path}
		{level}
		{schema}
	/>
	{#if showThreshold}
		<Input
			type="number"
			min={0}
			class="w-20"
			value={matchThreshold ?? 1}
			oninput={(e) => onChangeThreshold(Number((e.currentTarget as HTMLInputElement).value))}
			{disabled}
			aria-label="Match threshold"
		/>
	{/if}
</span>
