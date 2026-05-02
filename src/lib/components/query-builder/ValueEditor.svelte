<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { cn } from '$lib/utils.js';
	import ValueSelector from './ValueSelector.svelte';
	import type { ValueEditorProps } from '../../types.js';

	let {
		value,
		type = 'text',
		inputType = 'text',
		values,
		title,
		className,
		disabled,
		onChange,
		path,
		level,
		schema,
	}: ValueEditorProps = $props();

	const stringValue = $derived(value == null ? '' : String(value));
	const boolValue = $derived(typeof value === 'boolean' ? value : false);

	function handleString(next: string) {
		if (next === stringValue) return;
		const coerced =
			inputType === 'number' && next !== ''
				? Number.isFinite(Number(next))
					? Number(next)
					: next
				: next;
		onChange(coerced);
	}

	function handleBool(next: boolean) {
		if (next === boolValue) return;
		onChange(next);
	}
</script>

{#if type === 'select'}
	<ValueSelector
		options={values ?? []}
		value={stringValue}
		title={title ?? ''}
		className={className ?? ''}
		{disabled}
		onChange={handleString}
		{path}
		{level}
		{schema}
	/>
{:else if type === 'checkbox'}
	<label
		class={cn('inline-flex items-center', className)}
		{title}
		data-rqb-element="value-editor"
	>
		<Checkbox checked={boolValue} onCheckedChange={handleBool} {disabled} />
	</label>
{:else if type === 'switch'}
	<label
		class={cn('inline-flex items-center', className)}
		{title}
		data-rqb-element="value-editor"
	>
		<Switch checked={boolValue} onCheckedChange={handleBool} {disabled} />
	</label>
{:else if type === 'textarea'}
	<textarea
		class={cn(
			'border-input bg-background dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 min-h-9 rounded-md border px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
			className,
		)}
		{title}
		{disabled}
		value={stringValue}
		oninput={(e) => handleString((e.currentTarget as HTMLTextAreaElement).value)}
		data-rqb-element="value-editor"
	></textarea>
{:else}
	<Input
		type={inputType === 'number' ? 'number' : (inputType ?? 'text')}
		class={cn('w-auto', className)}
		{title}
		{disabled}
		value={stringValue}
		oninput={(e) => handleString((e.currentTarget as HTMLInputElement).value)}
		data-slot="rqb-value-editor"
	/>
{/if}
