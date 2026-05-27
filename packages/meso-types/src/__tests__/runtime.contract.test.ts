/**
 * Contract tests for @meso.ai/types runtime.
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

describe('tools-stream contract', () => {
  it('final state matches snapshot', () => {
    expect(replayFixture('tools-stream.txt')).toMatchObject(
      loadSnapshot('tools-stream.snapshot.json'),
    )
  })

  it('toolCallOrder preserves arrival order', () => {
    const state = replayFixture('tools-stream.txt')
    expect(state.toolCallOrder).toEqual(['tc1', 'tc2'])
  })

  it('tool_result correlates by tool_call_id', () => {
    const state = replayFixture('tools-stream.txt')
    expect(state.toolCalls['tc1'].status).toBe('done')
    expect(state.toolCalls['tc1'].result?.output).toBe('找到 3 条相关记录')
  })

  it('memory_saved accumulates entries', () => {
    const state = replayFixture('tools-stream.txt')
    expect(state.memorySaved).toHaveLength(1)
    expect(state.memorySaved[0].id).toBe('m1')
  })
})

describe('soul-stream contract', () => {
  it('final state matches snapshot', () => {
    expect(replayFixture('soul-stream.txt')).toMatchObject(
      loadSnapshot('soul-stream.snapshot.json'),
    )
  })

  it('activeSoul set from soul event', () => {
    const state = replayFixture('soul-stream.txt')
    expect(state.activeSoul?.id).toBe('research-assistant')
    expect(state.activeSoul?.traits).toEqual(['严谨', '好奇', '简洁'])
  })
})

describe('workflow-stream contract', () => {
  it('final state matches snapshot', () => {
    expect(replayFixture('workflow-stream.txt')).toMatchObject(
      loadSnapshot('workflow-stream.snapshot.json'),
    )
  })

  it('workflowRunOrder preserves first-seen order', () => {
    const state = replayFixture('workflow-stream.txt')
    expect(state.workflowRunOrder).toEqual(['run-001'])
  })

  it('nodeOrder preserves arrival order', () => {
    const state = replayFixture('workflow-stream.txt')
    expect(state.workflowRuns['run-001'].nodeOrder).toEqual(['n1', 'n2', 'n3', 'n4'])
  })

  it('node state updated in-place (no duplicates)', () => {
    const state = replayFixture('workflow-stream.txt')
    const run = state.workflowRuns['run-001']
    expect(run.nodeOrder).toHaveLength(4)
    expect(run.nodes['n1'].state).toBe('done')
    expect(run.nodes['n1'].duration_ms).toBe(42)
  })

  it('parent_id preserved for tree structure', () => {
    const state = replayFixture('workflow-stream.txt')
    const { nodes } = state.workflowRuns['run-001']
    expect(nodes['n2'].parent_id).toBe('n1')
    expect(nodes['n3'].parent_id).toBe('n2')
    expect(nodes['n1'].parent_id).toBeUndefined()
  })

  it('error state recorded on failed node', () => {
    const state = replayFixture('workflow-stream.txt')
    expect(state.workflowRuns['run-001'].nodes['n4'].state).toBe('error')
    expect(state.workflowRuns['run-001'].nodes['n4'].metadata?.error).toBe('timeout')
  })

  it('stages unaffected by workflow_node events', () => {
    const state = replayFixture('workflow-stream.txt')
    expect(state.stages).toHaveLength(3)
    expect(state.stages.every(s => s.state === 'done')).toBe(true)
  })
})

describe('mcp-stream contract', () => {
  it('final state matches snapshot', () => {
    expect(replayFixture('mcp-stream.txt')).toMatchObject(
      loadSnapshot('mcp-stream.snapshot.json'),
    )
  })

  it('capabilities announced at stream start', () => {
    const state = replayFixture('mcp-stream.txt')
    expect(state.availableCapabilities?.tools).toHaveLength(3)
    expect(state.availableCapabilities?.mcp_servers).toHaveLength(2)
  })

  it('skill_active sets activeSkill with focus', () => {
    const state = replayFixture('mcp-stream.txt')
    expect(state.activeSkill?.id).toBe('analyst')
    expect(state.activeSkill?.focus).toEqual(['stats'])
  })

  it('resource_read + resource_content correlate correctly', () => {
    const state = replayFixture('mcp-stream.txt')
    expect(state.resourceReadOrder).toEqual(['rr1'])
    expect(state.resourceReads['rr1'].status).toBe('done')
    expect(state.resourceReads['rr1'].content?.contents[0].text).toBe('产品A: 100件\n产品B: 50件')
  })

  it('mcp tool_call carries provider + server metadata', () => {
    const state = replayFixture('mcp-stream.txt')
    expect(state.toolCalls['tc1'].call.provider).toBe('mcp')
    expect(state.toolCalls['tc1'].call.server).toBe('brave-search')
    expect(state.toolCalls['tc1'].call.annotations?.open_world).toBe(true)
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

  it('memory_saved: accumulates entries', () => {
    const s1 = applyEvent(streaming, { type: 'memory_saved', schema_version: '1.0', payload: { id: 'm1', category: 'fact', preview: 'p1' } })
    const s2 = applyEvent(s1,       { type: 'memory_saved', schema_version: '1.0', payload: { id: 'm2', category: 'preference', preview: 'p2' } })
    expect(s2.memorySaved).toHaveLength(2)
    expect(s2.memorySaved[1].id).toBe('m2')
  })

  it('capabilities: stores availableCapabilities', () => {
    const s = applyEvent(streaming, {
      type: 'capabilities', schema_version: '1.0',
      payload: { tools: [{ name: 'search', provider: 'mcp' as const }] },
    })
    expect(s.availableCapabilities?.tools).toHaveLength(1)
    expect(s.availableCapabilities?.tools?.[0].provider).toBe('mcp')
  })

  it('soul: sets activeSoul', () => {
    const s = applyEvent(streaming, {
      type: 'soul', schema_version: '1.0',
      payload: { id: 'bot', name: 'Bot', version: '1.0.0' },
    })
    expect(s.activeSoul?.id).toBe('bot')
  })

  it('skill_active: sets activeSkill with focus', () => {
    const s = applyEvent(streaming, {
      type: 'skill_active', schema_version: '1.0',
      payload: { id: 'analyst', name: '分析师', focus: ['stats'] },
    })
    expect(s.activeSkill?.id).toBe('analyst')
    expect(s.activeSkill?.focus).toEqual(['stats'])
  })

  it('resource_read: appends to order list, status pending', () => {
    const s = applyEvent(streaming, {
      type: 'resource_read', schema_version: '1.0',
      payload: { id: 'rr1', uri: 'db://products', server: 'inv' },
    })
    expect(s.resourceReadOrder).toEqual(['rr1'])
    expect(s.resourceReads['rr1'].status).toBe('pending')
  })

  it('resource_read: order list deduplicates by id', () => {
    const s1 = applyEvent(streaming, { type: 'resource_read', schema_version: '1.0', payload: { id: 'rr1', uri: 'x' } })
    const s2 = applyEvent(s1,       { type: 'resource_read', schema_version: '1.0', payload: { id: 'rr1', uri: 'x' } })
    expect(s2.resourceReadOrder).toHaveLength(1)
  })

  it('resource_content: correlates and sets done status', () => {
    const s1 = applyEvent(streaming, { type: 'resource_read', schema_version: '1.0', payload: { id: 'rr1', uri: 'db://x' } })
    const s2 = applyEvent(s1, {
      type: 'resource_content', schema_version: '1.0',
      payload: { resource_read_id: 'rr1', contents: [{ type: 'text', text: 'hello' }] },
    })
    expect(s2.resourceReads['rr1'].status).toBe('done')
    expect(s2.resourceReads['rr1'].content?.contents[0].text).toBe('hello')
  })

  it('resource_content with error: status=error', () => {
    const s1 = applyEvent(streaming, { type: 'resource_read', schema_version: '1.0', payload: { id: 'rr1', uri: 'db://x' } })
    const s2 = applyEvent(s1, { type: 'resource_content', schema_version: '1.0', payload: { resource_read_id: 'rr1', contents: [], error: '访问拒绝' } })
    expect(s2.resourceReads['rr1'].status).toBe('error')
  })

  it('tool_call: appends to order list, status pending', () => {
    const s = applyEvent(streaming, {
      type: 'tool_call', schema_version: '1.0',
      payload: { id: 'tc1', name: 'read_file', args: { path: '/a' }, risk: 'safe' },
    })
    expect(s.toolCallOrder).toEqual(['tc1'])
    expect(s.toolCalls['tc1'].status).toBe('pending')
  })

  it('tool_call: order list deduplicates by id', () => {
    const s1 = applyEvent(streaming, { type: 'tool_call', schema_version: '1.0', payload: { id: 'tc1', name: 'x', args: {} } })
    const s2 = applyEvent(s1,       { type: 'tool_call', schema_version: '1.0', payload: { id: 'tc1', name: 'x', args: {} } })
    expect(s2.toolCallOrder).toHaveLength(1)
  })

  it('tool_result: correlates and sets done status', () => {
    const s1 = applyEvent(streaming, { type: 'tool_call', schema_version: '1.0', payload: { id: 'tc1', name: 'x', args: {} } })
    const s2 = applyEvent(s1, { type: 'tool_result', schema_version: '1.0', payload: { tool_call_id: 'tc1', output: 'ok' } })
    expect(s2.toolCalls['tc1'].status).toBe('done')
    expect(s2.toolCalls['tc1'].result?.output).toBe('ok')
  })

  it('tool_result with error: status=error', () => {
    const s1 = applyEvent(streaming, { type: 'tool_call', schema_version: '1.0', payload: { id: 'tc1', name: 'x', args: {} } })
    const s2 = applyEvent(s1, { type: 'tool_result', schema_version: '1.0', payload: { tool_call_id: 'tc1', output: '', error: '权限拒绝' } })
    expect(s2.toolCalls['tc1'].status).toBe('error')
  })

  it('artifact: tracks multiple by id in insertion order', () => {
    const s1 = applyEvent(streaming, { type: 'artifact', schema_version: '1.0', payload: { id: 'a1', lang: 'py', delta: 'x', done: false } })
    const s2 = applyEvent(s1,       { type: 'artifact', schema_version: '1.0', payload: { id: 'a2', lang: 'html preview', delta: 'y', done: false } })
    expect(s2.artifactOrder).toEqual(['a1', 'a2'])
  })

  it('workflow_node: creates run and node on first event', () => {
    const s = applyEvent(streaming, {
      type: 'workflow_node', schema_version: '1.0',
      payload: { run_id: 'r1', node_id: 'n1', name: 'web_search', state: 'active' },
    })
    expect(s.workflowRunOrder).toEqual(['r1'])
    expect(s.workflowRuns['r1'].nodeOrder).toEqual(['n1'])
    expect(s.workflowRuns['r1'].nodes['n1'].state).toBe('active')
  })

  it('workflow_node: updates node state in-place, no order duplication', () => {
    const s1 = applyEvent(streaming, {
      type: 'workflow_node', schema_version: '1.0',
      payload: { run_id: 'r1', node_id: 'n1', name: 'web_search', state: 'active' },
    })
    const s2 = applyEvent(s1, {
      type: 'workflow_node', schema_version: '1.0',
      payload: { run_id: 'r1', node_id: 'n1', name: 'web_search', state: 'done', duration_ms: 100 },
    })
    expect(s2.workflowRuns['r1'].nodeOrder).toHaveLength(1)
    expect(s2.workflowRuns['r1'].nodes['n1'].state).toBe('done')
    expect(s2.workflowRuns['r1'].nodes['n1'].duration_ms).toBe(100)
  })

  it('workflow_node: multiple runs tracked independently', () => {
    const s1 = applyEvent(streaming, {
      type: 'workflow_node', schema_version: '1.0',
      payload: { run_id: 'r1', node_id: 'n1', name: 'a', state: 'active' },
    })
    const s2 = applyEvent(s1, {
      type: 'workflow_node', schema_version: '1.0',
      payload: { run_id: 'r2', node_id: 'n1', name: 'b', state: 'active' },
    })
    expect(s2.workflowRunOrder).toEqual(['r1', 'r2'])
    expect(s2.workflowRuns['r1'].nodes['n1'].name).toBe('a')
    expect(s2.workflowRuns['r2'].nodes['n1'].name).toBe('b')
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
