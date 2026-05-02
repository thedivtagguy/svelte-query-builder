<script lang="ts">
	import type { ActionProps } from '$lib/types.js';

	let { label, title, disabled, onClick }: ActionProps = $props();
</script>

<button
	type="button"
	{disabled}
	{title}
	onclick={(e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) onClick(e);
	}}
	class="hl-btn"
>
	{label ?? ''}
</button>

<style>
	.hl-btn {
		font: inherit;
		padding: 0.25rem 0.6rem;
		border: 1px solid color-mix(in oklch, currentColor 25%, transparent);
		background: transparent;
		color: inherit;
		cursor: pointer;
		border-radius: 0;
	}
	.hl-btn:hover:not(:disabled) {
		background: color-mix(in oklch, currentColor 8%, transparent);
	}
	.hl-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
