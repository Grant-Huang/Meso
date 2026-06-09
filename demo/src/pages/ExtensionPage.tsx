import { useState, useRef, useCallback } from 'react'
import { MessageList, applyEvent, createInitialStreamState, parseSSELine } from '@meso.ai/ui'
import type { StreamState, ExtensionEvent } from '@meso.ai/types'

const evt = (type: string, payload: object) =>
  `data: ${JSON.stringify({ type, schema_version: '1.0', payload })}`

// ── 场景 A：引用卡片（citation） ──────────────────────────────────
const SCENARIO_A: string[] = [
  evt('stage', { name: '联网搜索', state: 'active' }),
  evt('extension', {
    name: 'citation',
    version: '1.0',
    data: {
      sources: [
        { id: 's1', title: 'React 19 正式发布 - 新特性一览', url: 'https://react.dev/blog/2024/12/05/react-19', score: 0.97 },
        { id: 's2', title: 'React 编译器：自动 memo 的实现原理', url: 'https://react.dev/learn/react-compiler', score: 0.91 },
        { id: 's3', title: 'Server Components vs Client Components', url: 'https://nextjs.org/docs/app/building-your-application/rendering', score: 0.88 },
      ],
    },
  }),
  evt('stage', { name: '联网搜索', state: 'done' }),
  evt('text', { delta: '## React 19 主要新特性\n\n' }),
  evt('text', { delta: '**1. React 编译器**（自动 memo）\n自动分析组件依赖，无需手动 `useMemo` / `useCallback`，消除常见性能陷阱。[^1]\n\n' }),
  evt('text', { delta: '**2. Server Components 稳定版**\n组件可以直接 `async/await` 数据库、文件系统，在服务端渲染后流式传输 HTML。[^3]\n\n' }),
  evt('text', { delta: '**3. Actions API**\n`useActionState` + `useFormStatus` 简化表单状态管理，内置 optimistic updates。[^1][^2]' }),
  evt('extension', {
    name: 'confidence',
    version: '1.0',
    data: { score: 0.94, label: '高置信度', reason: '基于 3 个官方文档来源' },
  }),
  evt('done', {}),
]

// ── 场景 B：代码差异对比（diff） ──────────────────────────────────
const SCENARIO_B: string[] = [
  evt('text', { delta: '以下是 React 18 → React 19 的关键迁移改动：\n\n' }),
  evt('extension', {
    name: 'code_diff',
    version: '1.0',
    data: {
      filename: 'App.tsx',
      language: 'tsx',
      before: `// React 18\nconst [data, setData] = useState(null)\nuseEffect(() => {\n  fetchUser(id).then(setData)\n}, [id])`,
      after: `// React 19 - use() + Suspense\nfunction App({ id }) {\n  const data = use(fetchUser(id))\n  return <Profile data={data} />\n}`,
      summary: '使用 use() hook 替代 useEffect 数据获取模式',
    },
  }),
  evt('text', { delta: '\n`use()` hook 可以读取 Promise，配合 `<Suspense>` 自动处理加载状态，代码量减少约 60%。\n\n' }),
  evt('extension', {
    name: 'code_diff',
    version: '1.0',
    data: {
      filename: 'Form.tsx',
      language: 'tsx',
      before: `// React 18\nconst [pending, setPending] = useState(false)\nasync function handleSubmit(e) {\n  e.preventDefault()\n  setPending(true)\n  await submit(formData)\n  setPending(false)\n}`,
      after: `// React 19 - useActionState\nconst [state, action, pending] =\n  useActionState(submitAction, null)\n\n<form action={action}>\n  <button disabled={pending}>提交</button>\n</form>`,
      summary: 'useActionState 自动管理 pending/error 状态',
    },
  }),
  evt('text', { delta: 'Actions 模式与 `<form action={fn}>` 深度集成，pending 状态由框架自动管理。' }),
  evt('done', {}),
]

// ── 场景 C：工作流步骤进度（progress） ─────────────────────────────
const SCENARIO_C: string[] = [
  evt('extension', {
    name: 'progress',
    version: '1.0',
    data: { steps: ['分析需求', '生成大纲', '撰写正文', '润色校对'], current: 0, status: 'running' },
  }),
  evt('think', { delta: '分析文档需求和受众定位…', done: true }),
  evt('extension', {
    name: 'progress',
    version: '1.0',
    data: { steps: ['分析需求', '生成大纲', '撰写正文', '润色校对'], current: 1, status: 'running' },
  }),
  evt('text', { delta: '## 技术博客草稿\n\n### 大纲\n1. 背景：为什么需要 RSC？\n2. 工作原理：服务端渲染与客户端 hydration\n3. 实践：迁移现有项目的注意事项\n\n' }),
  evt('extension', {
    name: 'progress',
    version: '1.0',
    data: { steps: ['分析需求', '生成大纲', '撰写正文', '润色校对'], current: 2, status: 'running' },
  }),
  evt('text', { delta: '### 正文\n\nReact Server Components（RSC）是 React 19 最重要的架构升级。' }),
  evt('text', { delta: '与传统 SSR 不同，RSC 不进行 hydration，服务端组件的 JS 代码**不会打包进客户端**，显著减少 bundle 体积。\n\n' }),
  evt('extension', {
    name: 'progress',
    version: '1.0',
    data: { steps: ['分析需求', '生成大纲', '撰写正文', '润色校对'], current: 3, status: 'done' },
  }),
  evt('done', {}),
]

