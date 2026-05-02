<script lang="ts">
	import { QueryBuilder, formatQuery } from '$lib/index.js';
	import type { Field, RuleGroupType } from '$lib/types.js';

	const fields: Field[] = [
		{ name: 'firstName', label: 'First name' },
		{ name: 'lastName', label: 'Last name' },
		{
			name: 'age',
			label: 'Age',
			inputType: 'number',
		},
		{
			name: 'isMusician',
			label: 'Is a musician',
			valueEditorType: 'checkbox',
			defaultValue: false,
		},
		{
			name: 'instrument',
			label: 'Instrument',
			valueEditorType: 'select',
			values: [
				{ name: 'Guitar', label: 'Guitar' },
				{ name: 'Piano', label: 'Piano' },
				{ name: 'Drums', label: 'Drums' },
			],
		},
	];

	const initialQuery: RuleGroupType = {
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'Ste' },
			{ field: 'age', operator: '>', value: 28 },
			{
				combinator: 'or',
				rules: [
					{ field: 'instrument', operator: '=', value: 'Guitar' },
					{ field: 'instrument', operator: '=', value: 'Piano' },
				],
			},
		],
	};

	let query = $state<RuleGroupType>(initialQuery);

	const sql = $derived.by(() => {
		try {
			return formatQuery(query, 'sql');
		} catch (e) {
			return `-- error: ${(e as Error).message}`;
		}
	});

	const json = $derived(JSON.stringify(query, null, 2));

	function getValueEditorType(_field: string, _operator: string) {
		const f = fields.find((x) => x.name === _field);
		return (f as { valueEditorType?: 'text' | 'select' | 'checkbox' | 'switch' | 'textarea' })
			?.valueEditorType ?? 'text';
	}
	function getInputType(_field: string, _operator: string) {
		const f = fields.find((x) => x.name === _field);
		return (f as { inputType?: 'text' | 'number' })?.inputType ?? 'text';
	}
	function getValues(_field: string, _operator: string) {
		const f = fields.find((x) => x.name === _field) as
			| { values?: { name: string; label: string }[] }
			| undefined;
		return f?.values ?? [];
	}
</script>

<main class="mx-auto flex max-w-4xl flex-col gap-6 p-6">
	<header>
		<h1 class="text-2xl font-semibold">svelte-query-builder</h1>
		<p class="text-muted-foreground text-sm">
			A Svelte 5 port of react-querybuilder, powered by shadcn-svelte.
		</p>
	</header>

	<section>
		<QueryBuilder
			bind:query
			{fields}
			showCloneButtons
			showNotToggle
			{getValueEditorType}
			{getInputType}
			{getValues}
		/>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">SQL</h2>
		<pre class="bg-muted rounded-md p-3 text-xs overflow-auto">{sql}</pre>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">JSON</h2>
		<pre class="bg-muted rounded-md p-3 text-xs overflow-auto">{json}</pre>
	</section>
</main>
