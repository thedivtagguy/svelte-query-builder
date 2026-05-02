<script lang="ts">
	import type { ValueEditorProps } from '$lib/types.js';

	let { value, inputType, disabled, title, onChange }: ValueEditorProps = $props();

	const stringValue = $derived(value == null ? '' : String(value));
</script>

<input
	type={inputType === 'number' ? 'number' : (inputType ?? 'text')}
	value={stringValue}
	{disabled}
	{title}
	oninput={(e) => {
		const v = (e.currentTarget as HTMLInputElement).value;
		onChange(inputType === 'number' && v !== '' ? Number(v) : v);
	}}
	class="hl-input"
/>

<style>
	.hl-input {
		font: inherit;
		padding: 0.25rem 0.5rem;
		border: 1px solid color-mix(in oklch, currentColor 25%, transparent);
		background: var(--background);
		color: inherit;
		border-radius: 0;
		width: 12ch;
	}
	.hl-input[type='number'] {
		width: 7ch;
	}
	.hl-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
