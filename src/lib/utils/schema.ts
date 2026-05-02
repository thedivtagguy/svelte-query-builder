import {
	defaultCombinators,
	defaultOperators,
	defaultTranslations,
	getMatchModesUtil,
	getValueSourcesUtil,
	mergeAnyTranslations,
	toFullOption,
	toFullOptionList,
} from '@react-querybuilder/core';
import type {
	BaseTranslationsFull,
	Combinator,
	Field,
	FullField,
	FullOption,
	FullOptionList,
	InputType,
	MatchMode,
	Operator,
	Option,
	ValidationMap,
	ValueEditorType,
} from '@react-querybuilder/core';
import type {
	Controls,
	QueryBuilderProps,
	ResolvedControls,
	Schema,
} from '../types.js';
import { mergeClassnames } from './classnames.js';

import DefaultActionElement from '../components/query-builder/ActionElement.svelte';
import DefaultValueSelector from '../components/query-builder/ValueSelector.svelte';
import DefaultValueEditor from '../components/query-builder/ValueEditor.svelte';
import DefaultNotToggle from '../components/query-builder/NotToggle.svelte';
import DefaultInlineCombinator from '../components/query-builder/InlineCombinator.svelte';
import DefaultRule from '../components/query-builder/Rule.svelte';
import DefaultRuleGroup from '../components/query-builder/RuleGroup.svelte';
import DefaultShiftActions from '../components/query-builder/ShiftActions.svelte';
import DefaultDragHandle from '../components/query-builder/DragHandle.svelte';
import DefaultMatchModeEditor from '../components/query-builder/MatchModeEditor.svelte';

const baseDefaultControls: ResolvedControls = {
	actionElement: DefaultActionElement,
	valueSelector: DefaultValueSelector,
	valueEditor: DefaultValueEditor,
	fieldSelector: DefaultValueSelector,
	operatorSelector: DefaultValueSelector,
	combinatorSelector: DefaultValueSelector,
	valueSourceSelector: DefaultValueSelector,
	notToggle: DefaultNotToggle,
	shiftActions: DefaultShiftActions,
	dragHandle: DefaultDragHandle,
	matchModeEditor: DefaultMatchModeEditor,
	inlineCombinator: DefaultInlineCombinator,
	rule: DefaultRule,
	ruleGroup: DefaultRuleGroup,
	addRuleAction: DefaultActionElement,
	addGroupAction: DefaultActionElement,
	removeRuleAction: DefaultActionElement,
	removeGroupAction: DefaultActionElement,
	cloneRuleAction: DefaultActionElement,
	cloneGroupAction: DefaultActionElement,
	lockRuleAction: DefaultActionElement,
	lockGroupAction: DefaultActionElement,
	muteRuleAction: DefaultActionElement,
	muteGroupAction: DefaultActionElement,
};

function resolveControls(overrides?: Controls): ResolvedControls {
	if (!overrides) return baseDefaultControls;
	const merged: Record<string, unknown> = { ...baseDefaultControls };
	for (const key of Object.keys(overrides) as (keyof Controls)[]) {
		const value = overrides[key];
		if (value === undefined) continue;
		merged[key as string] = value as unknown;
	}
	return merged as ResolvedControls;
}

const defaultGetValueEditorType = (): ValueEditorType => 'text';
const defaultGetInputType = (): InputType | null => 'text';
const defaultGetValues = (): Option[] => [];

export interface BuildSchemaInput<RG extends import('@react-querybuilder/core').RuleGroupTypeAny> {
	qbId: string;
	props: QueryBuilderProps<RG>;
	validationMap: ValidationMap;
}

