<script lang="ts">
	import ValueSelector from './ValueSelector.svelte';
	import type { InlineCombinatorProps } from '../../types.js';

	const props: InlineCombinatorProps = $props();
</script>

<!-- Phase 1: thin wrapper around ValueSelector. Phase 2 expands with DnD-aware shadow rendering. -->
<ValueSelector {...props} />
