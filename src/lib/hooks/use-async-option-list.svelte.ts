import type { FullOption, FullOptionList } from '@react-querybuilder/core';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncOptionList<T extends FullOption = FullOption> {
	readonly status: AsyncStatus;
	readonly data: FullOptionList<T> | null;
	readonly error: Error | null;
	/** Trigger a (re-)load. Cancels any in-flight request. */
	load(input: unknown): void;
	/** Cancel any in-flight request without triggering a new one. */
	cancel(): void;
	/** Clear data + reset status. */
	reset(): void;
}

export interface CreateAsyncOptionListOptions<T extends FullOption> {
	fetcher: (input: unknown, signal: AbortSignal) => Promise<FullOptionList<T>>;
}

/**
 * Reactive helper for fields whose option list comes from an async source.
 *
 * Usage:
 *   const list = createAsyncOptionList<FullOption>({
 *     fetcher: async (input, signal) => fetch(`/api?q=${input}`, { signal }).then(r => r.json()),
 *   });
 *   $effect(() => list.load(currentField));
 *   // Read: list.status, list.data, list.error
 */
export function createAsyncOptionList<T extends FullOption = FullOption>(
	opts: CreateAsyncOptionListOptions<T>,
): AsyncOptionList<T> {
	let status = $state<AsyncStatus>('idle');
	let data = $state<FullOptionList<T> | null>(null);
	let error = $state<Error | null>(null);
	let controller: AbortController | null = null;

	function cancel() {
		controller?.abort();
		controller = null;
	}

	async function load(input: unknown) {
		cancel();
		controller = new AbortController();
		const signal = controller.signal;
		status = 'loading';
		error = null;
		try {
			const next = await opts.fetcher(input, signal);
			if (signal.aborted) return;
			data = next;
			status = 'success';
		} catch (e) {
			if (signal.aborted) return;
			error = e instanceof Error ? e : new Error(String(e));
			status = 'error';
		}
	}

	function reset() {
		cancel();
		status = 'idle';
		data = null;
		error = null;
	}

	return {
		get status() {
			return status;
		},
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		load,
		cancel,
		reset,
	};
}
