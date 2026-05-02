import {
	add,
	generateID,
	move,
	remove,
	update,
} from '@react-querybuilder/core';
import type {
	Path,
	RuleGroupType,
	RuleGroupTypeAny,
	RuleType,
	UpdateableProperties,
} from '@react-querybuilder/core';

export interface QueryBuilderState<RG extends RuleGroupTypeAny = RuleGroupTypeAny> {
	readonly query: RG;
	readonly qbId: string;
	setQuery(q: RG): void;
	addRule(rule: RuleType, parentPath: Path): void;
	addGroup(group: RuleGroupTypeAny, parentPath: Path): void;
	removeNode(path: Path): void;
	moveNode(oldPath: Path, newPath: Path | 'up' | 'down', clone?: boolean): void;
	updateProp(path: Path, prop: UpdateableProperties, value: unknown): void;
	cloneNode(path: Path): void;
}

export interface CreateQueryBuilderStateOptions<RG extends RuleGroupTypeAny = RuleGroupTypeAny> {
	qbId?: string;
	getQuery: () => RG | undefined; // controlled
	defaultQuery?: RG;
	onQueryChange?: (q: RG) => void;
	independentCombinators?: boolean;
}

const defaultEmptyQuery = (): RuleGroupType => ({
	combinator: 'and',
	rules: [],
});

export function createQueryBuilderState<RG extends RuleGroupTypeAny = RuleGroupTypeAny>(
	opts: CreateQueryBuilderStateOptions<RG>,
): QueryBuilderState<RG> {
	const qbId = opts.qbId ?? generateID();
	let internal = $state<RG>(
		(opts.getQuery() ?? opts.defaultQuery ?? (defaultEmptyQuery() as unknown as RG)) as RG,
	);

	const isControlled = () => opts.getQuery() !== undefined;
	// Live read for reactivity (returns the $state proxy so $derived can track).
	const liveQuery = (): RG => (isControlled() ? (opts.getQuery() as RG) : internal);
	// Snapshot for mutations — immer can't freeze Svelte's $state proxies
	// (state_descriptors_fixed). Snapshot on input, store the plain immer
	// result back into $state.
	const snapshot = (): RG => $state.snapshot(liveQuery()) as RG;

	const commit = (next: RG) => {
		if (!isControlled()) internal = next;
		opts.onQueryChange?.(next);
	};

	return {
		get query() {
			return liveQuery();
		},
		get qbId() {
			return qbId;
		},
		setQuery(q) {
			commit(q);
		},
		addRule(rule, parentPath) {
			commit(add(snapshot(), rule, parentPath) as RG);
		},
		addGroup(group, parentPath) {
			commit(add(snapshot(), group as never, parentPath) as RG);
		},
		removeNode(path) {
			commit(remove(snapshot(), path) as RG);
		},
		moveNode(oldPath, newPath, clone = false) {
			commit(move(snapshot(), oldPath, newPath, { clone }) as RG);
		},
		updateProp(path, prop, value) {
			commit(update(snapshot(), prop, value, path) as RG);
		},
		cloneNode(path) {
			if (path.length === 0) return; // can't clone the root
			const parent = path.slice(0, -1);
			const index = path[path.length - 1] as number;
			const newPath = [...parent, index + 1];
			commit(move(snapshot(), path, newPath, { clone: true }) as RG);
		},
	};
}