export function buildSchema<RG extends import('@react-querybuilder/core').RuleGroupTypeAny>(
	input: BuildSchemaInput<RG>,
): Schema {
	const { qbId, props, validationMap } = input;

	const fields = (props.fields ?? []) as Field[];
	const fullFields = toFullOptionList(fields) as FullField[];
	const fieldByName = new Map(fullFields.map((f) => [f.value as string, f]));

	const combinators = toFullOptionList(
		(props.combinators ?? defaultCombinators) as Combinator[],
	) as FullOptionList<Combinator>;
	const baseOperators = toFullOptionList(
		(props.operators ?? defaultOperators) as Operator[],
	) as FullOptionList<Operator>;

	const getOperators = (field: string): FullOptionList<Operator> => {
		const fd = fieldByName.get(field);
		if (fd && Array.isArray((fd as { operators?: unknown }).operators)) {
			return toFullOptionList(
				(fd as { operators: Operator[] }).operators,
			) as FullOptionList<Operator>;
		}
		const custom = props.getOperators?.(field);
		if (custom && custom.length > 0) {
			return toFullOptionList(custom as Operator[]) as FullOptionList<Operator>;
		}
		return baseOperators;
	};

	const getValueEditorType = (field: string, operator: string): ValueEditorType => {
		const fd = fieldByName.get(field) as
			| {
					valueEditorType?: ValueEditorType | ((operator: string) => ValueEditorType);
			  }
			| undefined;
		if (fd?.valueEditorType) {
			return typeof fd.valueEditorType === 'function'
				? fd.valueEditorType(operator)
				: fd.valueEditorType;
		}
		return props.getValueEditorType?.(field, operator) ?? defaultGetValueEditorType();
	};
	const getInputType = (field: string, operator: string): InputType | null => {
		const fd = fieldByName.get(field) as { inputType?: InputType | null } | undefined;
		if (fd?.inputType !== undefined) return fd.inputType;
		return props.getInputType?.(field, operator) ?? defaultGetInputType();
	};
	const getValues = (field: string, operator: string): FullOptionList<Option> => {
		const fd = fieldByName.get(field) as { values?: Option[] } | undefined;
		if (fd?.values && fd.values.length > 0) {
			return toFullOptionList(fd.values) as FullOptionList<Option>;
		}
		return toFullOptionList(
			props.getValues?.(field, operator) ?? defaultGetValues(),
		) as FullOptionList<Option>;
	};
	const getValueSources = (field: string, operator: string): FullOptionList<FullOption> => {
		const fd = fieldByName.get(field) ?? toFullOption({ name: field, label: field });
		return getValueSourcesUtil(fd as FullField, operator, props.getValueSources) as FullOptionList<FullOption>;
	};
	const getMatchModes = (field: string): FullOptionList<FullOption<MatchMode>> | null => {
		const fd = fieldByName.get(field);
		if (!fd) return null;
		const config = (fd as { matchModes?: unknown }).matchModes;
		if (!config) return null;
		const list = getMatchModesUtil(fd as FullField);
		return list as FullOptionList<FullOption<MatchMode>>;
	};

	const getRuleClassname: Schema['getRuleClassname'] = props.getRuleClassname ?? (() => '');
	const getRuleGroupClassname: Schema['getRuleGroupClassname'] =
		props.getRuleGroupClassname ?? (() => '');

	const translations = mergeAnyTranslations(
		defaultTranslations,
		props.translations ?? {},
	) as BaseTranslationsFull;
	const classnames = mergeClassnames(props.controlClassnames);
	const controls = resolveControls(props.controls);

	return {
		qbId,
		fields: fullFields,
		combinators,
		operators: baseOperators,
		getOperators,
		getValueEditorType,
		getInputType,
		getValues,
		getValueSources,
		getMatchModes,
		getRuleClassname,
		getRuleGroupClassname,
		classnames,
		translations,
		controls,
		validationMap,
		accessibleDescriptionGenerator: props.accessibleDescriptionGenerator,
		showCombinatorsBetweenRules: !!props.showCombinatorsBetweenRules,
		showNotToggle: !!props.showNotToggle,
		showCloneButtons: !!props.showCloneButtons,
		showShiftActions: !!props.showShiftActions,
		showLockButtons: !!props.showLockButtons,
		showMuteButtons: !!props.showMuteButtons,
		independentCombinators: !!props.independentCombinators,
		listsAsArrays: !!props.listsAsArrays,
		enableDragAndDrop: !!props.enableDragAndDrop,
	};
}
