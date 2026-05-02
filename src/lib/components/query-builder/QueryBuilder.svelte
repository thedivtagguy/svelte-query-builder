<script lang="ts" generics="RG extends import('@react-querybuilder/core').RuleGroupTypeAny = import('@react-querybuilder/core').RuleGroupType">
	import { generateID } from '@react-querybuilder/core';
	import { setQueryBuilderContext } from '../../state/context.js';
	import { createQueryBuilderState } from '../../state/create-query-builder-state.svelte.js';
	import { buildSchema } from '../../utils/schema.js';
	import RuleGroup from './RuleGroup.svelte';
	import { cn } from '$lib/utils.js';
	import type { QueryBuilderProps } from '../../types.js';

	// `query` is bindable so consumers can use `bind:query`. Everything else
	// is read off the live `props` proxy returned by $props() so changes stay
	// reactive (destructured non-bindable props would snapshot and lose updates).
	let { query = $bindable(), ...props }: QueryBuilderProps<RG> = $props();

	const qbId = props.qbId ?? generateID();

	const state = createQueryBuilderState<RG>({
		qbId,
		getQuery: () => query,
		defaultQuery: props.defaultQuery,
		onQueryChange: (q) => {
			query = q;
			props.onQueryChange?.(q);
		},
		independentCombinators: props.independentCombinators,
	});

	const schema = $derived(buildSchema({ qbId, props: { ...props, query } as QueryBuilderProps<RG> }));

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
	<RuleGroup path={[]} />
	{#if props.footer}
		{@render props.footer({ schema, query: state.query as RG })}
	{/if}
</div>
