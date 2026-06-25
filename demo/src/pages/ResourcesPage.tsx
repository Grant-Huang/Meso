import { useState, useRef, useCallback } from 'react'
import { MessageList, applyEvent, createInitialStreamState, parseSSELine } from '@meso.ai/ui'
import type { StreamState } from '@meso.ai/types'
import { ArrowRightIcon, CheckIcon, AlertTriangleIcon, PlayIcon } from '../components/Icons'

const evt = (type: string, payload: object) =>
  `data: ${JSON.stringify({ type, schema_version: '1.0', payload })}`

// ── 场景 A：读取源码文件 ──────────────────────────────────────────
const SCENARIO_A: string[] = [
  evt('phase', { id: 'read-resource', name: '读取资源', state: 'running' }),
  evt('resource_read', {
    id: 'r1',
    uri: 'file:///src/hooks/useSSEStream.ts',
    name: 'useSSEStream.ts',
    server: 'filesystem-mcp',
  }),
  evt('phase', { id: 'read-resource', name: '读取资源', state: 'done' }),
  evt('phase', { id: 'analyze-code', name: '分析代码', state: 'running' }),
  evt('resource_content', {
    resource_read_id: 'r1',
    contents: [{
      type: 'text',
      text: `export function useSSEStream(url: string) {\n  const [state, setState] = useState(createInitialStreamState())\n  \n  const start = useCallback((body?: object) => {\n    const es = new EventSource(url)\n    es.onmessage = (e) => {\n      setState(prev => applyEvent(prev, e.data))\n    }\n    return () => es.close()\n  }, [url])\n  \n  return { state, start }\n}`,
    }],
    duration_ms: 38,
  }),
  evt('think', { delta: '这是 useSSEStream hook 的核心实现，' }),
  evt('think', { delta: '基于 EventSource API，通过 applyEvent 纯函数驱动状态。', done: true }),
  evt('phase', { id: 'analyze-code', name: '分析代码', state: 'done' }),
  evt('text', { delta: '## useSSEStream 实现分析\n\n' }),
  evt('text', { delta: '**架构模式**：单向数据流 + 不可变状态更新\n\n' }),
  evt('text', { delta: '```\nEventSource → applyEvent(prev, rawLine) → setState → 渲染\n```\n\n' }),
  evt('text', { delta: '**关键设计**：\n- `applyEvent` 是纯函数，每次调用返回新 state，天然支持 React 并发模式\n' }),
  evt('text', { delta: '- `EventSource` 自动重连，断网恢复后继续接收\n' }),
  evt('text', { delta: '- `start()` 返回 cleanup 函数，可在 `useEffect` 中安全使用' }),
  evt('done', {}),
]

// ── 场景 B：读取多个资源（并行） ─────────────────────────────────
const SCENARIO_B: string[] = [
  evt('phase', { id: 'parallel-read', name: '并行读取', state: 'running' }),
  evt('resource_read', {
    id: 'r1',
    uri: 'file:///package.json',
    name: 'package.json',
    server: 'filesystem-mcp',
  }),
  evt('resource_read', {
    id: 'r2',
    uri: 'file:///tsconfig.json',
    name: 'tsconfig.json',
    server: 'filesystem-mcp',
  }),
  evt('resource_content', {
    resource_read_id: 'r1',
    contents: [{ type: 'text', text: '{\n  "name": "meso",\n  "packageManager": "pnpm@10.33.0",\n  "engines": { "node": "20.x" }\n}' }],
    duration_ms: 22,
  }),
  evt('resource_content', {
    resource_read_id: 'r2',
    contents: [{ type: 'text', text: '{\n  "compilerOptions": {\n    "strict": true,\n    "target": "ES2022",\n    "moduleResolution": "bundler"\n  }\n}' }],
    duration_ms: 19,
  }),
  evt('phase', { id: 'parallel-read', name: '并行读取', state: 'done' }),
  evt('text', { delta: '## 项目配置概览\n\n' }),
  evt('text', { delta: '| 配置项 | 值 |\n|--------|----|\n' }),
  evt('text', { delta: '| 包管理器 | pnpm@10.33.0 |\n' }),
  evt('text', { delta: '| Node 版本 | 20.x LTS |\n' }),
  evt('text', { delta: '| TypeScript | strict 模式 |\n' }),
  evt('text', { delta: '| 模块解析 | bundler（Vite 兼容）|\n\n' }),
  evt('text', { delta: '两个配置文件同时读取（38ms 内完成），resource_content 事件可乱序到达，状态机按 `resource_read_id` 正确关联。' }),
  evt('done', {}),
]

