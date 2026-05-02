<script lang="ts">
	import type { ValueSelectorProps } from '$lib/types.js';

	let { options, value, disabled, title, onChange }: ValueSelectorProps = $props();
</script>

<select
	value={value ?? ''}
	{disabled}
	{title}
	onchange={(e) => onChange((e.currentTarget as HTMLSelectElement).value)}
	class="hl-select"
>
	{#each options as opt}
		{#if 'options' in opt}
			<optgroup label={(opt as { label?: string }).label}>
				{#each (opt as { options: { value: string; label: string }[] }).options as o (o.value)}
					<option value={String(o.value)}>{o.label}</option>
				{/each}
			</optgroup>
		{:else}
			<option value={String((opt as { value: string }).value)}>
				{(opt as { label: string }).label}
			</option>
		{/if}
	{/each}
</select>

<style>
	.hl-select {
		font: inherit;
		padding: 0.25rem 0.5rem;
		border: 1px solid color-mix(in oklch, currentColor 25%, transparent);
		background: var(--background);
		color: inherit;
		border-radius: 0;
	}
	.hl-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
