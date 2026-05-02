<script lang="ts">
	import type { RuleGroupType } from '$lib/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { fields } from './fields.js';
	import HeadlessDemo from '../HeadlessDemo.svelte';

	let query = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: '=', value: 'Plain HTML' },
			{ field: 'age', operator: '>', value: 18 },
		],
	});

	const orchestratorSrc = `<script lang="ts">
  import { QueryBuilder } from 'svelte-query-builder';
  import HeadlessSelect from './HeadlessSelect.svelte';
  import HeadlessInput  from './HeadlessInput.svelte';
  import HeadlessButton from './HeadlessButton.svelte';

  let { fields, query = $bindable() } = $props();
</` + `script>

<QueryBuilder
  bind:query
  {fields}
  controls={{
    combinatorSelector: HeadlessSelect,
    fieldSelector:      HeadlessSelect,
    operatorSelector:   HeadlessSelect,
    valueSelector:      HeadlessSelect,
    valueEditor:        HeadlessInput,
    actionElement:      HeadlessButton,
    addRuleAction:      HeadlessButton,
    addGroupAction:     HeadlessButton,
    removeRuleAction:   HeadlessButton,
    removeGroupAction:  HeadlessButton,
  }}
/>`;

	const selectSrc = `<script lang="ts">
  import type { ValueSelectorProps } from 'svelte-query-builder';

  let { options, value, disabled, onChange }: ValueSelectorProps = $props();
</` + `script>

<select
  value={value ?? ''}
  {disabled}
  onchange={(e) => onChange(e.currentTarget.value)}
>
  {#each options as opt (opt.value)}
    <option value={String(opt.value)}>{opt.label}</option>
  {/each}
</select>`;

	const inputSrc = `<script lang="ts">
  import type { ValueEditorProps } from 'svelte-query-builder';

  let { value, inputType, disabled, onChange }: ValueEditorProps = $props();
</` + `script>

<input
  type={inputType ?? 'text'}
  value={value == null ? '' : String(value)}
  {disabled}
  oninput={(e) => onChange(e.currentTarget.value)}
/>`;

	const buttonSrc = `<script lang="ts">
  import type { ActionProps } from 'svelte-query-builder';

  let { label, title, disabled, onClick }: ActionProps = $props();
</` + `script>

<button
  type="button"
  {disabled}
  {title}
  onclick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(e); }}
>
  {label ?? ''}
</button>`;
</script>

<div class="bg-card/70 border-border/60 mb-3 rounded-lg border p-4">
	<HeadlessDemo {fields} bind:query />
</div>

<Tabs.Root value="orchestrator" class="mb-6">
	<Tabs.List class="bg-muted/50 mb-2">
		<Tabs.Trigger value="orchestrator">Orchestrator</Tabs.Trigger>
		<Tabs.Trigger value="select">Select</Tabs.Trigger>
		<Tabs.Trigger value="input">Input</Tabs.Trigger>
		<Tabs.Trigger value="button">Button</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="orchestrator">
		<pre
			class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{orchestratorSrc}</pre>
	</Tabs.Content>
	<Tabs.Content value="select">
		<pre
			class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{selectSrc}</pre>
	</Tabs.Content>
	<Tabs.Content value="input">
		<pre
			class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{inputSrc}</pre>
	</Tabs.Content>
	<Tabs.Content value="button">
		<pre
			class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{buttonSrc}</pre>
	</Tabs.Content>
</Tabs.Root>
