<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { cn } from '$lib/utils.js';
	import type { NotToggleProps } from '../../types.js';

	let {
		checked = false,
		label = 'Not',
		title,
		className,
		disabled,
		onChange,
	}: NotToggleProps = $props();

	const local = $derived(!!checked);

	function handle(next: boolean) {
		if (next === local) return;
		onChange(next);
	}
</script>

<label
	class={cn('inline-flex items-center gap-2 text-sm', className)}
	{title}
	data-rqb-element="not-toggle"
>
	<Switch checked={local} onCheckedChange={handle} {disabled} />
	<span class="select-none">{label}</span>
</label>
