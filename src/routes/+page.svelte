<script lang="ts">
	import { QueryBuilder, formatQuery } from '$lib/index.js';
	import type {
		Field,
		QueryValidator,
		RuleGroupType,
		RuleGroupTypeIC,
		RuleType,
		ValidationMap,
	} from '$lib/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ModeWatcher, toggleMode, mode } from 'mode-watcher';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	// ────────── Shared field schema ──────────
	const fields: Field[] = [
		{ name: 'firstName', label: 'First name' },
		{ name: 'lastName', label: 'Last name' },
		{ name: 'age', label: 'Age', inputType: 'number' },
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
				{ name: 'Bass', label: 'Bass' },
			],
		},
		{
			name: 'startDate',
			label: 'Start date',
			inputType: 'date',
			valueSources: ['value', 'field'],
		},
		{
			name: 'endDate',
			label: 'End date',
			inputType: 'date',
			valueSources: ['value', 'field'],
		},
	];

	// ────────── Tab 1: Basic ──────────
	let basicQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'Ste' },
			{ field: 'age', operator: '>', value: 28 },
		],
	});

	// ────────── Tab 2: Independent combinators ──────────
	let icQuery: RuleGroupType | RuleGroupTypeIC = $state<RuleGroupTypeIC>({
		rules: [
			{ field: 'firstName', operator: '=', value: 'Steve' },
			'or',
			{ field: 'lastName', operator: '=', value: 'Vai' },
			'and',
			{ field: 'age', operator: '<', value: 60 },
		],
	}) as RuleGroupType | RuleGroupTypeIC;

	// ────────── Tab 3: Lock & mute ──────────
	let lockMuteQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ id: 'r-locked', field: 'firstName', operator: '=', value: 'Steve', disabled: true },
			{ id: 'r-muted', field: 'lastName', operator: '=', value: 'Vai', muted: true },
			{
				id: 'g-nested',
				combinator: 'or',
				rules: [
					{ field: 'instrument', operator: '=', value: 'Guitar' },
					{ field: 'instrument', operator: '=', value: 'Bass' },
				],
			},
		],
	});

	// ────────── Tab 4: Validation ──────────
	let validationQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ id: 'r1', field: 'firstName', operator: '=', value: '' },
			{ id: 'r2', field: 'age', operator: 'between', value: '20,40' },
			{ id: 'r3', field: 'instrument', operator: '=', value: 'Piano' },
		],
	});
	const validator: QueryValidator = (q) => {
		const map: ValidationMap = {};
		type Node = RuleType | { rules: Array<Node | string>; id?: string };
		const walk = (node: Node) => {
			if ('rules' in node) {
				for (const r of node.rules) {
					if (typeof r !== 'string') walk(r as Node);
				}
			} else {
				const v = (node as RuleType).value;
				const empty = v === '' || v == null;
				if (node.id) map[node.id] = empty ? { valid: false, reasons: ['empty'] } : true;
			}
		};
		walk(q as Node);
		return map;
	};

	// ────────── Tab 5: Value sources (value/field) ──────────
	let valueSourcesQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'startDate', operator: '<=', value: 'endDate', valueSource: 'field' },
			{ field: 'age', operator: '>', value: 18 },
		],
	});

	// ────────── Tab 6: Match modes ──────────
	const matchFields: Field[] = [
		...fields,
		{
			name: 'phones',
			label: 'Phone numbers',
			matchModes: true, // enable all match modes for this array field
		},
	];
	let matchQuery = $state<RuleGroupType>({
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

	// ────────── Tab 7: Between & multiselect ──────────
	let betweenQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'age', operator: 'between', value: '21,65' },
			{ field: 'instrument', operator: 'in', value: 'Guitar,Piano' },
		],
	});

	// ────────── Tab 8: Shift actions ──────────
	let shiftQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: '=', value: 'A' },
			{ field: 'lastName', operator: '=', value: 'B' },
			{ field: 'age', operator: '>', value: 30 },
			{ field: 'instrument', operator: '=', value: 'Guitar' },
		],
	});

	// ────────── Tab 9: Drag & drop ──────────
	let dndQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ id: 'd-1', field: 'firstName', operator: '=', value: 'Drag me' },
			{ id: 'd-2', field: 'lastName', operator: '=', value: '...around' },
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

	// ────────── Tab 10: Custom theming via classnames ──────────
	let themedQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'A' },
			{ field: 'age', operator: '>', value: 21 },
		],
	});
	const themedClassnames = {
		queryBuilder:
			'border-2 border-dashed border-primary/40 bg-primary/5 rounded-xl shadow-md',
		ruleGroup: 'border-primary/20 bg-background/50 backdrop-blur-sm',
		header: 'border-b border-primary/10 pb-3 mb-1',
		rule: 'rounded-md bg-card hover:bg-muted/40 transition-colors px-2',
		body: 'border-l-4 border-l-primary/30',
		addRule: 'text-primary',
		addGroup: 'text-primary',
		removeRule: 'text-destructive',
		removeGroup: 'text-destructive',
	};

	// ────────── Tab 11: Custom layout via snippets ──────────
	let snippetQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'S' },
			{ field: 'age', operator: '>', value: 30 },
		],
	});

	// ────────── Tab 12: Custom controls (override valueEditor) ──────────
	let customQuery = $state<RuleGroupType>({
		combinator: 'and',
		rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
	});

	// ────────── Helpers ──────────
	function fmt(q: unknown, format: string) {
		try {
			// formatQuery's overloads require literal format strings; cast through never
			// because the demo iterates over format names dynamically.
			const out = formatQuery(q as never, format as never);
			return typeof out === 'string' ? out : JSON.stringify(out, null, 2);
		} catch (e) {
			return `// ${(e as Error).message}`;
		}
	}
