/**
 * Contract tests for @meso/types runtime.
 *
 * These tests are the ground truth for protocol compliance.
 * The fixture files (src/__fixtures__/) double as reference material
 * for third-party backend authors — replay them through the runtime
 * to verify SSE output conforms to protocol v1.0.
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'
import { parseSSELine, applyEvent, createInitialStreamState } from '../index'
import type { StreamState } from '../streamState'

const FIXTURES = resolve(__dirname, '../__fixtures__')

function replayFixture(name: string): StreamState {
  const lines = readFileSync(resolve(FIXTURES, name), 'utf-8').split('\n')
  return lines.reduce<StreamState>(
    (state, line) => {
      const event = parseSSELine(line)
      return event ? applyEvent(state, event) : state
    },
    { ...createInitialStreamState(), status: 'streaming' },
  )
}

function loadSnapshot(name: string): Partial<StreamState> {
  return JSON.parse(readFileSync(resolve(FIXTURES, name), 'utf-8'))
}

// ── Fixture contract tests ───────────────────────────────────────────────────

describe('basic-stream contract', () => {
  it('final state matches snapshot', () => {
    expect(replayFixture('basic-stream.txt')).toMatchObject(
      loadSnapshot('basic-stream.snapshot.json'),
    )
  })

  it('stage dedup: only one entry per name', () => {
    const state = replayFixture('basic-stream.txt')
    expect(state.stages).toHaveLength(1)
    expect(state.stages[0]).toEqual({ name: '召回记忆', state: 'done' })
  })

  it('think: content accumulated, thinkDone=true on last chunk', () => {
    const state = replayFixture('basic-stream.txt')
    expect(state.thinkContent).toBe('用户想要简洁答案')
    expect(state.thinkDone).toBe(true)
  })
})

describe('extension-stream contract', () => {
  it('final state matches snapshot', () => {
    expect(replayFixture('extension-stream.txt')).toMatchObject(
      loadSnapshot('extension-stream.snapshot.json'),
    )
  })

  it('extensionLog preserves arrival order', () => {
    const state = replayFixture('extension-stream.txt')
    expect(state.extensionLog).toHaveLength(2)
    expect((state.extensionLog[0].payload as { data: { status: string } }).data.status).toBe('running')
    expect((state.extensionLog[1].payload as { data: { status: string } }).data.status).toBe('done')
  })

  it('extensions keyed by name for lookup', () => {
    const state = replayFixture('extension-stream.txt')
    expect(state.extensions['tool_progress']).toHaveLength(2)
  })
})

describe('error-stream contract', () => {
  it('final state matches snapshot', () => {
    expect(replayFixture('error-stream.txt')).toMatchObject(
      loadSnapshot('error-stream.snapshot.json'),
    )
  })

  it('status=error after error event, not done', () => {
    const state = replayFixture('error-stream.txt')
    expect(state.status).toBe('error')
    expect(state.errorMessage).toBe('上游服务超时')
  })
})

// ── parseSSELine edge cases ──────────────────────────────────────────────────

describe('parseSSELine', () => {
  it('empty line → null', () => expect(parseSSELine('')).toBeNull())
  it('SSE comment → null', () => expect(parseSSELine(': heartbeat')).toBeNull())
  it('[DONE] → DoneEvent', () => expect(parseSSELine('data: [DONE]')?.type).toBe('done'))
  it('invalid JSON → null', () => expect(parseSSELine('data: {not json{{{')).toBeNull())
  it('missing payload → null', () => {
    expect(parseSSELine('data: {"type":"text","schema_version":"1.0"}')).toBeNull()
  })
  it('missing schema_version → tolerated as 1.0', () => {
    const event = parseSSELine('data: {"type":"text","payload":{"delta":"hi"}}')
    expect(event?.type).toBe('text')
    expect(event?.schema_version).toBe('1.0')
  })
  it('valid text event → parsed', () => {
    const event = parseSSELine(
      'data: {"type":"text","schema_version":"1.0","payload":{"delta":"hello"}}',
    )
    expect(event).toMatchObject({ type: 'text', payload: { delta: 'hello' } })
  })
})

// ── applyEvent unit tests ────────────────────────────────────────────────────

describe('applyEvent', () => {
  const initial = createInitialStreamState()
  const streaming = { ...initial, status: 'streaming' as const }

  it('stage: deduplicates by name', () => {
    const s1 = applyEvent(streaming, { type: 'stage', schema_version: '1.0', payload: { name: 'A', state: 'active' } })
    const s2 = applyEvent(s1,       { type: 'stage', schema_version: '1.0', payload: { name: 'A', state: 'done' } })
    expect(s2.stages).toHaveLength(1)
    expect(s2.stages[0].state).toBe('done')
  })

  it('memory: replaces snippets', () => {
    const s = applyEvent(streaming, {
      type: 'memory', schema_version: '1.0',
      payload: { snippets: [{ category: 'pref', content: 'concise' }] },
    })
    expect(s.memorySnippets).toHaveLength(1)
  })

  it('artifact: tracks multiple by id in insertion order', () => {
    const s1 = applyEvent(streaming, { type: 'artifact', schema_version: '1.0', payload: { id: 'a1', lang: 'py', delta: 'x', done: false } })
    const s2 = applyEvent(s1,       { type: 'artifact', schema_version: '1.0', payload: { id: 'a2', lang: 'html preview', delta: 'y', done: false } })
    expect(s2.artifactOrder).toEqual(['a1', 'a2'])
  })

  it('extension: log + keyed lookup', () => {
    const s1 = applyEvent(streaming, { type: 'extension', schema_version: '1.0', payload: { name: 'tool', data: 1 } })
    const s2 = applyEvent(s1,       { type: 'extension', schema_version: '1.0', payload: { name: 'tool', data: 2 } })
    expect(s2.extensionLog).toHaveLength(2)
    expect(s2.extensions['tool']).toHaveLength(2)
  })

  it('done/error: mutually exclusive status', () => {
    const done  = applyEvent(streaming, { type: 'done',  schema_version: '1.0', payload: {} })
    const error = applyEvent(streaming, { type: 'error', schema_version: '1.0', payload: { message: 'fail' } })
    expect(done.status).toBe('done')
    expect(error.status).toBe('error')
  })

  it('does not mutate input state', () => {
    const snap = JSON.stringify(streaming)
    applyEvent(streaming, { type: 'text', schema_version: '1.0', payload: { delta: 'x' } })
    expect(JSON.stringify(streaming)).toBe(snap)
  })
})

// ── Zero React dependency ────────────────────────────────────────────────────

describe('zero React dependency', () => {
  it('full pipeline runs in Node without React', () => {
    const line = 'data: {"type":"text","schema_version":"1.0","payload":{"delta":"ok"}}'
    const event = parseSSELine(line)
    const state = applyEvent(createInitialStreamState(), event!)
    expect(state.textContent).toBe('ok')
  })
})
