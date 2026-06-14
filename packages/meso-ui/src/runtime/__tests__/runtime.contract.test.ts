/**
 * Smoke test: verify @meso.ai/ui/runtime re-exports from @meso.ai/types correctly.
 * Full contract tests (fixture → snapshot) live in packages/meso-types.
 */
import { describe, it, expect } from 'vitest'
import { parseSSELine, applyEvent, createInitialStreamState, PROTOCOL_VERSION } from '../index'

describe('@meso.ai/ui/runtime re-exports from @meso.ai/types', () => {
  it('PROTOCOL_VERSION is exported', () => {
    expect(PROTOCOL_VERSION).toBe('1.0')
  })

  it('createInitialStreamState returns correct shape', () => {
    const state = createInitialStreamState()
    expect(state.status).toBe('idle')
    expect(state.phaseOrder).toEqual([])
    expect(state.extensionLog).toEqual([])
    expect(state.artifactOrder).toEqual([])
  })

  it('parseSSELine parses a text event', () => {
    const event = parseSSELine(
      'data: {"type":"text","schema_version":"1.0","payload":{"delta":"hello"}}',
    )
    expect(event).toMatchObject({ type: 'text', payload: { delta: 'hello' } })
  })

  it('applyEvent accumulates text', () => {
    const s1 = applyEvent(
      { ...createInitialStreamState(), status: 'streaming' },
      { type: 'text', schema_version: '1.0', payload: { delta: 'hi' } },
    )
    expect(s1.textContent).toBe('hi')
  })

  it('parseSSELine null cases pass through', () => {
    expect(parseSSELine('')).toBeNull()
    expect(parseSSELine(': comment')).toBeNull()
    expect(parseSSELine('data: bad json')).toBeNull()
  })
})
