import { describe, it, expect } from 'vitest'
import { replayTurn } from '../replay'
import { InMemorySessionStore } from '../store'

describe('replayTurn', () => {
  it('replays basic text stream', () => {
    const fixture = [
      'data: {"type":"text","schema_version":"1.0","payload":{"delta":"hello"}}',
      'data: {"type":"done","schema_version":"1.0","payload":{}}',
    ].join('\n')
    const state = replayTurn(fixture)
    expect(state.textContent).toBe('hello')
    expect(state.status).toBe('done')
  })
})

describe('InMemorySessionStore', () => {
  it('persists messages per session', async () => {
    const store = new InMemorySessionStore()
    await store.saveMessages('s1', [{ id: '1', role: 'user', content: 'hi' }])
    const msgs = await store.getMessages('s1')
    expect(msgs).toHaveLength(1)
    expect(msgs[0].content).toBe('hi')
  })
})
