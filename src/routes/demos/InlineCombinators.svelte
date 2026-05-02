<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { RuleGroupType, RuleGroupTypeIC } from '$lib/types.js';
	import { fields } from './fields.js';
	import { fmt } from './format.js';

	let query: RuleGroupType | RuleGroupTypeIC = $state<RuleGroupTypeIC>({
		rules: [
			{ field: 'firstName', operator: '=', value: 'Steve' },
			'or',
			{ field: 'lastName', operator: '=', value: 'Vai' },
			'and',
			{ field: 'age', operator: '<', value: 60 },
		],
	}) as RuleGroupType | RuleGroupTypeIC;
</script>

<div class="bg-card/70 border-border/60 mb-3 rounded-lg border p-4">
	<QueryBuilder bind:query {fields} independentCombinators showCloneButtons />
</div>

<pre
	class="bg-muted/40 border-border/60 mb-6 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{fmt(
		query,
		'sql'
	)}</pre>
