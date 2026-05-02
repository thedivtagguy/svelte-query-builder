<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { RuleGroupType, RuleType } from '$lib/types.js';
	import { matchFields } from './fields.js';

	let query = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{
				field: 'phones',
				operator: 'contains',
				value: '555',
				match: { mode: 'atLeast', threshold: 2 },
			} as RuleType,
		],
	});
</script>

<div class="bg-card/70 border-border/60 mb-3 rounded-lg border p-4">
	<QueryBuilder bind:query fields={matchFields} />
</div>

<pre
	class="bg-muted/40 border-border/60 mb-6 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{JSON.stringify(
		query,
		null,
		2
	)}</pre>
