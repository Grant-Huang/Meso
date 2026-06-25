import type { SimplifyOptions } from '../components/ProcessTrace/ProcessTrace'

export type Verbosity = 'compact' | 'standard' | 'detailed'

/**
 * Resolve the effective verbosity level from SimplifyOptions.
 * Falls back to the legacy `compact` boolean, then to 'standard'.
 */
export function resolveVerbosity(simplify?: SimplifyOptions): Verbosity {
  if (!simplify) return 'standard'
  if (simplify.verbosity) return simplify.verbosity
  return simplify.compact ? 'compact' : 'standard'
}
