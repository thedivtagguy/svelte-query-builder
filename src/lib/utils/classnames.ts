import { mergeClassnames as coreMergeClassnames } from '@react-querybuilder/core';
import type { Classnames } from '@react-querybuilder/core';
import { defaultControlClassnames } from '../defaults.js';

/**
 * Merge user-supplied classnames with core defaults. Returns a complete
 * Classnames object (every key populated, possibly with empty strings).
 */
export function mergeClassnames(...layers: Array<Partial<Classnames> | undefined>): Classnames {
	return coreMergeClassnames(defaultControlClassnames, ...layers);
}
