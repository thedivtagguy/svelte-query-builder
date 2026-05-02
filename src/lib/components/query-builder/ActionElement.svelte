<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { ActionProps } from '../../types.js';

	let {
		label,
		title,
		className,
		disabled,
		onClick,
	}: ActionProps = $props();

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (disabled) return;
		onClick(event);
	}
</script>

<Button
	type="button"
	variant="outline"
	size="sm"
	class={cn('svelte-rqb-action', className)}
	{disabled}
	{title}
	onclick={handleClick}
	data-rqb-element="action"
>
	{label ?? ''}
</Button>
