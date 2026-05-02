import {
	defaultCombinators,
	defaultOperators,
	defaultTranslations,
	mergeAnyTranslations,
	toFullOptionList,
} from '@react-querybuilder/core';
import type {
	BaseTranslationsFull,
	Combinator,
	Field,
	FullField,
	FullOptionList,
	InputType,
	Operator,
	Option,
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

const baseDefaultControls: ResolvedControls = {
	actionElement: DefaultActionElement,
	valueSelector: DefaultValueSelector,
	valueEditor: DefaultValueEditor,
	fieldSelector: DefaultValueSelector,
	operatorSelector: DefaultValueSelector,
	combinatorSelector: DefaultValueSelector,
	notToggle: DefaultNotToggle,
	inlineCombinator: DefaultInlineCombinator,
	rule: DefaultRule,
	ruleGroup: DefaultRuleGroup,
	addRuleAction: DefaultActionElement,
	addGroupAction: DefaultActionElement,
	removeRuleAction: DefaultActionElement,
	removeGroupAction: DefaultActionElement,
	cloneRuleAction: DefaultActionElement,
	cloneGroupAction: DefaultActionElement,
};

function resolveControls(overrides?: Controls): ResolvedControls {
	if (!overrides) return baseDefaultControls;
	const merged = { ...baseDefaultControls } as ResolvedControls;
	for (const key of Object.keys(overrides) as (keyof Controls)[]) {
		const value = overrides[key];
		if (value === undefined) continue;
		// `null` is meaningful — it hides the control.
		(merged as Record<string, unknown>)[key] = value;
	}
	return merged;
}

const defaultGetValueEditorType = (): ValueEditorType => 'text';
const defaultGetInputType = (): InputType | null => 'text';
const defaultGetValues = (): Option[] => [];

export interface BuildSchemaInput<RG extends import('@react-querybuilder/core').RuleGroupTypeAny> {
	qbId: string;
	props: QueryBuilderProps<RG>;
}

export function buildSchema<RG extends import('@react-querybuilder/core').RuleGroupTypeAny>(
	input: BuildSchemaInput<RG>,
): Schema {
	const { qbId, props } = input;

	const fields = (props.fields ?? []) as Field[];
	const fullFields = toFullOptionList(fields) as FullField[];
	const combinators = toFullOptionList(
		(props.combinators ?? defaultCombinators) as Combinator[],
	) as FullOptionList<Combinator>;
	const baseOperators = toFullOptionList(
		(props.operators ?? defaultOperators) as Operator[],
	) as FullOptionList<Operator>;

	const getOperators = (field: string): FullOptionList<Operator> => {
		const custom = props.getOperators?.(field);
		if (custom && custom.length > 0) {
			return toFullOptionList(custom as Operator[]) as FullOptionList<Operator>;
		}
		return baseOperators;
	};

	const getValueEditorType = (field: string, operator: string): ValueEditorType =>
		props.getValueEditorType?.(field, operator) ?? defaultGetValueEditorType();
	const getInputType = (field: string, operator: string): InputType | null =>
		props.getInputType?.(field, operator) ?? defaultGetInputType();
	const getValues = (field: string, operator: string): FullOptionList<Option> =>
		toFullOptionList(props.getValues?.(field, operator) ?? defaultGetValues()) as FullOptionList<Option>;

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
		classnames,
		translations,
		controls,
		showCombinatorsBetweenRules: !!props.showCombinatorsBetweenRules,
		showNotToggle: !!props.showNotToggle,
		showCloneButtons: !!props.showCloneButtons,
		independentCombinators: !!props.independentCombinators,
	};
}
