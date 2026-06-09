import { useState, useRef, useCallback } from 'react'
import { MessageList, applyEvent, createInitialStreamState, parseSSELine } from '@meso.ai/ui'
import type { StreamState } from '@meso.ai/types'

const evt = (type: string, payload: object) =>
  `data: ${JSON.stringify({ type, schema_version: '1.0', payload })}`

// ── 场景 A：代码审查（Aria 人格 + code-review 技能） ──────────────
const SCENARIO_A: string[] = [
  evt('capabilities', {
    tools: [
      { id: 'code_exec', name: '代码执行', description: '运行代码片段', risk: 'write', provider: 'builtin' },
      { id: 'doc_search', name: '文档检索', description: '搜索 API 文档', risk: 'safe', provider: 'mcp' },
    ],
    skills: [
      { id: 'code-review', name: '代码审查', provider: 'builtin' },
      { id: 'doc-gen', name: '文档生成', provider: 'builtin' },
    ],
    resources: [],
    mcp_servers: ['filesystem-mcp'],
  }),
  evt('soul', {
    id: 'aria-v2',
    name: 'Aria',
    version: '2.0',
    avatar: '🤖',
    traits: ['专业', '直接', '技术精通'],
  }),
  evt('skill_active', {
    id: 'code-review',
    name: '代码审查',
    version: '1.2',
    provider: 'builtin',
    focus: ['安全', '规范', '性能'],
    description: '深度代码质量分析模式',
  }),
  evt('think', { delta: '分析用户的 React Hook，' }),
  evt('think', { delta: '检查依赖数组完整性与闭包陷阱。', done: true }),
  evt('text', { delta: '## 代码审查结果\n\n' }),
  evt('text', { delta: '### ✅ 通过\n- Cleanup 函数完整，无内存泄漏\n- 类型声明规范，无 `any` 滥用\n\n' }),
  evt('text', { delta: '### ⚠️ 发现问题\n\n' }),
  evt('text', { delta: '**1. `useEffect` 依赖缺失**\n```tsx\n// ❌ 缺少 onSubmit\nuseEffect(() => { onSubmit() }, [])\n// ✅ 正确\nuseEffect(() => { onSubmit() }, [onSubmit])\n```\n\n' }),
  evt('text', { delta: '**2. 闭包陷阱**：`handleClick` 捕获了过期的 `count`，建议改用 `useCallback`' }),
  evt('done', {}),
]

// ── 场景 B：创意写作（Nova 人格 + writing 技能） ──────────────────
const SCENARIO_B: string[] = [
  evt('capabilities', {
    tools: [],
    skills: [
      { id: 'creative-writing', name: '创意写作', provider: 'builtin' },
      { id: 'translation', name: '专业翻译', provider: 'api' },
    ],
    resources: [],
    mcp_servers: [],
  }),
  evt('soul', {
    id: 'nova',
    name: 'Nova',
    version: '1.5',
    avatar: '✨',
    traits: ['富有创意', '感性', '故事性强'],
  }),
  evt('skill_active', {
    id: 'creative-writing',
    name: '创意写作',
    version: '2.0',
    provider: 'builtin',
    focus: ['叙事节奏', '情感共鸣', '意象表达'],
    description: '以创意和情感为核心的写作模式',
  }),
  evt('think', { delta: '用户想要一首关于代码与诗意的短文，' }),
  evt('think', { delta: '融合技术美学和文学意境。', done: true }),
  evt('text', { delta: '> 每一行代码都是一首诗的草稿，\n' }),
  evt('text', { delta: '> 变量是尚未命名的情感，\n' }),
  evt('text', { delta: '> 函数是压缩成几行的故事。\n\n' }),
  evt('text', { delta: '当你按下 `Enter`，\n不只是执行了一段逻辑——\n而是向世界发出了一次微小的问候。' }),
  evt('done', {}),
]

type Phase = 'idle' | 'playing' | 'done'

const SCENARIOS = [
  { key: 'A', label: '代码审查', desc: 'Aria 人格 + code-review 技能', events: SCENARIO_A },
  { key: 'B', label: '创意写作', desc: 'Nova 人格 + creative-writing 技能', events: SCENARIO_B },
]

