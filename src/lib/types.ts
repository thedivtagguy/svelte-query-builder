import type { Component, Snippet } from 'svelte';
import type {
	BaseTranslationsFull,
	Classnames,
	Combinator,
	Field,
	FullField,
	FullOption,
	FullOptionList,
	InputType,
	Operator,
	Option,
	Path,
	RuleGroupType,
	RuleGroupTypeAny,
	RuleType,
	ValueEditorType,
} from '@react-querybuilder/core';

export type {
	BaseTranslations,
	BaseTranslationsFull,
	Classname,
	Classnames,
	Combinator,
	DefaultCombinatorName,
	DefaultOperatorName,
	DefaultRuleGroupType,
	DefaultRuleType,
	Field,
	FullCombinator,
	FullField,
	FullOperator,
	FullOption,
	FullOptionList,
	InputType,
	MatchMode,
	Operator,
	Option,
	OptionList,
	Path,
	RuleGroupType,
	RuleGroupTypeAny,
	RuleGroupTypeIC,
	RuleType,
	ValidationMap,
	ValidationResult,
	ValueEditorType,
	ValueSources,
} from '@react-querybuilder/core';

/** Convenience alias — fully-resolved translations (every key required). */
export type Translations = BaseTranslationsFull;

/**
 * Resolved per-instance configuration shared by every component in the tree
 * via context. Built once per QueryBuilder render from props + defaults.
 */
export interface Schema<F extends FullField = FullField> {
	qbId: string;
	fields: F[];
	combinators: FullOptionList<Combinator>;
	operators: FullOptionList<Operator>;
	getOperators: (field: string) => FullOptionList<Operator>;
	getValueEditorType: (field: string, operator: string) => ValueEditorType;
	getInputType: (field: string, operator: string) => InputType | null;
	getValues: (field: string, operator: string) => FullOptionList<Option>;
	classnames: Classnames;
	translations: Translations;
	controls: ResolvedControls;
	showCombinatorsBetweenRules: boolean;
	showNotToggle: boolean;
	showCloneButtons: boolean;
	independentCombinators: boolean;
}

// ---- Component prop shapes (default + custom override targets) ----

export interface CommonSubcomponentProps {
	path: Path;
	level: number;
	disabled?: boolean;
	schema: Schema;
}

export interface ActionProps extends CommonSubcomponentProps {
	label?: string;
	title?: string;
	className?: import('@react-querybuilder/core').Classname;
	ruleOrGroup?: RuleType | RuleGroupTypeAny;
	onClick: (event?: Event) => void;
}

export interface ValueSelectorProps<TOption extends FullOption = FullOption>
	extends CommonSubcomponentProps {
	options: FullOptionList<TOption>;
	value?: string;
	className?: import('@react-querybuilder/core').Classname;
	title?: string;
	multiple?: boolean;
	listsAsArrays?: boolean;
	onChange: (value: string) => void;
}

export interface NotToggleProps extends CommonSubcomponentProps {
	checked?: boolean;
	className?: import('@react-querybuilder/core').Classname;
	label?: string;
	title?: string;
	onChange: (checked: boolean) => void;
}

export interface ValueEditorProps extends CommonSubcomponentProps {
	field: string;
	operator: string;
	value: unknown;
	valueSource?: 'value' | 'field';
	type?: ValueEditorType;
	inputType?: InputType | null;
	values?: FullOptionList<Option>;
	className?: import('@react-querybuilder/core').Classname;
	title?: string;
	rule: RuleType;
	onChange: (value: unknown) => void;
}

export interface InlineCombinatorProps extends ValueSelectorProps<FullOption> {
	rules: (RuleType | RuleGroupTypeAny | string)[];
}

export interface RuleProps {
	rule: RuleType;
	path: Path;
	disabled?: boolean;
	parentDisabled?: boolean;
}

export interface RuleGroupProps {
	ruleGroup: RuleGroupTypeAny;
	path: Path;
	disabled?: boolean;
	parentDisabled?: boolean;
}

/**
 * User-supplied component overrides. `null` hides the component entirely
 * (matches react-querybuilder's `controls` semantics).
 */
export interface Controls {
	actionElement?: Component<ActionProps>;
	valueSelector?: Component<ValueSelectorProps>;
	valueEditor?: Component<ValueEditorProps> | null;
	fieldSelector?: Component<ValueSelectorProps>;
	operatorSelector?: Component<ValueSelectorProps>;
	combinatorSelector?: Component<ValueSelectorProps>;
	notToggle?: Component<NotToggleProps> | null;
	inlineCombinator?: Component<InlineCombinatorProps>;
	rule?: Component<RuleProps>;
	ruleGroup?: Component<RuleGroupProps>;
	addRuleAction?: Component<ActionProps> | null;
	addGroupAction?: Component<ActionProps> | null;
	removeRuleAction?: Component<ActionProps> | null;
	removeGroupAction?: Component<ActionProps> | null;
	cloneRuleAction?: Component<ActionProps> | null;
	cloneGroupAction?: Component<ActionProps> | null;
}

/**
 * Schema.controls — every slot resolved (defaults applied), with `null`
 * preserved so consumers can short-circuit rendering hidden controls.
 */
export type ResolvedControls = {
	[K in keyof Controls]-?: Controls[K] extends infer T | null
		? T | null
		: NonNullable<Controls[K]>;
};

export interface QueryBuilderProps<RG extends RuleGroupTypeAny = RuleGroupType> {
	// Controlled
	query?: RG;
	// Uncontrolled
	defaultQuery?: RG;
	onQueryChange?: (query: RG) => void;

	// Schema
	fields?: Field[];
	operators?: Operator[];
	combinators?: Combinator[];
	getOperators?: (field: string) => Operator[] | null | undefined;
	getValueEditorType?: (field: string, operator: string) => ValueEditorType;
	getInputType?: (field: string, operator: string) => InputType | null;
	getValues?: (field: string, operator: string) => Option[];
	getDefaultField?: string | ((fields: Field[]) => string);
	getDefaultOperator?: string | ((field: string) => string);
	getDefaultValue?: (rule: RuleType) => unknown;

	// Behavior flags
	showCombinatorsBetweenRules?: boolean;
	showNotToggle?: boolean;
	showCloneButtons?: boolean;
	resetOnFieldChange?: boolean;
	resetOnOperatorChange?: boolean;
	independentCombinators?: boolean;

	// Theming
	controlClassnames?: Partial<Classnames>;
	translations?: Partial<BaseTranslationsFull>;
	suppressStandardClassnames?: boolean;

	// Behavioral overrides
	controls?: Controls;

	// Layout snippets
	header?: Snippet<[{ schema: Schema }]>;
	footer?: Snippet<[{ schema: Schema; query: RG }]>;

	// Identity (auto-generated when omitted; reserved for future cross-builder DnD)
	qbId?: string;

	// Container element
	class?: string;
}
