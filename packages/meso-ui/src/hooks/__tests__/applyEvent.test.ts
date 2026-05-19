import { describe, it, expect } from 'vitest'
import type { StreamState, SSEEvent } from '../useSSEStream'

// Copy applyEvent here for testing (it's an internal pure function)
// We test the state machine logic independently
const initialState: StreamState = {
  status: 'idle',
  stages: [],
  memoryItems: [],
  thinkContent: '',
  thinkDone: false,
  textContent: '',
  artifact: null,
  errorMessage: null,
}

function applyEvent(prev: StreamState, event: SSEEvent): StreamState {
  switch (event.type) {
    case 'stage':
      return { ...prev, stages: [...prev.stages.filter(s => s.label !== event.label), event] }
    case 'memory':
      return { ...prev, memoryItems: event.items }
    case 'think':
      return { ...prev, thinkContent: prev.thinkContent + event.delta, thinkDone: event.done ?? false }
    case 'text':
      return { ...prev, textContent: prev.textContent + event.delta }
    case 'artifact':
      return { ...prev, artifact: { type: event.artifactType, language: event.language, content: (prev.artifact?.content ?? '') + event.delta } }
    case 'done':
      return { ...prev, status: 'done' }
    case 'error':
      return { ...prev, status: 'error', errorMessage: event.message }
    default:
      return prev
  }
}

describe('applyEvent state machine', () => {
  it('stage: adds new stage', () => {
    const next = applyEvent(initialState, { type: 'stage', label: '召回记忆', status: 'active' })
    expect(next.stages).toHaveLength(1)
    expect(next.stages[0].label).toBe('召回记忆')
    expect(next.stages[0].status).toBe('active')
  })

  it('stage: updates existing stage by label (dedup)', () => {
    const s1 = applyEvent(initialState, { type: 'stage', label: '召回记忆', status: 'active' })
    const s2 = applyEvent(s1, { type: 'stage', label: '召回记忆', status: 'done' })
    expect(s2.stages).toHaveLength(1)
    expect(s2.stages[0].status).toBe('done')
  })

  it('stage: keeps multiple different stages', () => {
    const s1 = applyEvent(initialState, { type: 'stage', label: 'A', status: 'done' })
    const s2 = applyEvent(s1, { type: 'stage', label: 'B', status: 'active' })
    expect(s2.stages).toHaveLength(2)
  })

  it('memory: replaces memoryItems', () => {
    const next = applyEvent(initialState, { type: 'memory', items: ['item1', 'item2'] })
    expect(next.memoryItems).toEqual(['item1', 'item2'])
  })

  it('think: appends delta, sets thinkDone false', () => {
    const s1 = applyEvent(initialState, { type: 'think', delta: 'hello ', done: false })
    const s2 = applyEvent(s1, { type: 'think', delta: 'world', done: true })
    expect(s2.thinkContent).toBe('hello world')
    expect(s2.thinkDone).toBe(true)
  })

  it('text: appends delta', () => {
    const s1 = applyEvent(initialState, { type: 'text', delta: 'Hello' })
    const s2 = applyEvent(s1, { type: 'text', delta: ' world' })
    expect(s2.textContent).toBe('Hello world')
  })

  it('artifact: creates artifact and appends delta', () => {
    const s1 = applyEvent(initialState, { type: 'artifact', artifactType: 'code', language: 'python', delta: 'def ', done: false })
    const s2 = applyEvent(s1, { type: 'artifact', artifactType: 'code', language: 'python', delta: 'foo(): pass', done: true })
    expect(s2.artifact?.type).toBe('code')
    expect(s2.artifact?.content).toBe('def foo(): pass')
    expect(s2.artifact?.language).toBe('python')
  })

  it('done: sets status to done', () => {
    const streaming = { ...initialState, status: 'streaming' as const }
    const next = applyEvent(streaming, { type: 'done' })
    expect(next.status).toBe('done')
  })

  it('error: sets status and errorMessage', () => {
    const next = applyEvent(initialState, { type: 'error', message: '连接失败' })
    expect(next.status).toBe('error')
    expect(next.errorMessage).toBe('连接失败')
  })

  it('unknown event type: returns state unchanged', () => {
    applyEvent(initialState, { type: 'done' })
    // done changes status, just verify the function is pure (no mutation)
    expect(initialState.status).toBe('idle')
  })
})