export default function PersonaPage() {
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
      if (i >= events.length) {
        stop()
        setPhase('done')
        return
      }
      const ev = parseSSELine(events[i++])
      if (ev) setStreamState(prev => applyEvent(prev, ev))
    }, 120)
  }, [activeScenario, stop])

  const reset = useCallback(() => {
    stop()
    setStreamState(createInitialStreamState())
    setPhase('idle')
  }, [stop])

  const scenario = SCENARIOS[activeScenario]
  const isStreaming = phase === 'playing'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>🎭</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 650, color: 'var(--color-text)' }}>
            Soul · Skill · Capabilities
          </h1>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px',
            borderRadius: 20, background: 'var(--color-accent)', color: '#fff',
          }}>v2 新特性</span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          三个会话级事件定义了 AI 的"是谁""能什么""怎么工作"——在流式响应开始前完成上下文注入。
        </p>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', padding: '20px 32px 24px' }}>

        {/* Left: Concept */}
        <div style={{ width: 340, flexShrink: 0, overflowY: 'auto', paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Event cards */}
          {[
            {
              emoji: '🧠', name: 'capabilities', badge: '会话开始时',
              desc: '宣告本次会话可用的工具、技能、MCP 资源列表。前端据此动态渲染工具栏。',
              json: `{\n  "type": "capabilities",\n  "payload": {\n    "tools": [\n      { "id": "search", "risk": "safe" }\n    ],\n    "skills": ["code-review"],\n    "mcp_servers": ["filesystem"]\n  }\n}`,
            },
            {
              emoji: '🎭', name: 'soul', badge: '人格激活',
              desc: '激活特定 AI 人格。携带名称、版本、头像和性格特征，由 SoulIndicator 渲染。',
              json: `{\n  "type": "soul",\n  "payload": {\n    "id": "aria-v2",\n    "name": "Aria",\n    "version": "2.0",\n    "avatar": "🤖",\n    "traits": ["专业", "直接"]\n  }\n}`,
            },
            {
              emoji: '⚙️', name: 'skill_active', badge: '工作模式',
              desc: '切换操作技能。focus 数组声明本次分析的关注维度，由 SkillIndicator 渲染。',
              json: `{\n  "type": "skill_active",\n  "payload": {\n    "id": "code-review",\n    "name": "代码审查",\n    "provider": "builtin",\n    "focus": ["安全", "规范"]\n  }\n}`,
            },
          ].map(card => (
            <div key={card.name} style={{
              border: '1px solid var(--color-border)',
              borderRadius: 10, overflow: 'hidden',
              background: 'var(--color-bg-elevated)',
            }}>
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15 }}>{card.emoji}</span>
                  <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>{card.name}</code>
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                    padding: '1px 7px', borderRadius: 20,
                    background: 'var(--color-bg)', color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}>{card.badge}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  {card.desc}
                </p>
              </div>
              <pre style={{
                margin: 0, padding: '10px 14px',
                fontSize: 11, lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                overflowX: 'auto',
              }}>{card.json}</pre>
            </div>
          ))}

          {/* Component usage */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>🧩</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>组件使用</span>
              </div>
            </div>
            <pre style={{ margin: 0, padding: '10px 14px', fontSize: 11, lineHeight: 1.65, color: 'var(--color-text-secondary)', overflowX: 'auto' }}>{`import { MessageList } from '@meso.ai/ui'

// MessageList 自动渲染 Soul + Skill 上下文行
<MessageList
  messages={messages}
  streaming={streamState}
/>

// 或单独使用指示器
import { SoulIndicator, SkillIndicator } from '@meso.ai/ui'

<SoulIndicator soul={state.activeSoul} />
<SkillIndicator skill={state.activeSkill} />`}</pre>
          </div>
        </div>

        {/* Right: Demo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Scenario selector + controls */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap',
          }}>
            {SCENARIOS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => { setActiveScenario(i); reset() }}
                style={{
                  padding: '5px 13px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', border: '1.5px solid',
                  borderColor: activeScenario === i ? 'var(--color-accent)' : 'var(--color-border)',
                  background: activeScenario === i ? 'var(--color-accent)' : 'transparent',
                  color: activeScenario === i ? '#fff' : 'var(--color-text-secondary)',
                  transition: 'all .15s',
                }}
              >
                {s.label}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 4 }}>
              {scenario.desc}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {phase !== 'idle' && (
                <button onClick={reset} style={{
                  padding: '5px 13px', borderRadius: 6, fontSize: 12.5,
                  cursor: 'pointer', border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-secondary)',
                }}>重置</button>
              )}
              <button
                onClick={phase === 'idle' || phase === 'done' ? play : undefined}
                disabled={isStreaming}
                style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                  cursor: isStreaming ? 'default' : 'pointer',
                  border: 'none', background: isStreaming ? 'var(--color-border)' : 'var(--color-accent)',
                  color: isStreaming ? 'var(--color-text-muted)' : '#fff',
                  transition: 'background .15s',
                }}
              >
                {phase === 'done' ? '▶ 再次播放' : isStreaming ? '播放中…' : '▶ 播放演示'}
              </button>
            </div>
          </div>

          {/* MessageList */}
          <div style={{
            flex: 1, border: '1px solid var(--color-border)', borderRadius: 10,
            overflow: 'hidden', background: 'var(--color-bg)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MessageList
                messages={[{
                  id: 'u1',
                  role: 'user',
                  content: activeScenario === 0
                    ? '请帮我审查这段 React 自定义 Hook 代码，检查常见问题。'
                    : '写一段关于代码与诗意的短文，融合技术美学与文学意境。',
                  timestamp: new Date().toISOString(),
                }]}
                streaming={isStreaming || phase === 'done' ? streamState : undefined}
                emptyState={
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    点击"播放演示"查看 Soul + Skill 激活过程
                  </div>
                }
                emptyStateAlign="center"
              />
            </div>
          </div>

          {/* State inspector */}
          {(isStreaming || phase === 'done') && (
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 8,
              border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)',
              fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 24,
            }}>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>activeSoul：</strong>
                {streamState.activeSoul ? `${streamState.activeSoul.avatar ?? ''} ${streamState.activeSoul.name} v${streamState.activeSoul.version}` : '—'}
              </span>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>activeSkill：</strong>
                {streamState.activeSkill ? `${streamState.activeSkill.name} (${streamState.activeSkill.focus?.join(', ') ?? ''})` : '—'}
              </span>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>capabilities：</strong>
                {streamState.availableCapabilities
                  ? `${streamState.availableCapabilities.tools?.length ?? 0} 工具 / ${streamState.availableCapabilities.skills?.length ?? 0} 技能`
                  : '—'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