type Phase = 'idle' | 'playing' | 'done'

const SCENARIOS = [
  { key: 'A', label: '引用卡片', desc: 'citation + confidence 扩展事件', events: SCENARIO_A },
  { key: 'B', label: 'Diff 对比', desc: 'code_diff 自定义渲染', events: SCENARIO_B },
  { key: 'C', label: '步骤进度', desc: 'progress 实时进度条', events: SCENARIO_C },
]

const USER_MESSAGES: Record<string, string> = {
  A: 'React 19 有哪些重要的新特性？请给出带来源的总结。',
  B: '给我展示 React 18 到 19 的主要代码迁移对比。',
  C: '帮我写一篇关于 React Server Components 的技术博客。',
}

// ── Custom renderExtension ────────────────────────────────────────
function CitationCard({ sources }: { sources: Array<{ id: string; title: string; url: string; score: number }> }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)', borderRadius: 8,
      overflow: 'hidden', margin: '4px 0',
      background: 'var(--color-bg-elevated)',
    }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-light)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🔍</span> 引用来源
      </div>
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sources.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', width: 14, flexShrink: 0 }}>[{i + 1}]</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--color-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.url}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, flexShrink: 0,
              background: s.score > 0.9 ? '#dcfce7' : '#fef9c3',
              color: s.score > 0.9 ? '#166534' : '#854d0e',
            }}>{Math.round(s.score * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfidenceBadge({ score, label, reason }: { score: number; label: string; reason: string }) {
  const color = score >= 0.9 ? '#16a34a' : score >= 0.7 ? '#d97706' : '#dc2626'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px',
      borderRadius: 20, border: `1px solid ${color}20`, background: `${color}10`, margin: '4px 0',
    }}>
      <span style={{ fontSize: 13 }}>{'⭐'.repeat(Math.round(score * 5)).slice(0, 5)}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
      <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{reason}</span>
    </div>
  )
}

function CodeDiffCard({ filename, before, after, summary }: { filename: string; before: string; after: string; summary: string }) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', margin: '4px 0', background: 'var(--color-bg-elevated)' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-light)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', gap: 8 }}>
        <span>📄 {filename}</span>
        <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>— {summary}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ borderRight: '1px solid var(--color-border-light)', padding: '8px 10px', background: '#fef2f2' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>BEFORE</div>
          <pre style={{ margin: 0, fontSize: 10.5, lineHeight: 1.6, color: '#7f1d1d', overflowX: 'auto' }}>{before}</pre>
        </div>
        <div style={{ padding: '8px 10px', background: '#f0fdf4' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>AFTER</div>
          <pre style={{ margin: 0, fontSize: 10.5, lineHeight: 1.6, color: '#14532d', overflowX: 'auto' }}>{after}</pre>
        </div>
      </div>
    </div>
  )
}

