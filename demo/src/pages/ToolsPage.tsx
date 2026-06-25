/**
 * ToolsPage — full tool-integration walkthrough
 *
 * Left:  step-by-step guide  (ToolDefinition → manifest → backend SSE → frontend)
 * Right: live simulation     (safe auto-play  |  destructive with ConfirmGate)
 */
import { useState, useRef, useCallback } from 'react'
import { MessageList, applyEvent, createInitialStreamState, parseSSELine } from '@meso.ai/ui'
import type { StreamState } from '@meso.ai/ui'
import type { Message } from '@meso.ai/ui'
import { PlayIcon, RotateCcwIcon, SquareIcon, SatelliteDishIcon, BuildingIcon, PlugIcon } from '../components/Icons'

// ── SSE event sequences ───────────────────────────────────────────────────────

const SAFE_EVENTS = [
  `data: {"type":"capabilities","schema_version":"1.0","payload":{"tools":[{"name":"read_file","description":"读取指定路径的文件内容","provider":"local","risk":"safe","input_schema":{"type":"object","properties":{"path":{"type":"string","description":"文件路径"}},"required":["path"]}}]}}`,
  `data: {"type":"phase","schema_version":"1.0","payload":{"id":"analyze","name":"分析请求","state":"running"}}`,
  `data: {"type":"phase","schema_version":"1.0","payload":{"id":"analyze","name":"分析请求","state":"done"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"我来"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"读取文件"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"内容。"}}`,
  `data: {"type":"tool_call","schema_version":"1.0","payload":{"id":"tc-1","name":"read_file","args":{"path":"/docs/readme.md"},"risk":"safe","provider":"local"}}`,
  `data: {"type":"tool_status","schema_version":"1.0","payload":{"id":"tc-1","status":"running"}}`,
  `data: {"type":"tool_result","schema_version":"1.0","payload":{"tool_call_id":"tc-1","output":"# Readme\\n这是项目说明文档，包含安装步骤、配置指南和 API 参考。","duration_ms":28}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"文件内容已读取，以上是摘要。"}}`,
  `data: {"type":"done","schema_version":"1.0","payload":{}}`,
]

const DESTRUCTIVE_PRE = [
  `data: {"type":"capabilities","schema_version":"1.0","payload":{"tools":[{"name":"delete_file","description":"永久删除指定文件（不可恢复）","provider":"local","risk":"destructive","input_schema":{"type":"object","properties":{"path":{"type":"string","description":"要删除的文件路径"}},"required":["path"]}}]}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"即将"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"清理"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"临时文件。"}}`,
  `data: {"type":"tool_call","schema_version":"1.0","payload":{"id":"tc-2","name":"delete_file","args":{"path":"/tmp/cache.db"},"risk":"destructive","provider":"local"}}`,
]

const DESTRUCTIVE_POST = [
  `data: {"type":"tool_status","schema_version":"1.0","payload":{"id":"tc-2","status":"running"}}`,
  `data: {"type":"tool_result","schema_version":"1.0","payload":{"tool_call_id":"tc-2","output":"已删除 /tmp/cache.db（1.2 MB）","duration_ms":45}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"临时文件已成功清理。"}}`,
  `data: {"type":"done","schema_version":"1.0","payload":{}}`,
]

const MESSAGES: Record<'safe' | 'destructive', Message> = {
  safe:        { id: 'u1', role: 'user', content: '请读取 /docs/readme.md 的内容。' },
  destructive: { id: 'u2', role: 'user', content: '清理 /tmp/cache.db 临时文件。' },
}

// ── Code snippets ─────────────────────────────────────────────────────────────

const CODE_TOOL_DEF = `// tools/read-file.json
{
  "schema_version": "1.0",
  "id": "myapp.read_file",
  "name": "读取文件",
  "version": "1.0.0",
  "description": "读取指定路径的文件内容，返回文本",
  "provider": "local",
  "risk": "safe",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "文件路径" }
    },
    "required": ["path"]
  },
  "tags": ["file", "read"]
}`

const CODE_MANIFEST = `// manifest.json → tools 字段（三种形式混用）
{
  "tools": [
    "search_knowledge",        // ① 内置工具 ID（字符串）
    "./tools/read-file.json",  // ② 外部工具文件路径（./ 开头）
    {                          // ③ 内联 ToolDefinition 对象
      "schema_version": "1.0",
      "id": "myapp.summarize",
      "name": "生成摘要",
      "version": "1.0.0",
      "description": "对文本生成简短摘要",
      "provider": "local",
      "risk": "safe",
      "input_schema": {
        "type": "object",
        "properties": { "text": { "type": "string" } },
        "required": ["text"]
      }
    }
  ]
}`

