import { describe, expect, it } from 'vitest';
import { createQueryBuilderState } from './create-query-builder-state.svelte.js';
import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '@react-querybuilder/core';

const baseQuery: RuleGroupType = {
	id: 'g0',
	combinator: 'and',
	rules: [
		{ id: 'r0', field: 'a', operator: '=', value: 1 },
		{ id: 'r1', field: 'b', operator: '=', value: 2 },
	],
};

describe('createQueryBuilderState (uncontrolled)', () => {
	it('returns the initial query', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		expect(s.query).toMatchObject({ combinator: 'and', rules: expect.any(Array) });
		expect((s.query as RuleGroupType).rules).toHaveLength(2);
	});

	it('addRule appends to the parent group', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		const newRule: RuleType = { id: 'r2', field: 'c', operator: '=', value: 3 };
		s.addRule(newRule, []);
		const q = s.query as RuleGroupType;
		expect(q.rules).toHaveLength(3);
		expect((q.rules[2] as RuleType).field).toBe('c');
	});

	it('removeNode removes the rule at the given path', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		s.removeNode([0]);
		const q = s.query as RuleGroupType;
		expect(q.rules).toHaveLength(1);
		expect((q.rules[0] as RuleType).id).toBe('r1');
	});

	it('updateProp updates a property on a rule', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		s.updateProp([0], 'value', 99);
		const q = s.query as RuleGroupType;
		expect((q.rules[0] as RuleType).value).toBe(99);
	});

	it('cloneNode duplicates the rule at parent[index+1]', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		s.cloneNode([0]);
		const q = s.query as RuleGroupType;
		expect(q.rules).toHaveLength(3);
		expect((q.rules[1] as RuleType).field).toBe((q.rules[0] as RuleType).field);
		// Cloned rule gets a fresh ID
		expect((q.rules[1] as RuleType).id).not.toBe((q.rules[0] as RuleType).id);
	});

	it('moveNode shifts a rule up/down', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		s.moveNode([1], 'up');
		const q = s.query as RuleGroupType;
		expect((q.rules[0] as RuleType).id).toBe('r1');
		expect((q.rules[1] as RuleType).id).toBe('r0');
	});

	it('toggleDisabled flips disabled flag on a rule', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		s.toggleDisabled([0]);
		expect(((s.query as RuleGroupType).rules[0] as RuleType).disabled).toBe(true);
		s.toggleDisabled([0]);
		expect(
			((s.query as RuleGroupType).rules[0] as RuleType & { disabled?: boolean }).disabled,
		).toBe(false);
	});

	it('toggleMuted flips muted flag on a rule', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: baseQuery,
		});
		s.toggleMuted([1]);
		const q = s.query as RuleGroupType;
		expect((q.rules[1] as RuleType & { muted?: boolean }).muted).toBe(true);
	});

	it('isPathDisabled propagates disabled from parent group', () => {
		const s = createQueryBuilderState({
			getQuery: () => undefined,
			defaultQuery: { ...baseQuery, disabled: true },
		});
		expect(s.isPathDisabled([0])).toBe(true);
	});
});

describe('createQueryBuilderState (controlled)', () => {
	it('reads from the controlled getter on each access', () => {
		let q: RuleGroupType = baseQuery;
		const s = createQueryBuilderState<RuleGroupType>({
			getQuery: () => q,
			onQueryChange: (next) => {
				q = next;
			},
		});
		expect((s.query.rules[0] as RuleType).id).toBe('r0');
		// External update flows through
		q = { ...baseQuery, rules: [{ id: 'r9', field: 'z', operator: '=', value: 0 }] };
		expect((s.query.rules[0] as RuleType).id).toBe('r9');
	});

	it('emits onQueryChange and does not mutate internal state when controlled', () => {
		let q: RuleGroupType = baseQuery;
		let changed: RuleGroupType | null = null;
		const s = createQueryBuilderState<RuleGroupType>({
			getQuery: () => q,
			onQueryChange: (next) => {
				changed = next;
				q = next;
			},
		});
		s.removeNode([0]);
		expect(changed).not.toBeNull();
		expect((changed as unknown as RuleGroupType).rules).toHaveLength(1);
	});
});

describe('createQueryBuilderState (IC mode)', () => {
	const icQuery: RuleGroupTypeIC = {
		id: 'g0',
		rules: [
			{ id: 'r0', field: 'a', operator: '=', value: 1 },
			'and',
			{ id: 'r1', field: 'b', operator: '=', value: 2 },
		],
	};

	it('addRule respects independent combinators flag', () => {
		const s = createQueryBuilderState<RuleGroupTypeIC>({
			getQuery: () => undefined,
			defaultQuery: icQuery,
			independentCombinators: true,
		});
		const newRule: RuleType = { id: 'r2', field: 'c', operator: '=', value: 3 };
		s.addRule(newRule, []);
		const rules = s.query.rules;
		// Original 3 + new combinator + new rule
		expect(rules.length).toBe(5);
	});
});
