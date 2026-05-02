<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { cn } from '$lib/utils.js';
	import type { ShiftActionsProps } from '../../types.js';

	let {
		titles,
		labels,
		className,
		disabled,
		shiftUpDisabled,
		shiftDownDisabled,
		shiftUp,
		shiftDown,
	}: ShiftActionsProps = $props();
</script>

<div
	class={cn('inline-flex flex-col items-center', className)}
	data-rqb-element="shift-actions"
	role="group"
	aria-label="Shift"
>
	<Button
		type="button"
		variant="ghost"
		size="icon-xs"
		title={titles?.shiftUp ?? 'Shift up'}
		aria-label={titles?.shiftUp ?? 'Shift up'}
		disabled={disabled || shiftUpDisabled}
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			shiftUp();
		}}
	>
		{#if labels?.shiftUp}
			{labels.shiftUp}
		{:else}
			<ChevronUpIcon />
		{/if}
	</Button>
	<Button
		type="button"
		variant="ghost"
		size="icon-xs"
		title={titles?.shiftDown ?? 'Shift down'}
		aria-label={titles?.shiftDown ?? 'Shift down'}
		disabled={disabled || shiftDownDisabled}
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			shiftDown();
		}}
	>
		{#if labels?.shiftDown}
			{labels.shiftDown}
		{:else}
			<ChevronDownIcon />
		{/if}
	</Button>
</div>
