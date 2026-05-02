# svelte-query-builder

A Svelte 5 port of [react-querybuilder](https://react-querybuilder.js.org/), powered by [shadcn-svelte](https://shadcn-svelte.com/) and [bits-ui](https://www.bits-ui.com/). Builds visual rule trees and exports them to **23 formats** (SQL, parameterized SQL, MongoDB, JSON Logic, CEL, SpEL, JSONata, Elasticsearch, Cypher, GraphQL, SPARQL, Gremlin, LDAP, Drizzle, Prisma, Sequelize, natural language, and more) by reusing `@react-querybuilder/core` directly — so format and parser behavior is **byte-identical** to the React library.

```svelte
<script>
  import { QueryBuilder, formatQuery } from 'svelte-query-builder';

  const fields = [
    { name: 'firstName', label: 'First name' },
    { name: 'age', label: 'Age', inputType: 'number' },
  ];
  let query = $state({ combinator: 'and', rules: [] });
</script>

<QueryBuilder bind:query {fields} />
<pre>{formatQuery(query, 'sql')}</pre>
```

## Install

```bash
pnpm add svelte-query-builder
```

`@react-querybuilder/core` is bundled as a runtime dependency.

## Features

- **Controlled and uncontrolled** — pass `query`+`onQueryChange` or `bind:query`.
- **23 output formats** via `formatQuery` (sql, parameterized, parameterized_named, mongodb, jsonlogic, cel, spel, jsonata, elasticsearch, cypher, sparql, gremlin, ldap, drizzle, prisma, sequelize, natural_language, json, …).
- **6 parsers** (parseSQL, parseMongoDB, parseCEL, parseSpEL, parseJSONata, parseJsonLogic) available as subpath imports for tree-shaking.
- **Independent combinators mode** — `independentCombinators={true}` for the per-rule combinator layout.
- **Lock / disable / mute** — `disabled`, `muted` flags propagate down the tree; toggle UI via `showLockButtons` / `showMuteButtons`.
- **Validation** — pass a `validator`; per-rule and per-group `valid`/`invalid` classnames are applied.
- **Value sources** — switch between literal values and field-to-field comparison via `valueSources` on a field.
- **Match modes** — sub-query rules on array-typed fields (`all` / `some` / `none` / `atLeast` / `atMost` / `exactly` with threshold).
- **Between / notBetween** dual-input editor.
- **Shift up/down** actions via `showShiftActions`.
- **Drag and drop** via `enableDragAndDrop` (or use `<QueryBuilderDnD>` from `svelte-query-builder/dnd`).
- **Custom controls** — override any subcomponent via `controls={{ valueEditor: MyEditor, … }}`.
- **Snippet slots** — `header`, `footer`, `ruleGroupHeader`, `ruleGroupBody` for layout customization.
- **Theming** — tailwind v4 CSS variables out of the box, or pass `controlClassnames` for per-element class overrides, or use the `data-rqb-element="…"` data attributes for pure-CSS theming.
- **Async option lists** — `createAsyncOptionList()` helper with AbortController-based cancellation.
- **Accessibility** — ARIA labels, accessible-description generator hook, keyboard-friendly defaults.

## Quick examples

### Drive DuckDB-WASM

```ts
import { formatQuery } from 'svelte-query-builder';

$effect(async () => {
  const { sql, params } = formatQuery(query, 'parameterized');
  const stmt = await connection.prepare(`SELECT * FROM users WHERE ${sql}`);
  results = await stmt.query(...params);
});
```

### Custom value editor

```svelte
<script>
  import { QueryBuilder } from 'svelte-query-builder';
  import MyDateRangeEditor from './MyDateRangeEditor.svelte';
</script>

<QueryBuilder bind:query {fields} controls={{ valueEditor: MyDateRangeEditor }} />
```

### Custom layout via snippets

```svelte
<QueryBuilder bind:query {fields}>
  {#snippet header({ schema })}
    <div class="my-toolbar">Level {schema.qbId}</div>
  {/snippet}
  {#snippet footer({ query })}
    <pre>{JSON.stringify(query, null, 2)}</pre>
  {/snippet}
</QueryBuilder>
```

### Drag and drop

```svelte
<script>
  import { QueryBuilder } from 'svelte-query-builder';
</script>

<QueryBuilder bind:query {fields} enableDragAndDrop />
```

Or import the wrapper:

```svelte
<script>
  import { QueryBuilderDnD } from 'svelte-query-builder/dnd';
</script>

<QueryBuilderDnD bind:query {fields} />
```

### Validation

```svelte
<script>
  import { QueryBuilder } from 'svelte-query-builder';

  function validator(q) {
    const map = {};
    function walk(node) {
      if ('rules' in node) node.rules.forEach((r) => typeof r !== 'string' && walk(r));
      else if (node.value === '' || node.value == null)
        map[node.id] = { valid: false, reasons: ['empty'] };
    }
    walk(q);
    return map;
  }
</script>

<QueryBuilder bind:query {fields} {validator} />
```

### Parsers (subpath imports)

```ts
import { parseSQL } from 'svelte-query-builder/parseSQL';
import { parseMongoDB } from 'svelte-query-builder/parseMongoDB';

const query = parseSQL(`firstName like 'Ste%' and age > 28`, { fields });
```

### Headless (no shadcn-svelte)

If you don't want the default shadcn-svelte UI, import from `/headless` and supply your own `controls`:

```ts
import { createQueryBuilderState } from 'svelte-query-builder/headless';
```

## Public API

### Components

- `QueryBuilder` — the main component
- `QueryBuilderDnD` — drag-and-drop variant (`svelte-query-builder/dnd`)
- All default subcomponents (`Rule`, `RuleGroup`, `ValueSelector`, `ValueEditor`, `ActionElement`, `NotToggle`, `ShiftActions`, `DragHandle`, `MatchModeEditor`, `InlineCombinator`) are exported and can be wrapped or extended.

### State + context (advanced)

- `createQueryBuilderState({ getQuery, defaultQuery, onQueryChange, … })` — runes-based state factory used internally by `<QueryBuilder>`. Use it directly to build your own root component.
- `getQueryBuilderContext()` / `setQueryBuilderContext()`.

### Hooks

- `createAsyncOptionList({ fetcher })` — reactive async options helper with cancellation.

### Format / parse

```ts
import { formatQuery, transformQuery } from 'svelte-query-builder';
// Or via subpaths:
import { formatQuery } from 'svelte-query-builder/formatQuery';
import { parseSQL } from 'svelte-query-builder/parseSQL';
import { parseMongoDB } from 'svelte-query-builder/parseMongoDB';
import { parseCEL } from 'svelte-query-builder/parseCEL';
import { parseSpEL } from 'svelte-query-builder/parseSpEL';
import { parseJSONata } from 'svelte-query-builder/parseJSONata';
import { parseJsonLogic } from 'svelte-query-builder/parseJsonLogic';
import { transformQuery } from 'svelte-query-builder/transformQuery';
```

### Types

All types from `@react-querybuilder/core` are re-exported:

```ts
import type {
  Field,
  Operator,
  Combinator,
  RuleType,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleGroupTypeAny,
  Path,
  Classnames,
  Translations,
  ValidationMap,
  QueryValidator,
} from 'svelte-query-builder';
```

## Theming

The default components are styled with [tailwindcss v4](https://tailwindcss.com/) using OKLch CSS variables. Themes ship as CSS variables on `:root` and `.dark` and use the same `--background`, `--foreground`, `--primary`, `--border`, etc. tokens as shadcn-svelte.

For framework-agnostic styling, every node carries a `data-rqb-element="…"` attribute:

```css
[data-rqb-element='rule'] { padding: 0.5rem; }
[data-rqb-element='rule-group'] { border-radius: 0.5rem; }
```

Per-element class overrides go via `controlClassnames`:

```svelte
<QueryBuilder
  bind:query
  {fields}
  controlClassnames={{
    queryBuilder: 'my-qb',
    rule: 'flex items-center gap-2 p-2',
    ruleGroup: 'border-l-2 pl-2',
  }}
/>
```

## Architecture

This library wraps `@react-querybuilder/core` (zero React deps — pure TypeScript with `immer`, `numeric-quantity`, `@ts-jison/lexer`, `@ts-jison/parser`) and provides a Svelte 5 component layer that:

- uses `$state`-backed reactive state (one instance per QueryBuilder, scoped via context)
- snapshots state through `$state.snapshot()` before handing off to immer-backed mutators (since immer can't freeze Svelte's `$state` proxies)
- mirrors the `controls` and `controlClassnames` extension points from react-querybuilder so existing patterns translate

## Status

**v0.0.1** — feature-complete port of all major react-querybuilder features. See the demo route in this repo for a live walkthrough.

| Feature | Status |
| --- | --- |
| 23 output formats | ✓ via `@react-querybuilder/core` |
| 6 parsers | ✓ via subpath imports |
| Independent combinators | ✓ |
| Lock / disable / mute | ✓ |
| Validation | ✓ |
| Value sources | ✓ |
| Match modes | ✓ |
| Between / multiselect editors | ✓ |
| Shift actions | ✓ |
| Async option lists | ✓ |
| Accessibility | ✓ |
| Custom controls + snippets | ✓ |
| Drag and drop | ✓ |

## Development

```bash
pnpm install
pnpm dev      # start the demo
pnpm test     # vitest unit tests
pnpm check    # svelte-check
pnpm build    # build the library
```

## License

MIT. Built on [`@react-querybuilder/core`](https://github.com/react-querybuilder/react-querybuilder) (MIT) and [`svelte-dnd-action`](https://github.com/isaacHagoel/svelte-dnd-action) (MIT).
