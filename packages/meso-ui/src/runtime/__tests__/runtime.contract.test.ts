// @vitest-environment node
/**
 * Contract tests: fixture SSE stream → applyEvent → matches snapshot.
 *
 * Third parties can use these fixture files to verify their backend
 * emits protocol-compliant events.
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'
import { parseSSELine, applyEvent, createInitialStreamState } from '../index'
import type { StreamState } from '../streamState'

const FIXTURES = resolve(__dirname, '../../__fixtures__')

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
  it('empty line → null', () => {
    expect(parseSSELine('')).toBeNull()
  })

  it('SSE comment line → null', () => {
    expect(parseSSELine(': heartbeat')).toBeNull()
  })

  it('[DONE] sentinel → DoneEvent', () => {
    const event = parseSSELine('data: [DONE]')
    expect(event?.type).toBe('done')
  })

  it('invalid JSON → null', () => {
    expect(parseSSELine('data: {not json{{{')).toBeNull()
  })

  it('missing payload field → null', () => {
    expect(parseSSELine('data: {"type":"text","schema_version":"1.0"}')).toBeNull()
  })

  it('missing schema_version → tolerated, treated as 1.0', () => {
    const event = parseSSELine('data: {"type":"text","payload":{"delta":"hi"}}')
    expect(event?.type).toBe('text')
    expect(event?.schema_version).toBe('1.0')
  })

  it('valid text event → parsed correctly', () => {
    const event = parseSSELine(
      'data: {"type":"text","schema_version":"1.0","payload":{"delta":"hello"}}',
    )
    expect(event).toMatchObject({ type: 'text', payload: { delta: 'hello' } })
  })
})

// ── Runtime usable without React (Node.js only) ──────────────────────────────

describe('runtime is React-free', () => {
  it('createInitialStreamState, applyEvent, parseSSELine run in Node without React', () => {
    const state = createInitialStreamState()
    const event = parseSSELine(
      'data: {"type":"text","schema_version":"1.0","payload":{"delta":"test"}}',
    )
    const next = applyEvent(state, event!)
    expect(next.textContent).toBe('test')
  })
})
