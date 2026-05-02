<script lang="ts" generics="RG extends import('@react-querybuilder/core').RuleGroupTypeAny = import('@react-querybuilder/core').RuleGroupTypeAny">
	import { defaultValidator, generateID } from '@react-querybuilder/core';
	import type { ValidationMap } from '@react-querybuilder/core';
	import { setQueryBuilderContext } from '../../state/context.js';
	import { createQueryBuilderState } from '../../state/create-query-builder-state.svelte.js';
	import { buildSchema } from '../../utils/schema.js';
	import RuleGroup from './RuleGroup.svelte';
	import { cn } from '$lib/utils.js';
	import type { QueryBuilderProps } from '../../types.js';

	let { query = $bindable(), ...props }: QueryBuilderProps<RG> = $props();

	// svelte-ignore state_referenced_locally
	const qbId = props.qbId ?? generateID();

	const state = createQueryBuilderState<RG>({
		qbId,
		getQuery: () => query,
		// svelte-ignore state_referenced_locally
		defaultQuery: props.defaultQuery,
		onQueryChange: (q) => {
			query = q;
			props.onQueryChange?.(q);
		},
		// svelte-ignore state_referenced_locally
		independentCombinators: props.independentCombinators,
	});

	const validationMap = $derived.by((): ValidationMap => {
		if (!props.validator) return {};
		const result = props.validator(state.query);
		if (typeof result === 'boolean') return {};
		return result as ValidationMap;
	});

	const schema = $derived(
		buildSchema({
			qbId,
			validationMap,
			props: { ...props, query } as QueryBuilderProps<RG>,
		}),
	);

	setQueryBuilderContext({
		get state() {
			return state;
		},
		get schema() {
			return schema;
		},
	});
</script>

<div
	class={cn('svelte-rqb space-y-2', schema.classnames.queryBuilder, props.class)}
	data-rqb-element="query-builder"
	data-qb-id={qbId}
>
	{#if props.header}
		{@render props.header({ schema })}
	{/if}
	<RuleGroup
		path={[]}
		parentDisabled={typeof props.disabled === 'boolean' ? props.disabled : undefined}
	/>
	{#if props.footer}
		{@render props.footer({ schema, query: state.query as RG })}
	{/if}
</div>
