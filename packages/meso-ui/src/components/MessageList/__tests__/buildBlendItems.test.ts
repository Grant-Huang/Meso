import { describe, it, expect } from 'vitest'
import { createInitialStreamState, applyEvent } from '../../../runtime'
import type { StreamState, SSEEvent, StreamStatus } from '../../../runtime'
import { buildBlendItems } from '../buildBlendItems'

/**
 * Build a StreamState by applying a sequence of events through the real
 * reducer. This keeps the test fixture aligned with protocol semantics
 * (eventLog + textChunks + artifact accumulation) without hand-crafting
 * internal state shape.
 */
function streamFrom(events: SSEEvent[]): StreamState {
  let s: StreamState = { ...createInitialStreamState(), status: 'streaming' as StreamStatus }
  for (const e of events) s = applyEvent(s, e)
  return s
}

/** Stamp schema_version so the event matches the SSEEvent contract. */
const ev = (e: Omit<SSEEvent, 'schema_version'>): SSEEvent =>
  ({ ...e, schema_version: '1.0' } as SSEEvent)

describe('buildBlendItems', () => {
  it('emits a single artifact item when the same id arrives across multiple streaming deltas', () => {
    // Real-world shape: artifact events arrive incrementally with the SAME id
    // (done:false deltas + a final done:true). The reducer accumulates content
    // into stream.artifacts[id], and buildBlendItems must collapse the eventLog
    // entries into a single panel — otherwise React renders duplicate keys.
    const s = streamFrom([
      ev({ type: 'text', payload: { delta: '生成中…' } }),
      ev({ type: 'artifact', payload: { id: 'a1', lang: 'typescript', delta: 'line 1\n', done: false } }),
      ev({ type: 'artifact', payload: { id: 'a1', lang: 'typescript', delta: 'line 2\n', done: false } }),
      ev({ type: 'artifact', payload: { id: 'a1', lang: 'typescript', delta: '', done: true } }),
    ])

    const items = buildBlendItems(s)

    const artifactItems = items.filter(i => i.kind === 'artifact')
    expect(artifactItems).toHaveLength(1)
    expect(artifactItems[0].key).toBe('artifact-a1')
  })

  it('produces unique keys across multiple distinct artifacts interleaved with text', () => {
    const s = streamFrom([
      ev({ type: 'text', payload: { delta: 'first ' } }),
      ev({ type: 'text', payload: { delta: 'run' } }),
      ev({ type: 'artifact', payload: { id: 'a1', lang: 'html', delta: '<p>one</p>', done: true } }),
      ev({ type: 'text', payload: { delta: 'second' } }),
      ev({ type: 'artifact', payload: { id: 'a2', lang: 'html', delta: '<p>two</p>', done: true } }),
    ])

    const items = buildBlendItems(s)
    const keys = items.map(i => i.key)

    // All keys must be unique — this is the property React requires.
    expect(new Set(keys).size).toBe(keys.length)
    // Order preserved: text → artifact a1 → text → artifact a2
    expect(items.map(i => i.kind)).toEqual(['text', 'artifact', 'text', 'artifact'])
  })

  it('coalesces consecutive text deltas into a single text run', () => {
    const s = streamFrom([
      ev({ type: 'text', payload: { delta: 'Hello' } }),
      ev({ type: 'text', payload: { delta: ', ' } }),
      ev({ type: 'text', payload: { delta: 'world!' } }),
    ])

    const items = buildBlendItems(s)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ kind: 'text', text: 'Hello, world!' })
  })

  it('respects hiddenArtifactLangs by skipping matching artifacts entirely', () => {
    const s = streamFrom([
      ev({ type: 'text', payload: { delta: 'before' } }),
      ev({ type: 'artifact', payload: { id: 'hidden1', lang: 'html', delta: '<p/>', done: true } }),
      ev({ type: 'artifact', payload: { id: 'hidden1', lang: 'html', delta: '<p/>', done: false } }),
      ev({ type: 'text', payload: { delta: 'after' } }),
    ])

    const items = buildBlendItems(s, ['html'])
    expect(items.every(i => i.kind !== 'artifact')).toBe(true)
    // Hidden artifacts don't flush text, so the two text runs coalesce into one.
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ kind: 'text', text: 'beforeafter' })
  })

  it('returns an empty list for a fresh (eventless) stream', () => {
    const s = { ...createInitialStreamState(), status: 'streaming' as StreamStatus }
    expect(buildBlendItems(s)).toEqual([])
  })
})
