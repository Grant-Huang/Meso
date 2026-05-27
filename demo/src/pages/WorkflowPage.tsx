import { useState, useEffect, useRef } from 'react'
import { WorkflowTimeline, applyEvent, createInitialStreamState, parseSSELine } from '@meso.ai/ui'
import type { WorkflowRunState, StreamState } from '@meso.ai/ui'

// ── Static scenario definitions ───────────────────────────────────────────────

interface Scenario {
  id: string
  title: string
  subtitle: string
  events: string[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'search',
    title: '意图路由 + 网络搜索',
    subtitle: 'intent_router → web_search → 并行 fetch',
    events: [
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"分析意图","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n1","name":"intent_router","state":"active","started_at":1700000000000}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n1","name":"intent_router","state":"done","started_at":1700000000000,"duration_ms":38}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"分析意图","state":"done"}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"搜索网络","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n2","name":"web_search","parent_id":"n1","state":"active","started_at":1700000000040}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n3","name":"fetch_batch_1","parent_id":"n2","state":"active","started_at":1700000000055}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n4","name":"fetch_batch_2","parent_id":"n2","state":"active","started_at":1700000000058}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n3","name":"fetch_batch_1","parent_id":"n2","state":"done","duration_ms":312,"metadata":{"url":"https://example.com/a","chars":4200}}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n4","name":"fetch_batch_2","parent_id":"n2","state":"error","duration_ms":205,"metadata":{"url":"https://example.com/b","error":"timeout"}}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-search","node_id":"n2","name":"web_search","parent_id":"n1","state":"done","duration_ms":520}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"搜索网络","state":"done"}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"生成回复","state":"active"}}`,
      `data: {"type":"text","schema_version":"1.0","payload":{"delta":"根据搜索结果…"}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"生成回复","state":"done"}}`,
      `data: {"type":"done","schema_version":"1.0","payload":{}}`,
    ],
  },
  {
    id: 'report',
    title: '报告生成 Playbook',
    subtitle: '多数据源并行 → 汇总 → 条件跳过',
    events: [
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"数据采集","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r1","name":"plan_tasks","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r1","name":"plan_tasks","state":"done","duration_ms":22}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r2","name":"fetch_db","parent_id":"r1","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r3","name":"fetch_api","parent_id":"r1","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r4","name":"fetch_files","parent_id":"r1","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r2","name":"fetch_db","parent_id":"r1","state":"done","duration_ms":88,"metadata":{"rows":1240}}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r4","name":"fetch_files","parent_id":"r1","state":"done","duration_ms":134,"metadata":{"files":7}}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r3","name":"fetch_api","parent_id":"r1","state":"done","duration_ms":310,"metadata":{"records":88}}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"数据采集","state":"done"}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"分析汇总","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r5","name":"merge_data","parent_id":"r1","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r5","name":"merge_data","parent_id":"r1","state":"done","duration_ms":45}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r6","name":"verify_quota","parent_id":"r1","state":"skipped","metadata":{"reason":"quota_check_disabled"}}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r7","name":"generate_report","parent_id":"r1","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-report","node_id":"r7","name":"generate_report","parent_id":"r1","state":"done","duration_ms":1820}}`,
      `data: {"type":"stage","schema_version":"1.0","payload":{"name":"分析汇总","state":"done"}}`,
      `data: {"type":"done","schema_version":"1.0","payload":{}}`,
    ],
  },
  {
    id: 'parallel',
    title: '并行子图（多 run_id）',
    subtitle: '主编排器 + 两个独立 sub-run 并发',
    events: [
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-main","node_id":"m1","name":"orchestrator","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-sub-a","node_id":"a1","name":"db_query","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-sub-b","node_id":"b1","name":"api_call","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-sub-a","node_id":"a2","name":"transform","parent_id":"a1","state":"active"}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-sub-a","node_id":"a1","name":"db_query","state":"done","duration_ms":88,"metadata":{"rows":1240}}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-sub-b","node_id":"b1","name":"api_call","state":"done","duration_ms":211,"metadata":{"status":200}}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-sub-a","node_id":"a2","name":"transform","parent_id":"a1","state":"done","duration_ms":32}}`,
      `data: {"type":"workflow_node","schema_version":"1.0","payload":{"run_id":"run-main","node_id":"m1","name":"orchestrator","state":"done","duration_ms":260}}`,
      `data: {"type":"done","schema_version":"1.0","payload":{}}`,
    ],
  },
]

// ── Playback hook ─────────────────────────────────────────────────────────────

function usePlayback(events: string[], intervalMs = 600) {
  const [idx, setIdx] = useState(-1)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const state = events.slice(0, idx + 1).reduce<StreamState>(
    (s, line) => {
      const ev = parseSSELine(line)
      return ev ? applyEvent(s, ev) : s
    },
    { ...createInitialStreamState(), status: 'streaming' },
  )

  const runs: WorkflowRunState[] = state.workflowRunOrder.map(id => state.workflowRuns[id])
  const done = idx >= events.length - 1

  const play = () => {
    if (done) return
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setIdx(-1)
  }

  const step = () => {
    if (!done) setIdx(i => i + 1)
  }

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setIdx(i => {
        if (i >= events.length - 1) {
          setRunning(false)
          return i
        }
        return i + 1
      })
    }, intervalMs)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, events.length, intervalMs])

  return { state, runs, done, running, play, pause, reset, step, idx, total: events.length }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Section = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 14px' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.07em', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' as const }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
  </div>
)

function StageBar({ stages }: { stages: { name: string; state: string }[] }) {
  if (stages.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 16 }}>
      {stages.map(s => (
        <span key={s.name} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
          background: s.state === 'done' ? 'rgba(61,107,82,0.10)' : s.state === 'active' ? 'rgba(61,107,82,0.18)' : 'rgba(200,80,80,0.10)',
          color: s.state === 'done' ? 'var(--color-text-muted)' : s.state === 'active' ? 'var(--color-accent)' : 'var(--color-error)',
          border: '1px solid transparent',
          borderColor: s.state === 'active' ? 'var(--color-accent)' : 'transparent',
        }}>
          {s.state === 'active' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', animation: 'meso-stage-pulse 1.2s ease-in-out infinite' }} />}
          {s.state === 'done' && <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="1,4 3,6.5 7,2"/></svg>}
          {s.name}
        </span>
      ))}
    </div>
  )
}

function EventLog({ events, current }: { events: string[]; current: number }) {
  const mono = '"SF Mono","Fira Code",monospace'
  return (
    <div style={{ background: 'var(--color-code-bg)', borderRadius: 8, padding: '12px 14px', fontFamily: mono, fontSize: 11, lineHeight: 1.8, maxHeight: 220, overflowY: 'auto' as const }}>
      {events.map((e, i) => {
        const past = i <= current
        const active = i === current
        const raw = e.replace(/^data: /, '')
        let label = raw
        try {
          const obj = JSON.parse(raw)
          label = `${obj.type}  ${JSON.stringify(obj.payload).slice(0, 80)}`
        } catch { /* empty */ }
        return (
          <div key={i} style={{
            opacity: past ? 1 : 0.3,
            color: active ? 'var(--color-accent)' : past ? 'var(--color-code-text)' : 'var(--color-text-muted)',
            fontWeight: active ? 600 : 400,
            display: 'flex', gap: 8,
          }}>
            <span style={{ color: 'var(--color-text-muted)', minWidth: 22 }}>{i + 1}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function PlayControls({ running, done, onPlay, onPause, onStep, onReset, idx, total }: {
  running: boolean; done: boolean
  onPlay: () => void; onPause: () => void; onStep: () => void; onReset: () => void
  idx: number; total: number
}) {
  const btn = (label: string, onClick: () => void, disabled = false, accent = false) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
      border: '1px solid var(--color-border)', fontFamily: 'inherit',
      background: accent ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
      color: accent ? '#fff' : disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
      opacity: disabled ? 0.5 : 1, transition: 'background .15s',
    }}>{label}</button>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      {running ? btn('⏸ 暂停', onPause) : btn('▶ 播放', onPlay, done, !done)}
      {btn('→ 单步', onStep, done || running)}
      {btn('↺ 重置', onReset)}
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 4 }}>
        {idx < 0 ? '未开始' : done ? '完成' : `事件 ${idx + 1} / ${total}`}
      </span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function WorkflowPage() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!
  const { state, runs, done, running, play, pause, reset, step, idx, total } = usePlayback(scenario.events)

  const handleScenario = (id: string) => {
    reset()
    setScenarioId(id)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto', overflowY: 'auto' }}>
      {/* Page title */}
      <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="3" cy="3.5" r="1.5"/><circle cx="13" cy="3.5" r="1.5"/>
          <circle cx="3" cy="12.5" r="1.5"/><circle cx="13" cy="12.5" r="1.5"/>
          <circle cx="8" cy="8" r="1.5"/>
          <line x1="4.5" y1="3.5" x2="6.5" y2="8"/><line x1="11.5" y1="3.5" x2="9.5" y2="8"/>
          <line x1="6.5" y1="8" x2="4.5" y2="12.5"/><line x1="9.5" y1="8" x2="11.5" y2="12.5"/>
        </svg>
        DAG 工作流可观测性
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
        workflow_node 事件 · WorkflowTimeline 组件 · stage 与节点协作
      </div>

      <Section label="1 · 选择演示场景" />

      {/* Scenario selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {SCENARIOS.map(s => (
          <div
            key={s.id}
            onClick={() => handleScenario(s.id)}
            style={{
              background: 'var(--color-bg-white)',
              border: `2px solid ${scenarioId === s.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
              boxShadow: scenarioId === s.id ? '0 0 0 3px rgba(61,107,82,0.13)' : 'none',
              transition: 'border-color .2s, box-shadow .2s',
              userSelect: 'none' as const,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: '"SF Mono","Fira Code",monospace' }}>{s.subtitle}</div>
          </div>
        ))}
      </div>

      <Section label="2 · 逐事件回放" />

      {/* Controls */}
      <PlayControls running={running} done={done} onPlay={play} onPause={pause} onStep={step} onReset={reset} idx={idx} total={total} />

      {/* Two-column: timeline + event log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: stage bar + WorkflowTimeline */}
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 18px', minHeight: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 12 }}>WorkflowTimeline</div>
          <StageBar stages={state.stages} />
          {runs.length === 0
            ? <div style={{ color: 'var(--color-text-muted)', fontSize: 12, textAlign: 'center' as const, paddingTop: 40 }}>点击播放开始</div>
            : <WorkflowTimeline runs={runs} />
          }
        </div>

        {/* Right: event log */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 8 }}>事件日志</div>
          <EventLog events={scenario.events} current={idx} />
        </div>
      </div>

      <Section label="3 · 协议对照" />

      {/* Protocol reference card */}
      <div style={{ background: 'var(--color-code-bg)', borderRadius: 10, padding: '16px 20px', fontFamily: '"SF Mono","Fira Code",monospace', fontSize: 11, lineHeight: 1.9 }}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>workflow_node 事件结构</div>
        <div>
          <span style={{ color: '#9cb8a8' }}>{'{'}</span><br />
          {'  '}<span style={{ color: '#527c5e', fontWeight: 600 }}>"type"</span>: <span style={{ color: 'var(--color-text-secondary)' }}>"workflow_node"</span>,<br />
          {'  '}<span style={{ color: '#527c5e', fontWeight: 600 }}>"schema_version"</span>: <span style={{ color: 'var(--color-text-secondary)' }}>"1.0"</span>,<br />
          {'  '}<span style={{ color: '#527c5e', fontWeight: 600 }}>"payload"</span>: <span style={{ color: '#9cb8a8' }}>{'{'}</span><br />
          {'    '}<span style={{ color: '#527c5e' }}>"run_id"</span>: <span style={{ color: 'var(--color-text-muted)' }}>"run-abc"</span>,{'  '}<span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>// 同一执行的所有节点共享</span><br />
          {'    '}<span style={{ color: '#527c5e' }}>"node_id"</span>: <span style={{ color: 'var(--color-text-muted)' }}>"n_web_search"</span>,<br />
          {'    '}<span style={{ color: '#527c5e' }}>"parent_id"</span>: <span style={{ color: 'var(--color-text-muted)' }}>"n_router"</span>,{'  '}<span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>// 树形层级（可选）</span><br />
          {'    '}<span style={{ color: '#527c5e' }}>"name"</span>: <span style={{ color: 'var(--color-text-muted)' }}>"web_search"</span>,<br />
          {'    '}<span style={{ color: '#527c5e' }}>"state"</span>: <span style={{ color: '#2f7d4a', fontWeight: 600 }}>"active"</span> <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>// active | done | error | skipped</span><br />
          {'    '}<span style={{ color: '#527c5e' }}>"duration_ms"</span>: <span style={{ color: '#b8c9b4' }}>312</span>,{'  '}<span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>// done/error 时携带</span><br />
          {'    '}<span style={{ color: '#527c5e' }}>"metadata"</span>: <span style={{ color: '#9cb8a8' }}>{'{ ... }'}</span><span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>  // 任意领域数据</span><br />
          {'  '}<span style={{ color: '#9cb8a8' }}>{'}'}</span><br />
          <span style={{ color: '#9cb8a8' }}>{'}'}</span>
        </div>
      </div>

      <Section label="4 · stage vs workflow_node 分工" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          {
            label: 'stage', color: 'var(--color-accent)', audience: '用户可见',
            desc: '粗粒度阶段进度，面向终端用户。',
            examples: ['"召回记忆"', '"搜索网络"', '"生成回复"'],
            component: 'StageTimeline',
          },
          {
            label: 'workflow_node', color: 'var(--color-text-secondary)', audience: '开发者可观测',
            desc: '细粒度节点信号，面向调试和监控。',
            examples: ['intent_router', 'web_search', 'fetch_batch_3'],
            component: 'WorkflowTimeline',
          },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <code style={{ fontSize: 12, fontWeight: 700, color: item.color, fontFamily: '"SF Mono","Fira Code",monospace' }}>{item.label}</code>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', fontWeight: 600 }}>{item.audience}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10, lineHeight: 1.6 }}>{item.desc}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginBottom: 10 }}>
              {item.examples.map(ex => (
                <code key={ex} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--color-code-bg)', color: 'var(--color-code-text)', fontFamily: '"SF Mono","Fira Code",monospace' }}>{ex}</code>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>组件：<code style={{ fontFamily: '"SF Mono","Fira Code",monospace' }}>{item.component}</code></div>
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}
