<script lang="ts">
	import { onMount } from 'svelte';
	import { ModeWatcher, toggleMode, mode } from 'mode-watcher';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import ListIcon from '@lucide/svelte/icons/list';
	import XIcon from '@lucide/svelte/icons/x';
	import Docs from './Docs.svx';

	const sections: { id: string; label: string }[] = [
		{ id: 'intro', label: 'Introduction' },
		{ id: 'install', label: 'Install' },
		{ id: 'first', label: 'Your first builder' },
		{ id: 'fields', label: 'Defining fields' },
		{ id: 'props', label: 'Component options' },
		{ id: 'formats', label: 'Output formats' },
		{ id: 'duckdb', label: 'Use with DuckDB' },
		{ id: 'controls', label: 'Custom value editors' },
		{ id: 'snippets', label: 'Layout slots' },
		{ id: 'theming', label: 'Theming' },
		{ id: 'ic', label: 'Inline combinators' },
		{ id: 'lock', label: 'Lock and mute' },
		{ id: 'validation', label: 'Validation' },
		{ id: 'sources', label: 'Compare to a field' },
		{ id: 'match', label: 'Array match modes' },
		{ id: 'between', label: 'Between and lists' },
		{ id: 'dnd', label: 'Drag and drop' },
		{ id: 'async', label: 'Async option lists' },
		{ id: 'headless', label: 'Bring your own UI' },
		{ id: 'subpaths', label: 'Subpath imports' },
		{ id: 'pitfalls', label: 'Things to watch out for' },
	];

	let activeId = $state('intro');
	let navOpen = $state(false);

	onMount(() => {
		if (typeof IntersectionObserver === 'undefined') return;
		const seen = new Map<string, number>();
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) seen.set(e.target.id, e.intersectionRatio || 1);
					else seen.delete(e.target.id);
				}
				for (const s of sections)
					if (seen.has(s.id)) {
						activeId = s.id;
						return;
					}
			},
			{ rootMargin: '-20% 0px -70% 0px', threshold: 0 }
		);
		for (const s of sections) {
			const el = document.getElementById(s.id);
			if (el) io.observe(el);
		}
		return () => io.disconnect();
	});

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		navOpen = false;
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.replaceState(null, '', `#${id}`);
	}
</script>

<ModeWatcher />

<div class="min-h-screen">
	<header
		class="bg-background/80 border-border/60 sticky top-0 z-30 flex items-center justify-between gap-4 border-b px-4 py-3 backdrop-blur-md backdrop-saturate-150 sm:px-8"
	>
		<a href="#intro" class="flex min-w-0 items-center gap-3">
			<span
				class="border-border/70 bg-primary/10 text-primary grid size-8 place-items-center rounded-md border text-sm"
				aria-hidden="true">⌘</span
			>
			<span class="flex min-w-0 flex-col leading-tight">
				<span class="truncate text-sm font-semibold tracking-tight">svelte-query-builder</span>
				<span class="text-muted-foreground hidden text-xs sm:block">
					Visual rule builder for Svelte 5
				</span>
			</span>
		</a>
		<div class="flex items-center gap-1">
			<button
				type="button"
				aria-label="Toggle theme"
				class="hover:bg-foreground/5 hover:border-border/60 grid size-8 place-items-center rounded-md border border-transparent transition"
				onclick={() => toggleMode()}
			>
				{#if mode.current === 'dark'}
					<SunIcon class="size-4" />
				{:else}
					<MoonIcon class="size-4" />
				{/if}
			</button>
			<button
				type="button"
				aria-label="Toggle navigation"
				class="hover:bg-foreground/5 hover:border-border/60 grid size-8 place-items-center rounded-md border border-transparent transition lg:hidden"
				onclick={() => (navOpen = !navOpen)}
			>
				{#if navOpen}
					<XIcon class="size-4" />
				{:else}
					<ListIcon class="size-4" />
				{/if}
			</button>
		</div>
	</header>

	<div
		class="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[14rem_minmax(0,1fr)]"
	>
		<aside
			class={[
				'lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto',
				'fixed inset-x-0 top-14 z-20 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-5 pt-4 pb-8 lg:static lg:px-0 lg:pt-0 lg:pb-0',
				'bg-background/95 lg:bg-transparent border-border/60 border-b lg:border-b-0 backdrop-blur-md',
				'transition-transform duration-200 ease-out',
				navOpen ? 'translate-y-0' : '-translate-y-[110%] lg:translate-y-0',
			]}
		>
			<nav aria-label="On this page">
				<ul class="border-border/50 list-none border-l p-0">
					{#each sections as s (s.id)}
						<li>
							<a
								href="#{s.id}"
								class={[
									'-ml-px block border-l border-transparent px-3 py-1 text-xs leading-snug no-underline transition',
									activeId === s.id
										? 'border-primary text-foreground font-medium'
										: 'text-muted-foreground hover:text-foreground',
								]}
								onclick={(e) => {
									e.preventDefault();
									scrollTo(s.id);
								}}
							>
								{s.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</aside>

		<main class="prose-doc min-w-0 max-w-3xl">
			<Docs />
		</main>
	</div>
</div>
