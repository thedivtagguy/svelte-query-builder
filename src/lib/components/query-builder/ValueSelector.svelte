<script lang="ts" module>
	import type { FullOption, FullOptionList, OptionGroup } from '@react-querybuilder/core';

	function optKey(opt: unknown): string {
		const o = opt as { value?: string; name?: string };
		return String(o.value ?? o.name ?? '');
	}

	function groupKey(g: unknown): string {
		const o = g as { label?: string };
		return String(o.label ?? '');
	}

	function selectedLabel(value: string, options: FullOptionList<FullOption>): string {
		if (!value) return '';
		for (const item of options) {
			if ('options' in item && Array.isArray((item as OptionGroup<FullOption>).options)) {
				for (const opt of (item as OptionGroup<FullOption>).options) {
					if (String(opt.value) === value) return String(opt.label ?? value);
				}
			} else {
				const opt = item as FullOption;
				if (String(opt.value) === value) return String(opt.label ?? value);
			}
		}
		return value;
	}
</script>

<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils.js';
	import { isFlexibleOptionGroupArray } from '@react-querybuilder/core';
	import type { FullOption as FullOptionT, OptionGroup as OptionGroupT } from '@react-querybuilder/core';
	import type { ValueSelectorProps } from '../../types.js';

	let {
		options,
		value,
		title,
		className,
		disabled,
		onChange,
	}: ValueSelectorProps = $props();

	const selected = $derived(value ?? '');
	const isGrouped = $derived(isFlexibleOptionGroupArray(options as never));

	function handleChange(next: string | undefined) {
		const v = next ?? '';
		if (v === selected) return;
		onChange(v);
	}
</script>

<Select.Root type="single" value={selected} onValueChange={handleChange} {disabled}>
	<Select.Trigger
		class={cn('svelte-rqb-value-selector w-auto min-w-32', className)}
		{title}
		data-rqb-element="value-selector"
	>
		{selectedLabel(selected, options)}
	</Select.Trigger>
	<Select.Content>
		{#if isGrouped}
			{#each options as group (groupKey(group))}
				<Select.Group>
					<Select.GroupHeading>{(group as OptionGroupT).label}</Select.GroupHeading>
					{#each (group as OptionGroupT<FullOptionT>).options as opt (opt.value)}
						<Select.Item value={String(opt.value)} label={opt.label}>{opt.label}</Select.Item>
					{/each}
				</Select.Group>
			{/each}
		{:else}
			{#each options as opt (optKey(opt))}
				<Select.Item
					value={String((opt as FullOptionT).value)}
					label={(opt as FullOptionT).label}
				>
					{(opt as FullOptionT).label}
				</Select.Item>
			{/each}
		{/if}
	</Select.Content>
</Select.Root>