function ProgressTracker({ steps, current, status }: { steps: string[]; current: number; status: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '4px 0', padding: '8px 12px', borderRadius: 8, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', flexWrap: 'wrap', rowGap: 4 }}>
      {steps.map((step, i) => {
        const done = status === 'done' ? i <= current : i < current
        const active = i === current && status === 'running'
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {i > 0 && <div style={{ width: 20, height: 1, background: done ? 'var(--color-accent)' : 'var(--color-border)', flexShrink: 0 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: done ? 'var(--color-accent)' : active ? 'var(--color-accent)20' : 'transparent', border: `1px solid ${done || active ? 'var(--color-accent)' : 'var(--color-border)'}` }}>
              <span style={{ fontSize: 11 }}>{done && !active ? '✓' : active ? '◉' : '○'}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: done ? '#fff' : active ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>{step}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function renderExtension(event: ExtensionEvent): React.ReactNode {
  const { name, data } = event.payload
  if (name === 'citation') return <CitationCard sources={(data as { sources: Array<{ id: string; title: string; url: string; score: number }> }).sources} />
  if (name === 'confidence') {
    const d = data as { score: number; label: string; reason: string }
    return <ConfidenceBadge score={d.score} label={d.label} reason={d.reason} />
  }
  if (name === 'code_diff') {
    const d = data as { filename: string; before: string; after: string; summary: string }
    return <CodeDiffCard filename={d.filename} before={d.before} after={d.after} summary={d.summary} />
  }
  if (name === 'progress') {
    const d = data as { steps: string[]; current: number; status: string }
    return <ProgressTracker steps={d.steps} current={d.current} status={d.status} />
  }
  return null
}

export default function ExtensionPage() {
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
    }, 130)
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
          <span style={{ fontSize: 22 }}>🧩</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 650, color: 'var(--color-text)' }}>
            Extension Events
          </h1>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: 'var(--color-accent)', color: '#fff',
          }}>v2 新特性</span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          <code style={{ fontSize: 12 }}>extension</code> 事件是协议的透传口——后端可以发送任意业务域事件，
          前端通过 <code style={{ fontSize: 12 }}>renderExtension</code> prop 自定义渲染，无需修改核心协议。
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', padding: '20px 32px 24px' }}>

        {/* Left: Concept */}
        <div style={{ width: 340, flexShrink: 0, overflowY: 'auto', paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Event format */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>extension 事件格式</code>
            </div>
            <pre style={{ margin: 0, padding: '10px 14px', fontSize: 11, lineHeight: 1.65, color: 'var(--color-text-secondary)', overflowX: 'auto' }}>{`{
  "type": "extension",
  "payload": {
    "name": "citation",    // 扩展类型名
    "version": "1.0",      // 版本（可选）
    "data": {              // 任意业务数据
      "sources": [...]
    }
  }
}`}</pre>
          </div>

          {/* renderExtension prop */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>renderExtension prop</code>
            </div>
            <pre style={{ margin: 0, padding: '10px 14px', fontSize: 11, lineHeight: 1.65, color: 'var(--color-text-secondary)', overflowX: 'auto' }}>{`import type { ExtensionEvent } from '@meso.ai/types'

function renderExtension(
  event: ExtensionEvent
): React.ReactNode {
  const { name, data } = event.payload

  if (name === 'citation') {
    return <CitationCard sources={data.sources} />
  }
  if (name === 'confidence') {
    return <ConfidenceBadge {...data} />
  }
  return null  // 未识别的扩展不渲染
}

// 传入 MessageList
<MessageList
  streaming={streamState}
  renderExtension={renderExtension}
/>`}</pre>
          </div>

          {/* Design philosophy */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-elevated)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>设计原则</div>
            {[
              { icon: '🔌', title: '协议稳定性', desc: '业务变化只改 extension 的 data，不改核心协议' },
              { icon: '🎨', title: '渲染自由度', desc: 'renderExtension 可返回任意 React 组件' },
              { icon: '📦', title: '版本共存', desc: 'name + version 双字段，多版本并行演进' },
              { icon: '📋', title: '日志可查', desc: 'extensionLog 保存完整历史，便于调试' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text)' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Use cases */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-elevated)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>典型扩展类型</div>
            {[
              'citation — 检索来源引用',
              'confidence — 回答置信度',
              'code_diff — 代码对比',
              'progress — 多步骤进度',
              'chart — 图表数据',
              'approval — 审批流程',
              'translation — 翻译对照',
            ].map(item => (
              <div key={item} style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 5, display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>·</span>{item}
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
                  padding: '5px 13px', borderRadius: 6, fontSize: 12.5, cursor: 'pointer',
                  border: '1px solid var(--color-border)', background: 'transparent',
                  color: 'var(--color-text-secondary)',
                }}>重置</button>
              )}
              <button onClick={phase !== 'playing' ? play : undefined} disabled={isStreaming} style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                cursor: isStreaming ? 'default' : 'pointer', border: 'none',
                background: isStreaming ? 'var(--color-border)' : 'var(--color-accent)',
                color: isStreaming ? 'var(--color-text-muted)' : '#fff',
                transition: 'background .15s',
              }}>{phase === 'done' ? '▶ 再次播放' : isStreaming ? '流式中…' : '▶ 播放演示'}</button>
            </div>
          </div>

          {/* MessageList with custom renderExtension */}
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
              renderExtension={renderExtension}
              emptyState={
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  点击"播放演示"查看 renderExtension 自定义渲染效果
                </div>
              }
              emptyStateAlign="center"
            />
          </div>

          {/* Extension log */}
          {(isStreaming || phase === 'done') && streamState.extensionLog.length > 0 && (
            <div style={{
              marginTop: 10, padding: '8px 14px', borderRadius: 8,
              border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                extensionLog（{streamState.extensionLog.length} 条）
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {streamState.extensionLog.map((e, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {e.payload.name}{e.payload.version ? ` v${e.payload.version}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
