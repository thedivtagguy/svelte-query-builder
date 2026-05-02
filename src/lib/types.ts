import type { Component, Snippet } from 'svelte';
import type {
	BaseTranslationsFull,
	Classnames,
	Combinator,
	Field,
	FullField,
	FullOption,
	FullOptionList,
	GetOptionIdentifierType,
	InputType,
	MatchMode,
	Operator,
	Option,
	Path,
	QueryValidator,
	RuleGroupType,
	RuleGroupTypeAny,
	RuleType,
	ValidationMap,
	ValidationResult,
	ValueEditorType,
	ValueSourceFlexibleOptions,
	ValueSources,
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
	QueryValidator,
	RuleGroupType,
	RuleGroupTypeAny,
	RuleGroupTypeIC,
	RuleType,
	RuleValidator,
	ValidationMap,
	ValidationResult,
	ValueEditorType,
	ValueSourceFlexibleOptions,
	ValueSourceFullOptions,
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
	getValueSources: (field: string, operator: string) => FullOptionList<FullOption>;
	getMatchModes: (field: string) => FullOptionList<FullOption<MatchMode>> | null;
	getRuleClassname: (rule: RuleType) => string | string[] | undefined;
	getRuleGroupClassname: (group: RuleGroupTypeAny) => string | string[] | undefined;
	classnames: Classnames;
	translations: Translations;
	controls: ResolvedControls;
	validationMap: ValidationMap;
	accessibleDescriptionGenerator?: AccessibleDescriptionGenerator;
	showCombinatorsBetweenRules: boolean;
	showNotToggle: boolean;
	showCloneButtons: boolean;
	showShiftActions: boolean;
	showLockButtons: boolean;
	showMuteButtons: boolean;
	independentCombinators: boolean;
	listsAsArrays: boolean;
	enableDragAndDrop: boolean;
}

export type AccessibleDescriptionGenerator = (input: {
	path: Path;
	qbId: string;
}) => string;

// ---- Component prop shapes ----

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
	listsAsArrays?: boolean;
	onChange: (value: unknown) => void;
}

export interface InlineCombinatorProps extends ValueSelectorProps<FullOption> {
	rules: (RuleType | RuleGroupTypeAny | string)[];
}

export interface ShiftActionsProps extends CommonSubcomponentProps {
	className?: import('@react-querybuilder/core').Classname;
	titles?: { shiftUp?: string; shiftDown?: string };
	labels?: { shiftUp?: string; shiftDown?: string };
	ruleOrGroup?: RuleType | RuleGroupTypeAny;
	shiftUpDisabled?: boolean;
	shiftDownDisabled?: boolean;
	shiftUp: () => void;
	shiftDown: () => void;
}

export interface MatchModeEditorProps extends CommonSubcomponentProps {
	options: FullOptionList<FullOption<MatchMode>>;
	matchMode?: MatchMode;
	matchThreshold?: number;
	className?: import('@react-querybuilder/core').Classname;
	title?: string;
	onChangeMode: (next: MatchMode) => void;
	onChangeThreshold: (next: number) => void;
}

export interface DragHandleProps extends CommonSubcomponentProps {
	className?: import('@react-querybuilder/core').Classname;
	title?: string;
	label?: string;
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
	valueSourceSelector?: Component<ValueSelectorProps> | null;
	notToggle?: Component<NotToggleProps> | null;
	shiftActions?: Component<ShiftActionsProps> | null;
	dragHandle?: Component<DragHandleProps>;
	matchModeEditor?: Component<MatchModeEditorProps>;
	inlineCombinator?: Component<InlineCombinatorProps>;
	rule?: Component<RuleProps>;
	ruleGroup?: Component<RuleGroupProps>;
	addRuleAction?: Component<ActionProps> | null;
	addGroupAction?: Component<ActionProps> | null;
	removeRuleAction?: Component<ActionProps> | null;
	removeGroupAction?: Component<ActionProps> | null;
	cloneRuleAction?: Component<ActionProps> | null;
	cloneGroupAction?: Component<ActionProps> | null;
	lockRuleAction?: Component<ActionProps> | null;
	lockGroupAction?: Component<ActionProps> | null;
	muteRuleAction?: Component<ActionProps> | null;
	muteGroupAction?: Component<ActionProps> | null;
}

export type ResolvedControls = {
	[K in keyof Controls]-?: Controls[K] extends infer T | null
		? T | null
		: NonNullable<Controls[K]>;
};

export interface QueryBuilderProps<RG extends RuleGroupTypeAny = RuleGroupType> {
	// Controlled / uncontrolled
	query?: RG;
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
	getValueSources?: (
		field: string,
		operator: string,
		misc: { fieldData: FullField },
	) => ValueSources | ValueSourceFlexibleOptions;
	getDefaultField?: string | ((fields: Field[]) => string);
	getDefaultOperator?: string | ((field: string) => string);
	getDefaultValue?: (rule: RuleType) => unknown;
	getRuleClassname?: (rule: RuleType) => string | string[] | undefined;
	getRuleGroupClassname?: (group: RuleGroupTypeAny) => string | string[] | undefined;
	accessibleDescriptionGenerator?: AccessibleDescriptionGenerator;

	// Behavior flags
	showCombinatorsBetweenRules?: boolean;
	showNotToggle?: boolean;
	showCloneButtons?: boolean;
	showShiftActions?: boolean;
	showLockButtons?: boolean;
	showMuteButtons?: boolean;
	resetOnFieldChange?: boolean;
	resetOnOperatorChange?: boolean;
	independentCombinators?: boolean;
	listsAsArrays?: boolean;
	enableDragAndDrop?: boolean;

	// Lock / mute (boolean = whole tree, Path[] = specific paths)
	disabled?: boolean | Path[];

	// Validation
	validator?: QueryValidator;

	// Theming
	controlClassnames?: Partial<Classnames>;
	translations?: Partial<BaseTranslationsFull>;
	suppressStandardClassnames?: boolean;

	// Behavioral overrides
	controls?: Controls;

	// Layout snippets
	header?: Snippet<[{ schema: Schema }]>;
	footer?: Snippet<[{ schema: Schema; query: RG }]>;
	ruleGroupHeader?: Snippet<[{ group: RuleGroupTypeAny; path: Path; schema: Schema }]>;
	ruleGroupBody?: Snippet<[{ group: RuleGroupTypeAny; path: Path; schema: Schema }]>;
	ruleWrapper?: Snippet<[{ rule: RuleType; path: Path; schema: Schema; rule_render: Snippet }]>;

	qbId?: string;
	class?: string;
}
