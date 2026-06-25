import { describe, it, expect } from 'vitest'
import { resolveVerbosity } from '../verbosity'
import type { SimplifyOptions } from '../../components/ProcessTrace/ProcessTrace'

describe('resolveVerbosity', () => {
  it('returns "standard" when no simplify is provided', () => {
    expect(resolveVerbosity(undefined)).toBe('standard')
  })

  it('returns "standard" when simplify is empty object', () => {
    expect(resolveVerbosity({})).toBe('standard')
  })

  it('returns the explicit verbosity when set', () => {
    expect(resolveVerbosity({ verbosity: 'compact' })).toBe('compact')
    expect(resolveVerbosity({ verbosity: 'standard' })).toBe('standard')
    expect(resolveVerbosity({ verbosity: 'detailed' })).toBe('detailed')
  })

  it('verbosity field takes precedence over legacy compact boolean', () => {
    // explicit verbosity wins even when compact:true is also set
    expect(resolveVerbosity({ verbosity: 'detailed', compact: true })).toBe('detailed')
  })

  it('falls back to "compact" when legacy compact:true and no verbosity', () => {
    expect(resolveVerbosity({ compact: true })).toBe('compact')
  })

  it('falls back to "standard" when legacy compact:false and no verbosity', () => {
    expect(resolveVerbosity({ compact: false })).toBe('standard')
  })

  it('ignores other SimplifyOptions fields when deriving verbosity', () => {
    const opts: SimplifyOptions = {
      showDuration: false,
      showProvider: true,
      defaultParamsCollapsed: true,
      hideMetadata: true,
    }
    // none of these set verbosity/compact → standard
    expect(resolveVerbosity(opts)).toBe('standard')
  })
})