// ── 场景 C：读取失败（错误处理） ─────────────────────────────────
const SCENARIO_C: string[] = [
  evt('phase', { id: 'read-config', name: '读取配置', state: 'running' }),
  evt('resource_read', {
    id: 'r1',
    uri: 'file:///secrets/.env.production',
    name: '.env.production',
    server: 'filesystem-mcp',
  }),
  evt('resource_content', {
    resource_read_id: 'r1',
    contents: [],
    error: 'Permission denied: /secrets/.env.production',
    duration_ms: 5,
  }),
  evt('phase', { id: 'read-config', name: '读取配置', state: 'error' }),
  evt('text', { delta: '读取 `.env.production` 失败：权限不足。\n\n' }),
  evt('text', { delta: '**建议**：请确认 MCP server 有读取该路径的权限，或通过 `ALLOW_LIST` 配置显式授权。' }),
  evt('done', {}),
]

type Phase = 'idle' | 'playing' | 'done'

const SCENARIOS = [
  { key: 'A', label: '读取源码', desc: 'filesystem-mcp 单文件读取', events: SCENARIO_A },
  { key: 'B', label: '并行读取', desc: '同时读取多个资源', events: SCENARIO_B },
  { key: 'C', label: '读取失败', desc: '权限错误的错误处理', events: SCENARIO_C },
]

const USER_MESSAGES: Record<string, string> = {
  A: '帮我分析 useSSEStream 这个 Hook 的实现原理。',
  B: '总结一下项目的工程配置（package.json + tsconfig.json）。',
  C: '读取生产环境的环境变量配置文件。',
}

