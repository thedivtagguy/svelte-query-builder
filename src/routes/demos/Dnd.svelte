<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { RuleGroupType } from '$lib/types.js';
	import { fields } from './fields.js';

	let query = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ id: 'd-1', field: 'firstName', operator: '=', value: 'Drag me' },
			{ id: 'd-2', field: 'lastName', operator: '=', value: 'Or me' },
			{
				id: 'd-grp',
				combinator: 'or',
				rules: [
					{ id: 'd-3', field: 'age', operator: '>', value: 18 },
					{ id: 'd-4', field: 'age', operator: '<', value: 99 },
				],
			},
		],
	});
</script>

<div class="bg-card/70 border-border/60 mb-6 rounded-lg border p-4">
	<QueryBuilder bind:query {fields} enableDragAndDrop showCloneButtons />
</div>
