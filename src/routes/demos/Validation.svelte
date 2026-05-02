<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type {
		QueryValidator,
		RuleGroupType,
		RuleType,
		ValidationMap,
	} from '$lib/types.js';
	import { fields } from './fields.js';

	let query = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ id: 'r1', field: 'firstName', operator: '=', value: '' },
			{ id: 'r2', field: 'age', operator: 'between', value: '20,40' },
			{ id: 'r3', field: 'instrument', operator: '=', value: 'Piano' },
		],
	});

	const validator: QueryValidator = (q) => {
		const map: ValidationMap = {};
		type Node = RuleType | { rules: Array<Node | string>; id?: string };
		const walk = (node: Node) => {
			if ('rules' in node) {
				for (const r of node.rules) if (typeof r !== 'string') walk(r as Node);
			} else {
				const v = (node as RuleType).value;
				if (node.id)
					map[node.id] = v === '' || v == null ? { valid: false, reasons: ['empty'] } : true;
			}
		};
		walk(q as Node);
		return map;
	};
</script>

<div class="bg-card/70 border-border/60 mb-6 rounded-lg border p-4">
	<QueryBuilder
		bind:query
		{fields}
		{validator}
		controlClassnames={{
			invalid: 'rounded-md outline-2 outline-offset-2 outline-destructive bg-destructive/5',
			valid: 'rounded-md outline-1 outline-offset-2 outline-primary/20',
		}}
	/>
</div>
