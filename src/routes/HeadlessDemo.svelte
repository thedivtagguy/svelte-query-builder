<script lang="ts" module>
	// Three minimal components used as "controls" overrides. Each renders
	// plain HTML — no shadcn-svelte, no bits-ui, no Tailwind utility classes.
	// They prove that the library's UI can be replaced wholesale through the
	// controls prop.
	import HeadlessSelect from './HeadlessSelect.svelte';
	import HeadlessInput from './HeadlessInput.svelte';
	import HeadlessButton from './HeadlessButton.svelte';

	export { HeadlessSelect, HeadlessInput, HeadlessButton };
</script>

<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { Field, RuleGroupType } from '$lib/types.js';

	let { fields, query = $bindable() }: { fields: Field[]; query: RuleGroupType } = $props();
</script>

<div class="headless-skin">
	<QueryBuilder
		bind:query
		{fields}
		controls={{
			combinatorSelector: HeadlessSelect,
			fieldSelector: HeadlessSelect,
			operatorSelector: HeadlessSelect,
			valueSelector: HeadlessSelect,
			valueEditor: HeadlessInput,
			actionElement: HeadlessButton,
			addRuleAction: HeadlessButton,
			addGroupAction: HeadlessButton,
			removeRuleAction: HeadlessButton,
			removeGroupAction: HeadlessButton,
			cloneRuleAction: HeadlessButton,
			cloneGroupAction: HeadlessButton,
		}}
	/>
</div>

<style>
	.headless-skin :global([data-rqb-element='query-builder']) {
		font-family: ui-monospace, 'SF Mono', monospace;
		font-size: 0.82rem;
	}
	.headless-skin :global([data-rqb-element='rule-group']) {
		background: transparent;
		border: 1px solid color-mix(in oklch, var(--foreground) 25%, transparent);
		border-radius: 0;
		padding: 0.75rem;
		box-shadow: none;
	}
	.headless-skin :global([data-rqb-element='rule-group-header']),
	.headless-skin :global([data-rqb-element='rule-group-body']) {
		gap: 0.5rem;
	}
	.headless-skin :global([data-rqb-element='rule-group-body']) {
		border-left: 2px solid color-mix(in oklch, var(--foreground) 18%, transparent);
		padding-left: 0.65rem;
		margin-top: 0.5rem;
	}
	.headless-skin :global([data-rqb-element='rule']) {
		padding: 0.35rem 0;
	}
</style>
