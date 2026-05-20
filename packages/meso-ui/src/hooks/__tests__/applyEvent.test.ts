import { describe, it, expect } from 'vitest'
import { applyEvent, createInitialStreamState } from '../../runtime'
import type { StreamState } from '../../runtime'
import type { SSEEvent } from '../../runtime/protocol'

const initial = createInitialStreamState()
const streaming: StreamState = { ...initial, status: 'streaming' }

function ev<T extends SSEEvent>(e: T): T { return e }

describe('applyEvent state machine', () => {
  describe('stage', () => {
    it('adds new stage', () => {
      const next = applyEvent(streaming, ev({
        type: 'stage', schema_version: '1.0',
        payload: { name: '召回记忆', state: 'active' },
      }))
      expect(next.stages).toHaveLength(1)
      expect(next.stages[0].name).toBe('召回记忆')
      expect(next.stages[0].state).toBe('active')
    })

    it('deduplicates by name (upsert, append to end)', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'stage', schema_version: '1.0',
        payload: { name: '召回记忆', state: 'active' },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'stage', schema_version: '1.0',
        payload: { name: '召回记忆', state: 'done' },
      }))
      expect(s2.stages).toHaveLength(1)
      expect(s2.stages[0].state).toBe('done')
    })

    it('keeps multiple different stages', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'stage', schema_version: '1.0',
        payload: { name: 'A', state: 'done' },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'stage', schema_version: '1.0',
        payload: { name: 'B', state: 'active' },
      }))
      expect(s2.stages).toHaveLength(2)
    })
  })

  describe('memory', () => {
    it('replaces memorySnippets', () => {
      const next = applyEvent(streaming, ev({
        type: 'memory', schema_version: '1.0',
        payload: { snippets: [{ category: 'preference', content: '偏好简洁' }] },
      }))
      expect(next.memorySnippets).toEqual([{ category: 'preference', content: '偏好简洁' }])
    })
  })

  describe('think', () => {
    it('appends delta and sets thinkDone', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'think', schema_version: '1.0',
        payload: { delta: 'hello ', done: false },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'think', schema_version: '1.0',
        payload: { delta: 'world', done: true },
      }))
      expect(s2.thinkContent).toBe('hello world')
      expect(s2.thinkDone).toBe(true)
    })
  })

  describe('text', () => {
    it('appends delta', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'text', schema_version: '1.0',
        payload: { delta: 'Hello' },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'text', schema_version: '1.0',
        payload: { delta: ' world' },
      }))
      expect(s2.textContent).toBe('Hello world')
    })
  })

  describe('artifact', () => {
    it('creates artifact entry and appends delta', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'artifact', schema_version: '1.0',
        payload: { id: 'a1', lang: 'python', delta: 'def ', done: false },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'artifact', schema_version: '1.0',
        payload: { id: 'a1', lang: 'python', delta: 'foo(): pass', done: true },
      }))
      expect(s2.artifactOrder).toEqual(['a1'])
      expect(s2.artifacts['a1'].content).toBe('def foo(): pass')
      expect(s2.artifacts['a1'].lang).toBe('python')
      expect(s2.artifacts['a1'].done).toBe(true)
    })

    it('tracks multiple artifacts in insertion order', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'artifact', schema_version: '1.0',
        payload: { id: 'a1', lang: 'python', delta: 'x', done: true },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'artifact', schema_version: '1.0',
        payload: { id: 'a2', lang: 'html preview', delta: '<h1>', done: false },
      }))
      expect(s2.artifactOrder).toEqual(['a1', 'a2'])
    })
  })

  describe('done', () => {
    it('sets status to done', () => {
      const next = applyEvent(streaming, ev({
        type: 'done', schema_version: '1.0', payload: {},
      }))
      expect(next.status).toBe('done')
    })
  })

  describe('error', () => {
    it('sets status and errorMessage', () => {
      const next = applyEvent(streaming, ev({
        type: 'error', schema_version: '1.0',
        payload: { message: '连接失败' },
      }))
      expect(next.status).toBe('error')
      expect(next.errorMessage).toBe('连接失败')
    })
  })

  describe('extension', () => {
    it('appends to extensionLog in order', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'extension', schema_version: '1.0',
        payload: { name: 'tool_progress', data: { status: 'running' } },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'extension', schema_version: '1.0',
        payload: { name: 'tool_progress', data: { status: 'done' } },
      }))
      expect(s2.extensionLog).toHaveLength(2)
      expect(s2.extensions['tool_progress']).toHaveLength(2)
    })

    it('keys by name for lookup while preserving log order', () => {
      const s1 = applyEvent(streaming, ev({
        type: 'extension', schema_version: '1.0',
        payload: { name: 'tool_a', data: {} },
      }))
      const s2 = applyEvent(s1, ev({
        type: 'extension', schema_version: '1.0',
        payload: { name: 'tool_b', data: {} },
      }))
      const s3 = applyEvent(s2, ev({
        type: 'extension', schema_version: '1.0',
        payload: { name: 'tool_a', data: {} },
      }))
      expect(s3.extensionLog).toHaveLength(3)
      expect(s3.extensions['tool_a']).toHaveLength(2)
      expect(s3.extensions['tool_b']).toHaveLength(1)
    })
  })

  describe('immutability', () => {
    it('does not mutate the input state', () => {
      const before = { ...streaming }
      applyEvent(streaming, ev({
        type: 'text', schema_version: '1.0',
        payload: { delta: 'mutate test' },
      }))
      expect(streaming).toEqual(before)
    })
  })
})