const CODE_BACKEND = `# Python 后端 — 工具集成完整示例
import json

async def event_stream():
    def sse(t, p):
        return f'data: {json.dumps({"type":t,"schema_version":"1.0","payload":p})}\\n\\n'

    # ① 流式开始时声明可用工具
    yield sse("capabilities", {"tools": [{
        "name": "read_file",
        "description": "读取文件内容",
        "provider": "local",
        "risk": "safe",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    }]})

    # ② LLM 决定调用工具时发 tool_call
    yield sse("tool_call", {
        "id": "tc-001",
        "name": "read_file",
        "args": {"path": "/docs/readme.md"},
        "risk": "safe",    # safe → 前端自动放行；destructive → 弹确认门
        "provider": "local"
    })

    # ③ 执行工具，发送结果
    result = run_tool("read_file", {"path": "/docs/readme.md"})
    yield sse("tool_result", {
        "tool_call_id": "tc-001",
        "output": result,
        "duration_ms": 28
    })

    # ④ 继续生成回复
    yield sse("text", {"delta": "文件内容已读取。"})
    yield sse("done", {})`

const CODE_FRONTEND = `// risk="safe"        → 自动执行，无需用户干预
// risk="destructive"  → 渲染确认门，等用户点击后调用 onToolConfirm

<MessageList
  messages={messages}
  streaming={state.status !== 'idle' ? state : undefined}
  onToolConfirm={(toolCallId) => {
    // 通知后端：用户已确认，可以继续流式输出
    fetch('/api/tool/confirm', {
      method: 'POST',
      body: JSON.stringify({ tool_call_id: toolCallId }),
    })
  }}
  onToolCancel={(toolCallId) => {
    abort()  // 中止 SSE 流
  }}
/>`

// ── Component ─────────────────────────────────────────────────────────────────

type Scenario = 'safe' | 'destructive'
type Phase = 'idle' | 'playing' | 'waiting_confirm' | 'done'

function freshState(): StreamState {
  return { ...createInitialStreamState(), status: 'streaming' }
}

