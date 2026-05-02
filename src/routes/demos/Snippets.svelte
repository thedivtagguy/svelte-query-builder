<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { RuleGroupType } from '$lib/types.js';
	import { fields } from './fields.js';
	import { fmt } from './format.js';

	let query = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'S' },
			{ field: 'age', operator: '>', value: 30 },
		],
	});
</script>

<div class="bg-card/70 border-border/60 mb-6 rounded-lg border p-4">
	<QueryBuilder bind:query {fields}>
		{#snippet header({ schema })}
			<div
				class="bg-primary/8 mb-3 flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
			>
				<span class="font-medium">{schema.fields.length} fields</span>
				<span class="text-muted-foreground font-mono text-xs">qb {schema.qbId.slice(0, 8)}</span>
			</div>
		{/snippet}
		{#snippet footer({ query: q })}
			<div class="border-border/60 mt-3 rounded-md border border-dashed px-3 py-2">
				<p
					class="text-muted-foreground mb-1 text-[0.65rem] font-medium tracking-widest uppercase"
				>
					Live SQL preview
				</p>
				<code class="block bg-transparent p-0 font-mono text-xs">{fmt(q, 'sql')}</code>
			</div>
		{/snippet}
	</QueryBuilder>
</div>