export default function ResourcesPage() {
  const [activeScenario, setActiveScenario] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [streamState, setStreamState] = useState<StreamState>(createInitialStreamState())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const play = useCallback(() => {
    stop()
    setStreamState(createInitialStreamState())
    setPhase('playing')
    const events = SCENARIOS[activeScenario].events
    let i = 0
    timerRef.current = setInterval(() => {
      if (i >= events.length) { stop(); setPhase('done'); return }
      const ev = parseSSELine(events[i++])
      if (ev) setStreamState(prev => applyEvent(prev, ev))
    }, 140)
  }, [activeScenario, stop])

  const reset = useCallback(() => {
    stop(); setStreamState(createInitialStreamState()); setPhase('idle')
  }, [stop])

  const scenario = SCENARIOS[activeScenario]
  const isStreaming = phase === 'playing'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>📂</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 650, color: 'var(--color-text)' }}>
            MCP Resource Reads
          </h1>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: 'var(--color-accent)', color: '#fff',
          }}>v2 新特性</span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          <code style={{ fontSize: 12 }}>resource_read</code> 和 <code style={{ fontSize: 12 }}>resource_content</code> 事件
          让 AI 在回答前先读取文件、API、数据库等 MCP 资源，前端可实时展示读取进度。
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', padding: '20px 32px 24px' }}>

        {/* Left: Concept */}
        <div style={{ width: 340, flexShrink: 0, overflowY: 'auto', paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Event flow diagram */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>事件时序</span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { color: '#6b7280', dot: <ArrowRightIcon size={14} />, text: 'resource_read', sub: '宣告即将读取的资源（id + uri）' },
                { color: 'var(--color-accent)', dot: <CheckIcon size={14} />, text: 'resource_content', sub: '资源内容到达（可乱序，用 id 关联）' },
                { color: '#ef4444', dot: <AlertTriangleIcon size={14} />, text: 'resource_content (error)', sub: '读取失败，含 error 字段' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, color: item.color, fontWeight: 700, flexShrink: 0, marginTop: 1, display: 'inline-flex' }}>{item.dot}</span>
                  <div>
                    <code style={{ fontSize: 11.5, color: 'var(--color-accent)', fontWeight: 600 }}>{item.text}</code>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* resource_read JSON */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>resource_read</code>
            </div>
            <pre style={{ margin: 0, padding: '10px 14px', fontSize: 11, lineHeight: 1.65, color: 'var(--color-text-secondary)', overflowX: 'auto' }}>{`{
  "type": "resource_read",
  "payload": {
    "id": "r1",
    "uri": "file:///src/main.ts",
    "name": "main.ts",       // 可选，显示名
    "server": "filesystem-mcp"
  }
}`}</pre>
          </div>

          {/* resource_content JSON */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>resource_content</code>
            </div>
            <pre style={{ margin: 0, padding: '10px 14px', fontSize: 11, lineHeight: 1.65, color: 'var(--color-text-secondary)', overflowX: 'auto' }}>{`{
  "type": "resource_content",
  "payload": {
    "resource_read_id": "r1",
    "contents": [
      { "type": "text", "text": "..." },
      { "type": "image", "data": "base64..." }
    ],
    "error": null,    // 失败时有值
    "duration_ms": 38
  }
}`}</pre>
          </div>

          {/* ResourceReadBlock usage */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>MessageList 自动渲染</span>
            </div>
            <pre style={{ margin: 0, padding: '10px 14px', fontSize: 11, lineHeight: 1.65, color: 'var(--color-text-secondary)', overflowX: 'auto' }}>{`// MessageList 根据 StreamState 中
// resourceReads 字段自动渲染
// ResourceReadBlock 组件，无需额外配置

<MessageList
  messages={messages}
  streaming={streamState}
/>

// 也可独立使用：
import { ResourceReadBlock } from '@meso.ai/ui'

<ResourceReadBlock
  resourceRead={state.resourceReads['r1']}
/>`}</pre>
          </div>

          {/* MCP resource types */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-elevated)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>常见资源类型</div>
            {[
              { scheme: 'file://', desc: '本地文件系统（filesystem-mcp）' },
              { scheme: 'https://', desc: '远程 API 响应（http-mcp）' },
              { scheme: 'db://', desc: '数据库查询结果（postgres-mcp）' },
              { scheme: 'git://', desc: 'Git 仓库内容（git-mcp）' },
            ].map(item => (
              <div key={item.scheme} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                <code style={{ fontSize: 11, color: 'var(--color-accent)', flexShrink: 0 }}>{item.scheme}</code>
                <span style={{ fontSize: 11.5, color: 'var(--color-text-secondary)' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Demo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Scenario tabs + controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {SCENARIOS.map((s, i) => (
              <button key={s.key} onClick={() => { setActiveScenario(i); reset() }} style={{
                padding: '5px 13px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: activeScenario === i ? 'var(--color-accent)' : 'var(--color-border)',
                background: activeScenario === i ? 'var(--color-accent)' : 'transparent',
                color: activeScenario === i ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all .15s',
              }}>{s.label}</button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 4 }}>{scenario.desc}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {phase !== 'idle' && (
                <button onClick={reset} style={{
                  padding: '5px 13px', borderRadius: 6, fontSize: 12.5,
                  cursor: 'pointer', border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-secondary)',
                }}>重置</button>
              )}
              <button onClick={phase !== 'playing' ? play : undefined} disabled={isStreaming} style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                cursor: isStreaming ? 'default' : 'pointer', border: 'none',
                background: isStreaming ? 'var(--color-border)' : 'var(--color-accent)',
                color: isStreaming ? 'var(--color-text-muted)' : '#fff',
                transition: 'background .15s',
              }}>{phase === 'done' ? (<><PlayIcon size={12} /> 再次播放</>) : isStreaming ? '读取中…' : (<><PlayIcon size={12} /> 播放演示</>)}</button>
            </div>
          </div>

          {/* MessageList */}
          <div style={{
            flex: 1, border: '1px solid var(--color-border)', borderRadius: 10,
            overflow: 'hidden', background: 'var(--color-bg)',
          }}>
            <MessageList
              messages={[{
                id: 'u1', role: 'user',
                content: USER_MESSAGES[scenario.key],
                timestamp: new Date().toISOString(),
              }]}
              streaming={isStreaming || phase === 'done' ? streamState : undefined}
              emptyState={
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  点击"播放演示"查看 MCP 资源读取过程
                </div>
              }
              emptyStateAlign="center"
            />
          </div>

          {/* Stats */}
          {(isStreaming || phase === 'done') && Object.keys(streamState.resourceReads).length > 0 && (
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 8,
              border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)',
              fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 24,
            }}>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>资源读取：</strong>
                {Object.keys(streamState.resourceReads).length} 个
              </span>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>完成：</strong>
                {Object.values(streamState.resourceReads).filter(r => r.status === 'done').length} 个
              </span>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>错误：</strong>
                {Object.values(streamState.resourceReads).filter(r => r.status === 'error').length} 个
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
