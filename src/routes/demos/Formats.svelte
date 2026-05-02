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

	const formatList = [
		'sql',
		'parameterized',
		'parameterized_named',
		'mongodb_query',
		'jsonlogic',
		'cel',
		'spel',
		'jsonata',
		'elasticsearch',
		'natural_language',
		'ldap',
		'json_without_ids',
	];
</script>

<div class="bg-card/70 border-border/60 mb-3 rounded-lg border p-3">
	<QueryBuilder bind:query {fields} />
</div>

<Tabs.Root value="sql" class="mb-6">
	<Tabs.List class="bg-muted/50 mb-2 flex w-full flex-nowrap overflow-x-auto">
		{#each formatList as f (f)}
			<Tabs.Trigger
				value={f}
				class="font-mono text-[0.7rem] tracking-tight whitespace-nowrap lowercase"
			>
				{f}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each formatList as f (f)}
		<Tabs.Content value={f}>
			<pre
				class="bg-muted/40 border-border/60 overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">{fmt(
					query,
					f
				)}</pre>
		</Tabs.Content>
	{/each}
</Tabs.Root>
