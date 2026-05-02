<script
	lang="ts"
	generics="RG extends import('@react-querybuilder/core').RuleGroupTypeAny = import('@react-querybuilder/core').RuleGroupTypeAny"
>
	import QueryBuilder from '../components/query-builder/QueryBuilder.svelte';
	import type { QueryBuilderProps } from '../types.js';

	let { query = $bindable(), ...props }: QueryBuilderProps<RG> = $props();
</script>

<QueryBuilder bind:query {...props} enableDragAndDrop />
