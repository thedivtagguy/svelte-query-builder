<script lang="ts" module>
	function joinChar(_v: unknown): string {
		return ',';
	}

	function toBetweenPair(value: unknown): [string, string] {
		if (Array.isArray(value)) {
			return [String(value[0] ?? ''), String(value[1] ?? '')];
		}
		const s = value == null ? '' : String(value);
		const [a, b] = s.split(joinChar(value));
		return [a ?? '', b ?? ''];
	}

	function fromBetweenPair(pair: [string, string], asArray: boolean): unknown {
		return asArray ? pair : `${pair[0]},${pair[1]}`;
	}

	function toMultiArray(value: unknown): string[] {
		if (Array.isArray(value)) return value.map(String);
		if (value == null || value === '') return [];
		return String(value).split(',');
	}
</script>

<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { cn } from '$lib/utils.js';
	import ValueSelector from './ValueSelector.svelte';
	import type { ValueEditorProps } from '../../types.js';

	let {
		value,
		operator,
		type = 'text',
		inputType = 'text',
		values,
		valueSource,
		title,
		className,
		disabled,
		listsAsArrays,
		onChange,
		path,
		level,
		schema,
	}: ValueEditorProps = $props();

	const isBetween = $derived(operator === 'between' || operator === 'notBetween');
	const isMultiSelectOp = $derived(operator === 'in' || operator === 'notIn');

	const stringValue = $derived(value == null ? '' : String(value));
	const boolValue = $derived(typeof value === 'boolean' ? value : false);
	const betweenPair = $derived(toBetweenPair(value));
	const multi = $derived(toMultiArray(value));

	function coerceNumber(s: string): unknown {
		if (s === '') return s;
		return Number.isFinite(Number(s)) ? Number(s) : s;
	}

	function handleString(next: string) {
		if (next === stringValue) return;
		onChange(inputType === 'number' ? coerceNumber(next) : next);
	}

	function handleBool(next: boolean) {
		if (next === boolValue) return;
		onChange(next);
	}

	function handleBetween(idx: 0 | 1, next: string) {
		const pair: [string, string] = [...betweenPair] as [string, string];
		pair[idx] = next;
		onChange(fromBetweenPair(pair, !!listsAsArrays));
	}

	function handleMulti(next: string) {
		const arr = next === '' ? [] : next.split(',');
		onChange(listsAsArrays ? arr : arr.join(','));
	}

	function fieldOptions() {
		// When valueSource is 'field', the value selector lists all fields.
		return schema.fields as never;
	}
</script>

{#if valueSource === 'field'}
	<ValueSelector
		options={fieldOptions()}
		value={stringValue}
		title={title}
		className={className}
		{disabled}
		onChange={(v) => onChange(v)}
		{path}
		{level}
		{schema}
	/>
{:else if isBetween}
	<span
		class={cn('inline-flex items-center gap-2', className)}
		data-rqb-element="value-editor"
		data-variant="between"
	>
		<Input
			type={inputType === 'number' ? 'number' : (inputType ?? 'text')}
			class="w-24"
			{title}
			{disabled}
			value={betweenPair[0]}
			oninput={(e) => handleBetween(0, (e.currentTarget as HTMLInputElement).value)}
			aria-label="From"
		/>
		<span class="text-muted-foreground text-xs">and</span>
		<Input
			type={inputType === 'number' ? 'number' : (inputType ?? 'text')}
			class="w-24"
			{title}
			{disabled}
			value={betweenPair[1]}
			oninput={(e) => handleBetween(1, (e.currentTarget as HTMLInputElement).value)}
			aria-label="To"
		/>
	</span>
{:else if type === 'select' && isMultiSelectOp}
	<!-- Naive multiselect: comma-joined string of values; Phase 3 will add a real chips picker. -->
	<Input
		type="text"
		class={cn('w-auto min-w-44', className)}
		{title}
		{disabled}
		value={multi.join(', ')}
		oninput={(e) => handleMulti((e.currentTarget as HTMLInputElement).value.replaceAll(' ', ''))}
		placeholder="comma,separated,values"
		aria-label={title}
		data-rqb-element="value-editor"
		data-variant="multiselect"
	/>
{:else if type === 'select'}
	<ValueSelector
		options={values ?? []}
		value={stringValue}
		title={title ?? ''}
		className={className ?? ''}
		{disabled}
		onChange={handleString}
		{path}
		{level}
		{schema}
	/>
{:else if type === 'checkbox'}
	<label
		class={cn('inline-flex items-center', className)}
		{title}
		data-rqb-element="value-editor"
		data-variant="checkbox"
	>
		<Checkbox checked={boolValue} onCheckedChange={handleBool} {disabled} />
	</label>
{:else if type === 'switch'}
	<label
		class={cn('inline-flex items-center', className)}
		{title}
		data-rqb-element="value-editor"
		data-variant="switch"
	>
		<Switch checked={boolValue} onCheckedChange={handleBool} {disabled} />
	</label>
{:else if type === 'textarea'}
	<textarea
		class={cn(
			'border-input bg-background dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 min-h-9 rounded-md border px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
			className,
		)}
		{title}
		{disabled}
		value={stringValue}
		oninput={(e) => handleString((e.currentTarget as HTMLTextAreaElement).value)}
		aria-label={title}
		data-rqb-element="value-editor"
		data-variant="textarea"
	></textarea>
{:else}
	<Input
		type={inputType === 'number' ? 'number' : (inputType ?? 'text')}
		class={cn('w-auto', className)}
		{title}
		{disabled}
		value={stringValue}
		oninput={(e) => handleString((e.currentTarget as HTMLInputElement).value)}
		aria-label={title}
		data-rqb-element="value-editor"
		data-variant="default"
	/>
{/if}
