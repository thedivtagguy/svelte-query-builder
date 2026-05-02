<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { RuleGroupType } from '$lib/types.js';
	import { fields } from './fields.js';
	import UppercaseValueEditor from '../UppercaseValueEditor.svelte';

	let query = $state<RuleGroupType>({
		combinator: 'and',
		rules: [{ field: 'firstName', operator: '=', value: 'STEVE' }],
	});
</script>

<div class="bg-card/70 border-border/60 mb-6 rounded-lg border p-4">
	<QueryBuilder bind:query {fields} controls={{ valueEditor: UppercaseValueEditor }} />
</div>
