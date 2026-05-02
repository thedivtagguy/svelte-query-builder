<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { RuleGroupType } from '$lib/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { fields } from './fields.js';
	import { fmt } from './format.js';

	let query = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'Ste' },
			{ field: 'age', operator: '>', value: 28 },
		],
	});
</script>

<div class="bg-card/70 border-border/60 mb-3 rounded-lg border p-4">
	<QueryBuilder bind:query {fields} showCloneButtons />
</div>

<Tabs.Root value="sql" class="mb-6">
	<Tabs.List class="bg-muted/50 mb-2">
		<Tabs.Trigger value="sql">SQL</Tabs.Trigger>
		<Tabs.Trigger value="mongo">MongoDB</Tabs.Trigger>
		<Tabs.Trigger value="json">JSON</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="sql">
		<pre
			class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{fmt(
				query,
				'sql'
			)}</pre>
	</Tabs.Content>
	<Tabs.Content value="mongo">
		<pre
			class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{fmt(
				query,
				'mongodb_query'
			)}</pre>
	</Tabs.Content>
	<Tabs.Content value="json">
		<pre
			class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{JSON.stringify(
				query,
				null,
				2
			)}</pre>
	</Tabs.Content>
</Tabs.Root>
