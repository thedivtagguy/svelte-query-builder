# AGENTS.md — svelte-query-builder

Instructions for AI coding agents helping users build with **svelte-query-builder**. Read this fully before suggesting code that uses this library.

---

## What this library is

A Svelte 5 port of [react-querybuilder](https://react-querybuilder.js.org/). It renders a visual rule tree (field / operator / value, nested groups, AND/OR combinators) and exports it to **23 formats** (SQL, parameterized SQL, MongoDB, JSON Logic, CEL, SpEL, JSONata, Elasticsearch, LDAP, natural language, Drizzle, Prisma, Sequelize, etc.) by reusing `@react-querybuilder/core` directly. Format and parser behavior is **byte-identical** to the React library.

**Stack assumptions:** Svelte 5 (runes), SvelteKit or Vite, TypeScript, tailwindcss v4, shadcn-svelte for default UI primitives. The library ships its default UI built on shadcn-svelte + bits-ui.

---

## Install

```bash
pnpm add svelte-query-builder
```

`@react-querybuilder/core` and `svelte-dnd-action` come along as runtime deps. `svelte` is a peer (>=5.0).

If the user's project doesn't have shadcn-svelte already, recommend installing it (the default UI primitives — Select, Button, Input, Switch, Checkbox, Tabs — come from `$lib/components/ui/...`). For shadcn-free use, see **Headless mode** below.

---

## Minimum viable usage

```svelte
<script lang="ts">
  import { QueryBuilder, formatQuery } from 'svelte-query-builder';
  import type { Field, RuleGroupType } from 'svelte-query-builder';

  const fields: Field[] = [
    { name: 'firstName', label: 'First name' },
    { name: 'age', label: 'Age', inputType: 'number' },
  ];

  let query = $state<RuleGroupType>({ combinator: 'and', rules: [] });
</script>

<QueryBuilder bind:query {fields} />

<pre>{formatQuery(query, 'sql')}</pre>
```

Key conventions:
- `query` is **bindable**. Use `bind:query`, OR pass `query` + `onQueryChange` for the React-style controlled API.
- `fields` is the **schema**. Field shape extends core's `Field`: `{ name, label, inputType?, valueEditorType?, values?, valueSources?, matchModes?, defaultValue?, ... }`.
- `formatQuery(query, 'sql')` returns a string. `'parameterized'` returns `{ sql, params }`. See **Output formats**.

---

## Field schema cheat sheet

```ts
const fields: Field[] = [
  // Plain text
  { name: 'firstName', label: 'First name' },

  // Number input
  { name: 'age', label: 'Age', inputType: 'number' },

  // Boolean checkbox or switch
  { name: 'active', label: 'Active', valueEditorType: 'checkbox', defaultValue: false },
  { name: 'verified', label: 'Verified', valueEditorType: 'switch' },

  // Select with fixed options
  {
    name: 'instrument',
    label: 'Instrument',
    valueEditorType: 'select',
    values: [
      { name: 'Guitar', label: 'Guitar' },
      { name: 'Piano',  label: 'Piano'  },
    ],
  },

  // Date with field-to-field comparison enabled
  {
    name: 'startDate',
    label: 'Start',
    inputType: 'date',
    valueSources: ['value', 'field'],
  },

  // Array-typed field with match-mode editor (all/some/none/atLeast/atMost/exactly)
  { name: 'phones', label: 'Phone numbers', matchModes: true },

  // Per-field operator restriction
  {
    name: 'color',
    label: 'Color',
    operators: [
      { name: '=',  value: '=',  label: 'is' },
      { name: '!=', value: '!=', label: 'is not' },
    ],
  },
];
```

---

## `<QueryBuilder>` props (frequently asked)

| Prop | Type | Purpose |
| --- | --- | --- |
| `query` / `bind:query` | `RuleGroupType \| RuleGroupTypeIC` | Controlled query (or two-way bind). |
| `defaultQuery` | same | Uncontrolled initial query. |
| `onQueryChange` | `(q) => void` | Fires after every mutation. |
| `fields` | `Field[]` | Schema. |
| `independentCombinators` | `boolean` | Per-rule combinator layout (no nested groups for grouping). |
| `showCloneButtons` | `boolean` | Show clone button per rule/group. |
| `showNotToggle` | `boolean` | Show NOT toggle on each group. |
| `showShiftActions` | `boolean` | Up/down arrows per rule. |
| `showLockButtons` | `boolean` | Per-rule/group disable toggle. |
| `showMuteButtons` | `boolean` | Per-rule/group mute toggle (excluded from `formatQuery` output). |
| `enableDragAndDrop` | `boolean` | Wraps each group's body with `svelte-dnd-action`. |
| `validator` | `(query) => ValidationMap \| boolean` | Per-rule/group validity. |
| `controls` | `Partial<Controls>` | Override behavioral subcomponents (see **Custom controls**). |
| `controlClassnames` | `Partial<Classnames>` | Per-element class overrides (see **Theming**). |
| `translations` | `Partial<BaseTranslationsFull>` | Override labels/titles. |
| `accessibleDescriptionGenerator` | `(input) => string` | aria-label per node. |
| `header` / `footer` | `Snippet` | Layout snippets above/below the rule tree. |

---

## Output formats

```ts
import { formatQuery } from 'svelte-query-builder';

formatQuery(query, 'sql');                  // → "(firstName like 'Ste%' and age > 28)"
formatQuery(query, 'parameterized');        // → { sql: "...?...", params: [...] }
formatQuery(query, 'parameterized_named');  // → { sql: "...:p1...", params: { p1: ... } }
formatQuery(query, 'mongodb_query');        // → MongoDB query object
formatQuery(query, 'jsonlogic');
formatQuery(query, 'cel');
formatQuery(query, 'spel');
formatQuery(query, 'jsonata');
formatQuery(query, 'elasticsearch');
formatQuery(query, 'natural_language');
formatQuery(query, 'ldap');
formatQuery(query, 'json_without_ids');     // tree without internal ids/paths
```

Pass options as the third arg: `formatQuery(q, 'sql', { preset: 'postgresql', parseNumbers: true })`. Presets for `'sql'`: `ansi` (default), `sqlite`, `postgresql`, `mysql`, `mssql`, `oracle`. There is no DuckDB preset — use `sqlite` (closest dialect) or `parameterized` (avoids most dialect issues).

---

## Driving DuckDB-WASM

```ts
import { formatQuery } from 'svelte-query-builder';

$effect(() => {
  const { sql, params } = formatQuery(query, 'parameterized');
  void run(sql, params);
});

async function run(where: string, params: unknown[]) {
  const stmt = await connection.prepare(`SELECT * FROM users WHERE ${where}`);
  results = await stmt.query(...params);
}
```

Always use `'parameterized'` (or `'parameterized_named'`) when feeding a real database. Never string-interpolate `formatQuery(q, 'sql')` into a query — it does not escape values for arbitrary SQL injection paths.

---

## Parsers (subpath imports)

```ts
import { parseSQL }       from 'svelte-query-builder/parseSQL';
import { parseMongoDB }   from 'svelte-query-builder/parseMongoDB';
import { parseCEL }       from 'svelte-query-builder/parseCEL';
import { parseSpEL }      from 'svelte-query-builder/parseSpEL';
import { parseJSONata }   from 'svelte-query-builder/parseJSONata';
import { parseJsonLogic } from 'svelte-query-builder/parseJsonLogic';

const query = parseSQL(`firstName like 'Ste%' and age > 28`, { fields });
```

Use subpath imports — they're tree-shakable. Don't import all parsers from the main entrypoint.

Some parsers have optional peer deps (`json-logic-js`, `jsonata`, `chevrotain`, `spel2js`). If a parser fails to import, install its peer.

---

## Custom controls (override subcomponents)

`controls` accepts a Svelte component for any of these slots. `null` hides the slot.

```svelte
<script>
  import { QueryBuilder } from 'svelte-query-builder';
  import MyValueEditor from './MyValueEditor.svelte';
</script>

<QueryBuilder
  bind:query
  {fields}
  controls={{
    valueEditor: MyValueEditor,
    cloneRuleAction: null,           // hide clone button
  }}
/>
```

The custom component receives a typed prop bag matching `ValueEditorProps`, `ValueSelectorProps`, `ActionProps`, `NotToggleProps`, `ShiftActionsProps`, `MatchModeEditorProps`, `DragHandleProps`, or `InlineCombinatorProps` depending on the slot. Import these types from `svelte-query-builder`.

Slot names (24 total): `actionElement`, `valueSelector`, `valueEditor`, `fieldSelector`, `operatorSelector`, `combinatorSelector`, `valueSourceSelector`, `notToggle`, `shiftActions`, `dragHandle`, `matchModeEditor`, `inlineCombinator`, `rule`, `ruleGroup`, `addRuleAction`, `addGroupAction`, `removeRuleAction`, `removeGroupAction`, `cloneRuleAction`, `cloneGroupAction`, `lockRuleAction`, `lockGroupAction`, `muteRuleAction`, `muteGroupAction`.

Example custom value editor:

```svelte
<!-- MyValueEditor.svelte -->
<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';
  import type { ValueEditorProps } from 'svelte-query-builder';

  let { value, onChange, disabled, title }: ValueEditorProps = $props();
</script>

<Input
  type="text"
  {disabled}
  {title}
  value={value == null ? '' : String(value)}
  oninput={(e) => onChange(e.currentTarget.value.toUpperCase())}
/>
```

---

## Layout snippets

```svelte
<QueryBuilder bind:query {fields}>
  {#snippet header({ schema })}
    <header class="flex justify-between">
      <span>{schema.fields.length} fields</span>
    </header>
  {/snippet}
  {#snippet footer({ query })}
    <pre>{formatQuery(query, 'sql')}</pre>
  {/snippet}
</QueryBuilder>
```

Available snippets: `header`, `footer`, `ruleGroupHeader`, `ruleGroupBody`, `ruleWrapper`.

---

## Theming

The default components are styled with **tailwindcss v4** OKLch CSS variables (same tokens as shadcn-svelte: `--background`, `--foreground`, `--primary`, `--border`, `--muted`, `--card`, etc.). To theme:

1. **Tweak CSS variables** (in `app.css`'s `@theme` block) — affects all shadcn components including the query builder.
2. **`controlClassnames` prop** — per-element class overrides:
   ```svelte
   <QueryBuilder
     bind:query {fields}
     controlClassnames={{
       queryBuilder: 'border-2 border-dashed border-primary/40',
       ruleGroup:    'bg-card/50 backdrop-blur-sm',
       rule:         'rounded-md hover:bg-muted/40',
       body:         'border-l-4 border-l-primary/30',
       addRule:      'text-primary',
     }}
   />
   ```
3. **`data-rqb-element="..."` data attributes** for pure-CSS theming with no class layer:
   ```css
   [data-rqb-element="rule"] { padding: 0.5rem; }
   [data-rqb-element="rule-group"] { border-radius: 0.5rem; }
   ```

`Classnames` keys: `queryBuilder`, `ruleGroup`, `header`, `body`, `combinators`, `addRule`, `addGroup`, `cloneRule`, `cloneGroup`, `removeRule`, `removeGroup`, `notToggle`, `rule`, `fields`, `operators`, `value`, `valueSource`, `valueSelector`, `actionElement`, `betweenRules`, `valid`, `invalid`, `disabled`, `muted`, `dragHandle`, `shiftActions`, `lockRule`, `lockGroup`, `muteRule`, `muteGroup`, `branches`, `loading`, `valueListItem`, `matchMode`, `matchThreshold`, `hasSubQuery`, plus DnD classes (`dndDragging`, `dndOver`, `dndCopy`, `dndGroup`, `dndDropNotAllowed`, `dndPreviewPosition`, `dndHidden`).

---

## Validation

```ts
import type { QueryValidator, ValidationMap } from 'svelte-query-builder';

const validator: QueryValidator = (q) => {
  const map: ValidationMap = {};
  // walk q.rules; mark by rule.id:
  //   true                        — valid
  //   false                       — invalid
  //   { valid: false, reasons: [..] } — invalid with details
  return map;
};
```

Pass via `<QueryBuilder validator={...} />`. Invalid nodes get the `queryBuilder-invalid` class; valid ones get `queryBuilder-valid`. Style via `controlClassnames.invalid` / `.valid`.

---

## Drag and drop

```svelte
<QueryBuilder bind:query {fields} enableDragAndDrop />
```

Or use the wrapper:

```svelte
<script>
  import { QueryBuilderDnD } from 'svelte-query-builder/dnd';
</script>

<QueryBuilderDnD bind:query {fields} />
```

Backed by `svelte-dnd-action`. Reorder within a group works out of the box; cross-group reorder works too because every zone shares `type: 'svelte-rqb-rules'`. IC mode preserves combinator strings between reordered rules.

---

## Independent combinators (IC) mode

```svelte
<script>
  import type { RuleGroupTypeIC } from 'svelte-query-builder';
  let query = $state<RuleGroupTypeIC>({
    rules: [
      { field: 'firstName', operator: '=', value: 'Steve' },
      'or',
      { field: 'lastName',  operator: '=', value: 'Vai'   },
    ],
  });
</script>

<QueryBuilder bind:query {fields} independentCombinators />
```

The rules array alternates `rule, combinator-string, rule, combinator-string, ...`. Use `RuleGroupTypeIC` (no top-level `combinator` field).

---

## Lock & mute

- `disabled: true` on a rule/group makes it read-only and visually dimmed. Toggleable via the per-rule lock button when `showLockButtons` is on. Disabled is inherited by descendants via `pathIsDisabled`.
- `muted: true` keeps the rule in the JSON tree but **excludes it from `formatQuery` output**. Toggleable via `showMuteButtons`.

```ts
let query = $state<RuleGroupType>({
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: '=', value: 'Steve', disabled: true },
    { field: 'lastName',  operator: '=', value: 'Vai',   muted: true    },
  ],
});
```

---

## Async option lists

```ts
import { createAsyncOptionList } from 'svelte-query-builder';

const list = createAsyncOptionList({
  fetcher: async (input, signal) => {
    const r = await fetch(`/api/options?q=${input}`, { signal });
    return r.json();
  },
});

$effect(() => list.load(currentField));   // re-runs on dep change; cancels previous

// Reactive:
//   list.status — 'idle' | 'loading' | 'success' | 'error'
//   list.data   — FullOptionList | null
//   list.error  — Error | null
```

Use this inside a custom `controls.valueSelector` or `controls.valueEditor` to drive lazy options.

---

## Headless mode (no shadcn-svelte UI)

```ts
import { createQueryBuilderState } from 'svelte-query-builder/headless';
```

The `/headless` entrypoint exports the state factory, context helpers, types, defaults, and core re-exports — no component imports, no shadcn deps. Bring your own components and pass them via the `controls` prop on a custom root that calls `createQueryBuilderState` and `setQueryBuilderContext`. Most users do not need this.

---

## State factory (advanced)

If you're building a custom root component:

```ts
import { createQueryBuilderState, setQueryBuilderContext } from 'svelte-query-builder';

const state = createQueryBuilderState<RuleGroupType>({
  qbId: 'my-qb',                       // optional, auto-generated
  getQuery: () => query,               // controlled getter
  defaultQuery: { combinator: 'and', rules: [] },
  onQueryChange: (q) => { query = q; },
  independentCombinators: false,
});

// state.query — live reactive read
// state.addRule(rule, parentPath)
// state.addGroup(group, parentPath)
// state.insertRule(rule, path)
// state.insertGroup(group, path)
// state.removeNode(path)
// state.moveNode(oldPath, newPath | 'up' | 'down', clone?)
// state.cloneNode(path)
// state.updateProp(path, propName, value)
// state.updateCombinatorAt(path, combinator)
// state.toggleDisabled(path)
// state.toggleMuted(path)
// state.isPathDisabled(path)
// state.isPathMuted(path)
// state.setQuery(q)
```

---

## Pitfalls and gotchas

### 1. **Don't pass a `$state` proxy directly to `formatQuery` / `parseSQL` / core utilities**
Core uses `immer`, which can't freeze Svelte's `$state` proxies (`state_descriptors_fixed`). The `<QueryBuilder>` component handles this internally via `$state.snapshot()`, but if you call core functions yourself with the live state proxy, snapshot first:

```ts
import { transformQuery } from 'svelte-query-builder/transformQuery';

const next = transformQuery($state.snapshot(query), { ... });
```

`formatQuery` happens to be safe (it doesn't mutate), but as a rule of thumb: snapshot before any core call.

### 2. **Field name vs. value**
`Field` accepts both `name` (legacy) and `value` (preferred). The library normalizes via `toFullOption`. Either works — be consistent within a project.

### 3. **`bind:query` requires `let query = $state(...)`**
Don't bind to a non-reactive variable.

### 4. **Custom `valueEditor` must call `onChange` with the right type**
The `value` is `unknown`. Echo whatever shape your editor produces. The library doesn't coerce. For numeric inputs, convert via `Number(...)` before calling `onChange`.

### 5. **IC mode: `defaultQuery` must omit `combinator`**
A `RuleGroupTypeIC` has no top-level `combinator`. Mixing types causes silent rendering bugs.

### 6. **DnD + IC**
DnD reorders rule items but keeps combinator strings in their original positions. This is intentional — letting users re-pick combinators is better than guessing.

### 7. **Clone targets `parent[index + 1]`**
`state.cloneNode([0])` inserts at `[1]`. In IC mode it inserts at `[2]` to preserve the alternating pattern.

### 8. **`controlClassnames` values can be string, string[], or Record<string, boolean>**
The library coerces via clsx. Tailwind utility strings work directly.

### 9. **There is no DuckDB SQL preset**
Use `'sqlite'` for the closest match, or always use `'parameterized'` for query execution.

### 10. **Don't manually add `id` to rules in user input**
The library generates IDs on add via core's `generateID()`. User-provided IDs survive. If you import an existing query without IDs, they'll be added on first mutation.

---

## Type imports

All useful types are re-exported from the main entrypoint:

```ts
import type {
  // Query shape
  RuleType, RuleGroupType, RuleGroupTypeIC, RuleGroupTypeAny, Path,
  // Schema
  Field, FullField, Operator, FullOperator, Combinator, FullCombinator,
  Option, FullOption, OptionList, FullOptionList,
  ValueEditorType, ValueSources, MatchMode,
  // UI
  Classnames, Classname, BaseTranslations, BaseTranslationsFull, Translations,
  // Validation
  QueryValidator, RuleValidator, ValidationMap, ValidationResult,
  // Component prop shapes
  QueryBuilderProps, Schema, Controls, ResolvedControls,
  ValueEditorProps, ValueSelectorProps, ActionProps,
  NotToggleProps, ShiftActionsProps, MatchModeEditorProps,
  DragHandleProps, InlineCombinatorProps, RuleProps, RuleGroupProps,
  AccessibleDescriptionGenerator,
} from 'svelte-query-builder';
```

---

## Subpath import map (full)

| Import | Purpose |
| --- | --- |
| `svelte-query-builder` | `<QueryBuilder>`, all default subcomponents, types, defaults, format/parse re-exports |
| `svelte-query-builder/headless` | State + context + types + defaults only — no shadcn deps |
| `svelte-query-builder/dnd` | `<QueryBuilderDnD>` wrapper |
| `svelte-query-builder/formatQuery` | `formatQuery` only (smaller import) |
| `svelte-query-builder/transformQuery` | `transformQuery` only |
| `svelte-query-builder/parseSQL` | `parseSQL` |
| `svelte-query-builder/parseMongoDB` | `parseMongoDB` |
| `svelte-query-builder/parseCEL` | `parseCEL` |
| `svelte-query-builder/parseSpEL` | `parseSpEL` |
| `svelte-query-builder/parseJSONata` | `parseJSONata` (peer: `jsonata`) |
| `svelte-query-builder/parseJsonLogic` | `parseJsonLogic` (peer: `json-logic-js`) |

---

## When the user says...

| User says | Suggest |
| --- | --- |
| "Build me a filter UI" | `<QueryBuilder bind:query {fields} />` |
| "I want to query DuckDB" | `formatQuery(query, 'parameterized')` → `connection.prepare(...).query(...params)` |
| "Filter MongoDB" | `formatQuery(query, 'mongodb_query')` → pass to `collection.find()` |
| "Save / load filters" | Persist `query` as JSON; restore by assigning back to `$state` variable |
| "Parse a SQL WHERE clause" | `parseSQL(sql, { fields })` from `svelte-query-builder/parseSQL` |
| "Inline rule list, no nested groups" | `independentCombinators={true}` with `RuleGroupTypeIC` |
| "Drag rules around" | `enableDragAndDrop` |
| "Validate before submit" | Pass `validator`; the returned ValidationMap also drives `valid`/`invalid` styling |
| "Custom date picker" | Pass a custom `valueEditor` via `controls={{ valueEditor: MyDatePicker }}` |
| "Different look entirely" | `controlClassnames` for Tailwind; or override every component via `controls` |
| "Skip the shadcn dependency" | `svelte-query-builder/headless` + custom `controls` |

---

## What NOT to do

- Don't import from `@react-querybuilder/core` directly — re-import from `svelte-query-builder` instead. The library re-exports everything users need and pins the core version internally.
- Don't try to make `<QueryBuilder>` non-reactive by destructuring its props. The internal `$props()` proxy is required for live updates.
- Don't recreate the `state` factory inside an `$effect` — it's meant to live for the lifetime of the component.
- Don't mutate `query` deep paths directly (`query.rules[0].value = 'x'`). Use `state.updateProp(path, prop, value)` from inside a custom component, or replace the whole `query` object from outside.
- Don't add a separate state library (Redux Toolkit, Zustand, nanostores). The runes-backed factory is the state layer.

---

## Architecture in one paragraph

`<QueryBuilder>` mounts a runes-backed state factory and a derived schema, places both in Svelte context, then renders `<RuleGroup path={[]} />`. The recursive `<RuleGroup>` reads its subtree from `state.query` via core's `findPath(path, query)` — never the whole query — so reactivity stays fine-grained. Mutations call methods on the state factory (`addRule`, `removeNode`, `updateProp`, `cloneNode`, `moveNode`, `toggleDisabled`, `toggleMuted`), which `$state.snapshot()` the query, hand it to `@react-querybuilder/core`'s immer-backed `add`/`remove`/`update`/`move`, and write the plain-JS result back into `$state`. DnD wraps each group's body with `svelte-dnd-action`'s `dndzone`. All UI primitives come from shadcn-svelte (bits-ui under the hood), all formatters/parsers come from `@react-querybuilder/core`.
