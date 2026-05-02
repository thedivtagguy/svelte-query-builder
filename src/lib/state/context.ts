import { getContext, setContext } from 'svelte';
import type { Schema } from '../types.js';
import type { QueryBuilderState } from './create-query-builder-state.svelte.js';

const KEY = Symbol('svelte-query-builder');

/**
 * Context value uses getters so consumers see live updates to schema (which is
 * a $derived in <QueryBuilder>) and to state (which is a $state-backed object).
 */
export interface QueryBuilderContextValue {
	readonly state: QueryBuilderState;
	readonly schema: Schema;
}

export function setQueryBuilderContext(value: QueryBuilderContextValue): void {
	setContext(KEY, value);
}

export function getQueryBuilderContext(): QueryBuilderContextValue {
	const ctx = getContext<QueryBuilderContextValue | undefined>(KEY);
	if (!ctx) {
		throw new Error(
			'QueryBuilder context not found — components must be rendered inside <QueryBuilder>.',
		);
	}
	return ctx;
}
