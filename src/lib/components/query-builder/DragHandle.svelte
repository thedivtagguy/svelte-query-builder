<script lang="ts">
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import { cn } from '$lib/utils.js';
	import type { DragHandleProps } from '../../types.js';

	let { className, title, label, disabled }: DragHandleProps = $props();
</script>

<span
	class={cn(
		'svelte-rqb-drag-handle text-muted-foreground inline-flex h-7 w-5 cursor-grab items-center justify-center select-none',
		disabled && 'pointer-events-none opacity-50',
		className,
	)}
	role="button"
	tabindex="0"
	aria-label={title ?? 'Drag'}
	title={title ?? 'Drag'}
	data-rqb-element="drag-handle"
	data-rqb-drag-handle
>
	{#if label}
		{label}
	{:else}
		<GripVerticalIcon />
	{/if}
</span>