</script>

<ModeWatcher />

<div class="bg-background text-foreground min-h-screen">
	<header class="border-b">
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
			<div class="flex items-center gap-3">
				<SparklesIcon class="text-primary size-5" />
				<div>
					<h1 class="text-lg font-semibold tracking-tight">svelte-query-builder</h1>
					<p class="text-muted-foreground text-xs">
						Visual rule builder for Svelte 5 — full feature parity with react-querybuilder
					</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Badge variant="outline" class="font-mono text-xs">v0.0.1</Badge>
				<Button variant="ghost" size="icon-sm" onclick={() => toggleMode()} aria-label="Toggle theme">
					{#if mode.current === 'dark'}
						<SunIcon />
					{:else}
						<MoonIcon />
					{/if}
				</Button>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl p-4 pb-16">
		<Tabs.Root value="basic" class="gap-6">
			<div class="overflow-x-auto">
				<Tabs.List class="flex h-9 w-max items-center gap-1 rounded-md bg-muted p-1">
					<Tabs.Trigger value="basic">Basic</Tabs.Trigger>
					<Tabs.Trigger value="ic">IC</Tabs.Trigger>
					<Tabs.Trigger value="lock">Lock &amp; mute</Tabs.Trigger>
					<Tabs.Trigger value="validation">Validation</Tabs.Trigger>
					<Tabs.Trigger value="sources">Value sources</Tabs.Trigger>
					<Tabs.Trigger value="match">Match modes</Tabs.Trigger>
					<Tabs.Trigger value="between">Between &amp; multi</Tabs.Trigger>
					<Tabs.Trigger value="shift">Shift</Tabs.Trigger>
					<Tabs.Trigger value="dnd">Drag &amp; drop</Tabs.Trigger>
					<Tabs.Trigger value="theme">Theming</Tabs.Trigger>
					<Tabs.Trigger value="snippets">Snippets</Tabs.Trigger>
					<Tabs.Trigger value="controls">Custom controls</Tabs.Trigger>
					<Tabs.Trigger value="formats">Output formats</Tabs.Trigger>
				</Tabs.List>
			</div>

			<!-- ──────── Basic ──────── -->
			<Tabs.Content value="basic" class="space-y-4">
				<QueryBuilder bind:query={basicQuery} {fields} showCloneButtons showNotToggle />
				<div class="grid gap-2 md:grid-cols-2">
					<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(basicQuery, 'sql')}</pre>
					<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(basicQuery, 'mongodb_query')}</pre>
				</div>
			</Tabs.Content>

			<!-- ──────── Independent combinators ──────── -->
			<Tabs.Content value="ic" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Each rule is followed by its own combinator. The same query can be built without nesting groups.
				</p>
				<QueryBuilder bind:query={icQuery} {fields} independentCombinators showCloneButtons />
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(icQuery, 'sql')}</pre>
			</Tabs.Content>

			<!-- ──────── Lock & mute ──────── -->
			<Tabs.Content value="lock" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Locked rules can't be edited. Muted rules stay in the tree but are excluded from the formatted
					output.
				</p>
				<QueryBuilder
					bind:query={lockMuteQuery}
					{fields}
					showLockButtons
					showMuteButtons
					showCloneButtons
				/>
				<div class="grid gap-2 md:grid-cols-2">
					<div>
						<p class="text-muted-foreground mb-1 text-xs uppercase tracking-wider">SQL (excludes muted)</p>
						<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(lockMuteQuery, 'sql')}</pre>
					</div>
					<div>
						<p class="text-muted-foreground mb-1 text-xs uppercase tracking-wider">JSON (full tree)</p>
						<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{JSON.stringify(lockMuteQuery, null, 2)}</pre>
					</div>
				</div>
			</Tabs.Content>

			<!-- ──────── Validation ──────── -->
			<Tabs.Content value="validation" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Empty values are flagged invalid; rules and groups gain
					<code class="bg-muted rounded px-1">queryBuilder-invalid</code> /
					<code class="bg-muted rounded px-1">queryBuilder-valid</code> classes.
				</p>
				<QueryBuilder
					bind:query={validationQuery}
					{fields}
					{validator}
					controlClassnames={{
						invalid:
							'rounded-md outline-2 outline-offset-2 outline-destructive bg-destructive/5',
						valid: 'rounded-md outline-1 outline-offset-2 outline-primary/20',
					}}
				/>
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(validationQuery, 'sql')}</pre>
			</Tabs.Content>

			<!-- ──────── Value sources ──────── -->
			<Tabs.Content value="sources" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Fields with <code class="bg-muted rounded px-1">valueSources: ['value', 'field']</code> let you
					compare against another field instead of a literal.
				</p>
				<QueryBuilder bind:query={valueSourcesQuery} fields={fields} />
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(valueSourcesQuery, 'sql')}</pre>
			</Tabs.Content>

			<!-- ──────── Match modes ──────── -->
			<Tabs.Content value="match" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Array-typed fields can match by mode (<code class="bg-muted rounded px-1">all</code> /
					<code class="bg-muted rounded px-1">some</code> /
					<code class="bg-muted rounded px-1">none</code> /
					<code class="bg-muted rounded px-1">atLeast</code> /
					<code class="bg-muted rounded px-1">atMost</code> /
					<code class="bg-muted rounded px-1">exactly</code>) with a threshold for the count modes.
				</p>
				<QueryBuilder bind:query={matchQuery} fields={matchFields} />
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{JSON.stringify(matchQuery, null, 2)}</pre>
			</Tabs.Content>

			<!-- ──────── Between & multi ──────── -->
			<Tabs.Content value="between" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					<code class="bg-muted rounded px-1">between</code> gives a dual input;
					<code class="bg-muted rounded px-1">in</code> / <code class="bg-muted rounded px-1">notIn</code>
					accept comma-separated values.
				</p>
				<QueryBuilder bind:query={betweenQuery} {fields} />
				<div class="grid gap-2 md:grid-cols-2">
					<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(betweenQuery, 'sql')}</pre>
					<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(betweenQuery, 'parameterized')}</pre>
				</div>
			</Tabs.Content>

			<!-- ──────── Shift actions ──────── -->
			<Tabs.Content value="shift" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Use the up/down chevrons to reorder rules by keyboard or click.
				</p>
				<QueryBuilder bind:query={shiftQuery} {fields} showShiftActions />
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(shiftQuery, 'sql')}</pre>
			</Tabs.Content>

			<!-- ──────── Drag & drop ──────── -->
			<Tabs.Content value="dnd" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Grab a rule or nested group and drop it elsewhere. Drag-and-drop also works across nested groups.
				</p>
				<QueryBuilder bind:query={dndQuery} {fields} enableDragAndDrop showCloneButtons />
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(dndQuery, 'sql')}</pre>
			</Tabs.Content>

			<!-- ──────── Theming ──────── -->
			<Tabs.Content value="theme" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Override per-element classes via <code class="bg-muted rounded px-1">controlClassnames</code>. Toggle
					the theme button in the header to see dark mode.
				</p>
				<QueryBuilder bind:query={themedQuery} {fields} controlClassnames={themedClassnames} />
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(themedQuery, 'sql')}</pre>
			</Tabs.Content>

			<!-- ──────── Snippets ──────── -->
			<Tabs.Content value="snippets" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					<code class="bg-muted rounded px-1">header</code> and
					<code class="bg-muted rounded px-1">footer</code> snippets let you inject custom layout above and
					below the rule tree without subclassing anything.
				</p>
				<QueryBuilder bind:query={snippetQuery} {fields}>
					{#snippet header({ schema })}
						<div
							class="from-primary/15 via-primary/5 flex items-center justify-between rounded-md bg-gradient-to-r to-transparent p-3"
						>
							<div class="flex items-center gap-2">
								<HeartIcon class="text-primary size-4" />
								<span class="text-sm font-medium">Custom header</span>
								<Badge variant="secondary" class="text-[10px]"
									>{schema.fields.length} fields</Badge
								>
							</div>
							<span class="text-muted-foreground font-mono text-[10px]">qbId: {schema.qbId.slice(0, 8)}</span>
						</div>
					{/snippet}
					{#snippet footer({ query })}
						<div class="bg-muted/40 rounded-md border border-dashed p-3">
							<p class="text-muted-foreground mb-1 text-[10px] uppercase tracking-wider">
								Live preview from footer snippet
							</p>
							<code class="text-xs">{fmt(query, 'sql')}</code>
						</div>
					{/snippet}
				</QueryBuilder>
			</Tabs.Content>

			<!-- ──────── Custom controls ──────── -->
			<Tabs.Content value="controls" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					Replace any default control by passing a Svelte component to
					<code class="bg-muted rounded px-1">controls</code>. Below, the value editor is replaced with a
					custom one that uppercases on input.
				</p>
				<QueryBuilder
					bind:query={customQuery}
					{fields}
					controls={{ valueEditor: UppercaseValueEditor }}
				/>
				<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{fmt(customQuery, 'sql')}</pre>
			</Tabs.Content>

			<!-- ──────── Output formats ──────── -->
			<Tabs.Content value="formats" class="space-y-4">
				<p class="text-muted-foreground text-sm">
					The same query, exported through every supported format.
				</p>
				<QueryBuilder bind:query={basicQuery} {fields} />
				<div class="grid gap-3 md:grid-cols-2">
					{#each ['sql', 'parameterized', 'parameterized_named', 'mongodb_query', 'jsonlogic', 'cel', 'spel', 'jsonata', 'elasticsearch', 'natural_language', 'ldap', 'json_without_ids'] as fmtName (fmtName)}
						<div>
							<p class="text-muted-foreground mb-1 text-[10px] uppercase tracking-wider">{fmtName}</p>
							<pre class="bg-muted overflow-auto rounded-md p-3 text-[11px]">{fmt(basicQuery, fmtName as never)}</pre>
						</div>
					{/each}
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<Separator class="my-10" />

		<footer class="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
			<span>Default UI: shadcn-svelte + bits-ui + tailwind v4</span>
			<span>Built on @react-querybuilder/core (MIT)</span>
		</footer>
	</main>
</div>

<script lang="ts" module>
	import type { ValueEditorProps } from '$lib/types.js';
	import type { Component } from 'svelte';
	import UppercaseValueEditorImpl from './UppercaseValueEditor.svelte';

	const UppercaseValueEditor: Component<ValueEditorProps> = UppercaseValueEditorImpl;
</script>
