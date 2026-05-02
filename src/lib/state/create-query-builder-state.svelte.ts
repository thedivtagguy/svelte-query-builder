import {
	add,
	findPath,
	generateID,
	insert,
	isRuleGroup,
	isRuleGroupTypeIC,
	move,
	pathIsDisabled,
	remove,
	update,
} from '@react-querybuilder/core';
import type {
	Path,
	RuleGroupType,
	RuleGroupTypeAny,
	RuleGroupTypeIC,
	RuleType,
	UpdateableProperties,
} from '@react-querybuilder/core';

export interface QueryBuilderState<RG extends RuleGroupTypeAny = RuleGroupTypeAny> {
	readonly query: RG;
	readonly qbId: string;
	setQuery(q: RG): void;
	addRule(rule: RuleType, parentPath: Path): void;
	addGroup(group: RuleGroupTypeAny, parentPath: Path): void;
	insertRule(rule: RuleType, path: Path): void;
	insertGroup(group: RuleGroupTypeAny, path: Path): void;
	removeNode(path: Path): void;
	moveNode(oldPath: Path, newPath: Path | 'up' | 'down', clone?: boolean): void;
	updateProp(path: Path, prop: UpdateableProperties, value: unknown): void;
	cloneNode(path: Path): void;
	toggleDisabled(path: Path): void;
	toggleMuted(path: Path): void;
	updateCombinatorAt(path: Path, combinator: string): void;
	isPathDisabled(path: Path): boolean;
	isPathMuted(path: Path): boolean;
}

export interface CreateQueryBuilderStateOptions<RG extends RuleGroupTypeAny = RuleGroupTypeAny> {
	qbId?: string;
	getQuery: () => RG | undefined;
	defaultQuery?: RG;
	onQueryChange?: (q: RG) => void;
	independentCombinators?: boolean;
	getDefaultCombinator?: () => string;
}

const defaultEmptyQuery = (ic: boolean): RuleGroupTypeAny =>
	ic
		? ({ rules: [] } as unknown as RuleGroupTypeIC)
		: ({ combinator: 'and', rules: [] } as RuleGroupType);

export function createQueryBuilderState<RG extends RuleGroupTypeAny = RuleGroupTypeAny>(
	opts: CreateQueryBuilderStateOptions<RG>,
): QueryBuilderState<RG> {
	const qbId = opts.qbId ?? generateID();
	const ic = !!opts.independentCombinators;
	let internal = $state<RG>(
		(opts.getQuery() ?? opts.defaultQuery ?? (defaultEmptyQuery(ic) as unknown as RG)) as RG,
	);

	const isControlled = () => opts.getQuery() !== undefined;
	const liveQuery = (): RG => (isControlled() ? (opts.getQuery() as RG) : internal);
	// $state.snapshot before handing off to immer-backed core mutators.
	const snapshot = (): RG => $state.snapshot(liveQuery()) as RG;

	const commit = (next: RG) => {
		if (!isControlled()) internal = next;
		opts.onQueryChange?.(next);
	};

	const isMutedAt = (path: Path, q: RG): boolean => {
		if (path.length === 0) return !!(q as { muted?: boolean }).muted;
		let target: RuleGroupTypeAny | RuleType | null = q;
		let muted = false;
		for (const idx of path) {
			if (!target || !isRuleGroup(target)) return muted;
			const next = (target.rules as Array<RuleType | RuleGroupTypeAny | string>)[idx];
			if (typeof next === 'string') return muted;
			target = next as RuleType | RuleGroupTypeAny;
			if ((target as { muted?: boolean })?.muted) muted = true;
		}
		return muted;
	};

	const stripCombinatorOnIC = (group: RuleGroupTypeAny): RuleGroupTypeAny => {
		if (!ic) return group;
		const { combinator: _c, ...rest } = group as RuleGroupType;
		return rest as RuleGroupTypeAny;
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
			commit(add(snapshot(), stripCombinatorOnIC(group) as never, parentPath) as RG);
		},
		insertRule(rule, path) {
			commit(insert(snapshot(), rule, path) as RG);
		},
		insertGroup(group, path) {
			commit(insert(snapshot(), stripCombinatorOnIC(group) as never, path) as RG);
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
		updateCombinatorAt(path, combinator) {
			commit(update(snapshot(), 'combinator', combinator, path) as RG);
		},
		cloneNode(path) {
			if (path.length === 0) return;
			const parent = path.slice(0, -1);
			const index = path[path.length - 1] as number;
			// IC mode: rules live at even indices; clone-then-shift by 2 keeps alternation.
			const targetIdx = ic ? index + 2 : index + 1;
			const newPath = [...parent, targetIdx];
			commit(move(snapshot(), path, newPath, { clone: true }) as RG);
		},
		toggleDisabled(path) {
			const q = snapshot();
			const target =
				path.length === 0 ? q : (findPath(path, q) as RuleType | RuleGroupTypeAny | null);
			if (!target) return;
			const next = !(target as { disabled?: boolean }).disabled;
			commit(update(q, 'disabled', next, path) as RG);
		},
		toggleMuted(path) {
			const q = snapshot();
			const target =
				path.length === 0 ? q : (findPath(path, q) as RuleType | RuleGroupTypeAny | null);
			if (!target) return;
			const next = !(target as { muted?: boolean }).muted;
			commit(update(q, 'muted' as UpdateableProperties, next, path) as RG);
		},
		isPathDisabled(path) {
			return pathIsDisabled(path, liveQuery());
		},
		isPathMuted(path) {
			return isMutedAt(path, liveQuery());
		},
	};
}
