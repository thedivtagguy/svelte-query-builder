<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils.js';
	import type { ValueEditorProps } from '$lib/types.js';
	import WandIcon from '@lucide/svelte/icons/wand-sparkles';

	let { value, title, className, disabled, onChange }: ValueEditorProps = $props();

	const stringValue = $derived(value == null ? '' : String(value));
</script>

<span class={cn('relative inline-flex items-center', className)} data-rqb-element="value-editor">
	<WandIcon class="text-primary pointer-events-none absolute left-2 size-3.5" />
	<Input
		type="text"
		class="w-44 pl-7 font-mono uppercase tracking-wider"
		{title}
		{disabled}
		value={stringValue}
		oninput={(e) => onChange((e.currentTarget as HTMLInputElement).value.toUpperCase())}
	/>
</span>
