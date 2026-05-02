import { formatQuery } from '$lib/index.js';

export function fmt(q: unknown, format: string): string {
	try {
		const out = formatQuery(q as never, format as never);
		return typeof out === 'string' ? out : JSON.stringify(out, null, 2);
	} catch (e) {
		return `// ${(e as Error).message}`;
	}
}
