// Main component
export { default as QueryBuilder } from './components/query-builder/QueryBuilder.svelte';

// Default control components (overridable via the `controls` prop)
export { default as ActionElement } from './components/query-builder/ActionElement.svelte';
export { default as InlineCombinator } from './components/query-builder/InlineCombinator.svelte';
export { default as NotToggle } from './components/query-builder/NotToggle.svelte';
export { default as Rule } from './components/query-builder/Rule.svelte';
export { default as RuleGroup } from './components/query-builder/RuleGroup.svelte';
export { default as ValueEditor } from './components/query-builder/ValueEditor.svelte';
export { default as ValueSelector } from './components/query-builder/ValueSelector.svelte';

// State + context (advanced)
export {
	createQueryBuilderState,
	type QueryBuilderState,
	type CreateQueryBuilderStateOptions,
} from './state/create-query-builder-state.svelte.js';
export {
	getQueryBuilderContext,
	setQueryBuilderContext,
	type QueryBuilderContextValue,
} from './state/context.js';

// Defaults & types
export * from './defaults.js';
export type * from './types.js';

// Convenience re-exports of core utilities most consumers will need
export {
	add,
	convertQuery,
	formatQuery,
	generateAccessibleDescription,
	generateID,
	move,
	remove,
	transformQuery,
	update,
} from '@react-querybuilder/core';