export function ToolsPage() {
  const [scenario, setScenario] = useState<Scenario>('safe')
  const [phase, setPhase] = useState<Phase>('idle')
  const [streamState, setStreamState] = useState<StreamState>(createInitialStreamState)
  const stateRef = useRef<StreamState>(createInitialStreamState())
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const stop = useCallback(() => { clearTimeout(timerRef.current) }, [])

  const applyLine = useCallback((line: string) => {
    const event = parseSSELine(line)
    if (!event) return
    const next = applyEvent(stateRef.current, event)
    stateRef.current = next
    setStreamState({ ...next })
  }, [])

  const playSequence = useCallback(
    (events: string[], idx: number, delay: number, onDone: () => void) => {
      if (idx >= events.length) { onDone(); return }
      applyLine(events[idx])
      timerRef.current = setTimeout(
        () => playSequence(events, idx + 1, delay, onDone),
        delay,
      )
    },
    [applyLine],
  )

  const reset = useCallback(() => {
    stop()
    stateRef.current = freshState()
    setStreamState(freshState())
    setPhase('idle')
  }, [stop])

  const play = useCallback(() => {
    reset()
    setPhase('playing')
    if (scenario === 'safe') {
      playSequence(SAFE_EVENTS, 0, 380, () => setPhase('done'))
    } else {
      playSequence(DESTRUCTIVE_PRE, 0, 380, () => setPhase('waiting_confirm'))
    }
  }, [scenario, reset, playSequence])

  const handleConfirm = useCallback(() => {
    if (phase !== 'waiting_confirm') return
    setPhase('playing')
    playSequence(DESTRUCTIVE_POST, 0, 380, () => setPhase('done'))
  }, [phase, playSequence])

  const handleCancel = useCallback(() => {
    if (phase !== 'waiting_confirm') return
    reset()
  }, [phase, reset])

  const switchScenario = (s: Scenario) => {
    setScenario(s)
    reset()
  }

  // ── shared helpers ─────────────────────────────────────────────────────────

  const codeBlock = (code: string) => (
    <pre style={{
      background: 'var(--color-code-bg)',
      color: 'var(--color-code-text)',
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 11.5,
      lineHeight: 1.65,
      overflowX: 'auto',
      margin: '8px 0 22px',
      border: '1px solid var(--color-border)',
      whiteSpace: 'pre',
    }}><code>{code}</code></pre>
  )

  const step = (n: string, title: string, sub: string) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{n}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>{sub}</div>
    </div>
  )

  // ── status text ────────────────────────────────────────────────────────────

  const statusText: Record<Phase, string> = {
    idle: scenario === 'safe' ? '点击播放，查看安全工具调用流程' : '点击播放，查看危险工具确认门流程',
    playing: '事件播放中…',
    waiting_confirm: '等待用户确认执行危险操作',
    done: '流式完成',
  }

  const phaseColor: Record<Phase, string> = {
    idle: 'var(--color-text-muted)',
    playing: 'var(--color-accent)',
    waiting_confirm: '#d97706',
    done: 'var(--color-success)',
  }

  const streaming = phase !== 'idle' ? streamState : undefined

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left: guide ─────────────────────────────────────────────── */}
      <div style={{ width: 480, flexShrink: 0, overflowY: 'auto', padding: '24px 28px', borderRight: '1px solid var(--color-border)', fontSize: 13 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>工具集成指南</h2>
        <p style={{ margin: '0 0 28px', color: 'var(--color-text-secondary)', fontSize: 12.5 }}>
          从定义工具到前端渲染，右侧是可交互的 Live Demo。
        </p>

        {step('1', '定义工具（ToolDefinition）', '工具作者写一个 JSON 文件描述自己的能力')}
        {codeBlock(CODE_TOOL_DEF)}

        {step('2', '在 Manifest 中声明', 'tools 字段支持三种形式混用')}
        {codeBlock(CODE_MANIFEST)}

        {step('3', '后端发送 SSE 事件', 'capabilities → tool_call → tool_result')}
        {codeBlock(CODE_BACKEND)}

        {step('4', '前端接入工具回调', 'MessageList 自动渲染 ToolCallBlock 和确认门')}
        {codeBlock(CODE_FRONTEND)}

        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 14, fontSize: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>相关文档</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <span><PlugIcon size={13} /> <a href="https://github.com/Grant-Huang/Meso/blob/main/docs/app-plugin-system.md" style={{ color: 'var(--color-accent)' }}>应用插件系统</a> — ToolDefinition 格式完整说明</span>
            <span><SatelliteDishIcon size={13} /> <a href="https://github.com/Grant-Huang/Meso/blob/main/docs/streaming-protocol.md" style={{ color: 'var(--color-accent)' }}>SSE 协议规范</a> — tool_call / tool_result 事件定义</span>
            <span><BuildingIcon size={13} /> <a href="https://github.com/Grant-Huang/Meso/blob/main/docs/capability-system.md" style={{ color: 'var(--color-accent)' }}>能力系统</a> — Tool / Skill / Resource 的区别</span>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>

      {/* ── Right: live demo ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* control bar */}
        <div style={{ padding: '10px 16px', background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

          {/* scenario selector */}
          {(['safe', 'destructive'] as const).map(s => (
            <button
              key={s}
              onClick={() => switchScenario(s)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: `1.5px solid ${scenario === s ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: scenario === s ? 'rgba(61,107,82,0.10)' : 'transparent',
                color: scenario === s ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: 12,
                fontWeight: scenario === s ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {s === 'safe' ? '安全工具 (safe)' : '危险工具 (destructive)'}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* status */}
          <span style={{ fontSize: 11.5, color: phaseColor[phase] }}>{statusText[phase]}</span>

          {/* play / reset */}
          <button
            onClick={phase === 'idle' || phase === 'done' ? play : reset}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: phase === 'idle' || phase === 'done' ? 'var(--color-accent)' : 'var(--color-border)',
              color: phase === 'idle' || phase === 'done' ? '#fff' : 'var(--color-text-secondary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {phase === 'idle' ? (<><PlayIcon size={12} /> 播放</>) : phase === 'done' ? (<><RotateCcwIcon size={12} /> 重播</>) : (<><SquareIcon size={12} /> 重置</>)}
          </button>
        </div>

        {/* message list */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <MessageList
            messages={[MESSAGES[scenario]]}
            streaming={streaming}
            emptyState={null}
            onToolConfirm={handleConfirm}
            onToolCancel={handleCancel}
          />
        </div>

        {/* hint for destructive scenario */}
        {phase === 'waiting_confirm' && (
          <div style={{
            padding: '10px 16px',
            background: 'rgba(217,119,6,0.08)',
            borderTop: '1px solid rgba(217,119,6,0.25)',
            fontSize: 12,
            color: '#92400e',
            flexShrink: 0,
          }}>
            上方 MessageList 中已显示确认门 — 点击"确认执行"继续流式，或点击"取消"重置。
          </div>
        )}
      </div>
    </div>
  )
}
