<script lang="ts">
	import { QueryBuilder } from '$lib/index.js';
	import type { RuleGroupType } from '$lib/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { fields } from './fields.js';

	let defaultQ = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'A' },
			{ field: 'age', operator: '>', value: 21 },
			{ field: 'instrument', operator: '=', value: 'Guitar' },
		],
	});
	let variantQ = $state<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'firstName', operator: 'beginsWith', value: 'A' },
			{ field: 'age', operator: '>', value: 21 },
			{ field: 'instrument', operator: '=', value: 'Guitar' },
		],
	});
</script>

<Tabs.Root value="default" class="mb-6">
	<Tabs.List class="bg-muted/50 mb-2">
		<Tabs.Trigger value="default">Default</Tabs.Trigger>
		<Tabs.Trigger value="variant">Variant</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="default">
		<div class="bg-card/70 border-border/60 rounded-lg border p-4">
			<QueryBuilder bind:query={defaultQ} {fields} />
		</div>
	</Tabs.Content>
	<Tabs.Content value="variant">
		<div class="qb-grid">
			<QueryBuilder
				bind:query={variantQ}
				{fields}
				controlClassnames={{
					queryBuilder: 'qb-grid-root',
					ruleGroup: 'qb-grid-group',
					header: 'qb-grid-header',
					body: 'qb-grid-body',
					rule: 'qb-grid-rule',
					combinators: 'qb-grid-comb',
					fields: 'qb-grid-cell',
					operators: 'qb-grid-cell',
					value: 'qb-grid-cell',
					addRule: 'qb-grid-action',
					addGroup: 'qb-grid-action',
					removeRule: 'qb-grid-action danger',
					removeGroup: 'qb-grid-action danger',
				}}
			/>
		</div>
	</Tabs.Content>
</Tabs.Root>

<style>
	.qb-grid {
		--variant-bg: oklch(99% 0.005 95);
		--variant-fg: oklch(15% 0 0);
		--variant-line: oklch(15% 0 0);
		--variant-muted: oklch(50% 0 0);
		--variant-accent: oklch(58% 0.21 27);
		background: var(--variant-bg);
		color: var(--variant-fg);
		border: 1px solid var(--variant-line);
	}
	:global(.dark) .qb-grid {
		--variant-bg: oklch(15% 0 0);
		--variant-fg: oklch(95% 0 0);
		--variant-line: oklch(95% 0 0);
		--variant-muted: oklch(70% 0 0);
		--variant-accent: oklch(72% 0.18 50);
	}

	.qb-grid :global(.qb-grid-root) {
		gap: 0;
	}
	.qb-grid :global(.qb-grid-group) {
		background: transparent;
		border: none;
		border-top: 1px solid var(--variant-line);
		border-radius: 0;
		padding: 1.25rem 1.5rem;
		box-shadow: none;
	}
	.qb-grid
		:global(> [data-rqb-element='query-builder'] > [data-rqb-element='rule-group']:first-child) {
		border-top: none;
	}
	.qb-grid :global(.qb-grid-header) {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
		padding: 0;
		margin: 0 0 0.85rem;
		border: none;
	}
	.qb-grid :global(.qb-grid-body) {
		padding-left: 0;
		border-left: none;
		gap: 0;
	}
	.qb-grid :global(.qb-grid-rule) {
		padding: 0.65rem 0;
		border-bottom: 1px solid color-mix(in oklch, var(--variant-line) 18%, transparent);
		gap: 0.6rem;
	}
	.qb-grid :global([data-rqb-element='rule-group-body'] > div:last-child .qb-grid-rule) {
		border-bottom: none;
	}
	.qb-grid :global(.qb-grid-action) {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace !important;
		font-size: 0.68rem !important;
		text-transform: uppercase !important;
		letter-spacing: 0.12em !important;
		font-weight: 500 !important;
		border-radius: 0 !important;
		border: 1px solid var(--variant-line) !important;
		background: transparent !important;
		color: var(--variant-fg) !important;
		padding: 0.35rem 0.7rem !important;
		height: auto !important;
		min-height: 0 !important;
		box-shadow: none !important;
	}
	.qb-grid :global(.qb-grid-action:hover) {
		background: var(--variant-fg) !important;
		color: var(--variant-bg) !important;
	}
	.qb-grid :global(.qb-grid-action.danger) {
		color: var(--variant-accent) !important;
		border-color: var(--variant-accent) !important;
	}
	.qb-grid :global(.qb-grid-action.danger:hover) {
		background: var(--variant-accent) !important;
		color: var(--variant-bg) !important;
	}
	.qb-grid :global([data-rqb-element='value-selector']) {
		border-radius: 0 !important;
		border-color: var(--variant-line) !important;
		background: transparent !important;
		font-family: ui-monospace, 'SF Mono', monospace !important;
		font-size: 0.78rem !important;
		min-height: 1.85rem !important;
		height: 1.85rem !important;
		padding: 0 0.6rem !important;
		box-shadow: none !important;
	}
	.qb-grid :global(input),
	.qb-grid :global(textarea) {
		border-radius: 0 !important;
		border-color: var(--variant-line) !important;
		background: transparent !important;
		font-family: ui-monospace, 'SF Mono', monospace !important;
		font-size: 0.78rem !important;
		height: 1.85rem !important;
		padding: 0 0.55rem !important;
		box-shadow: none !important;
	}
</style>
