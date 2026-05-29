# 工具与 Hooks

## Function Calling（工具调用）

Meso 通过 `extension` 事件传递工具调用状态，前端通过 `renderExtension` 插槽渲染自定义卡片，不侵入平台核心。

### 后端：发送工具进度

```python
# FastAPI 示例（Python 伪代码）
async def stream_with_tools():
    # 1. LLM 决定调用工具
    yield sse_event("extension", {
        "name": "tool_progress",
        "data": { "tool": "search_knowledge", "status": "running", "query": "..." }
    })

    # 2. 执行工具
    result = await execute_tool("search_knowledge", query="...")

    # 3. 工具完成
    yield sse_event("extension", {
        "name": "tool_progress",
        "data": { "tool": "search_knowledge", "status": "done", "result_count": 3 }
    })

    # 4. 继续生成正文（注入工具结果后再次调用 LLM）
    async for chunk in llm.stream(messages_with_tool_result):
        yield sse_event("text", { "delta": chunk })

    yield sse_event("done", {})
```

### 前端：渲染工具卡片

```tsx
<MessageList
  messages={completedMessages}
  streaming={state}
  renderExtension={(event) => {
    if (event.payload.name === 'tool_progress') {
      const { tool, status, query } = event.payload.data
      return (
        <div className="tool-card">
          <span>{tool}</span>
          <span className={status === 'done' ? 'done' : 'running'}>
            {status === 'running' ? `查询：${query}` : '完成'}
          </span>
        </div>
      )
    }
  }}
/>
```

### confirm_gate：需要用户确认的操作

适合"即将执行不可逆操作"的场景（如写文件、发邮件）：

```json
{
  "type": "extension",
  "schema_version": "1.0",
  "payload": {
    "name": "confirm_gate",
    "data": {
      "action": "write_file",
      "path": "/output/report.md",
      "message": "即将写入文件，是否继续？"
    }
  }
}
```

前端在 `renderExtension` 中渲染确认按钮，用户点击后通过 POST 通知后端继续。

### 内置工具参考

| 工具名 | 触发条件 | 说明 |
|--------|---------|------|
| `search_knowledge` | Manifest 挂载知识库时可用 | BM25 + 向量混合检索 |
| `read_file` | 工具集声明 `read_file` | 读取工作目录文件 |
| `save_memory` | 工具集声明 `save_memory` | 向长期记忆写入片段 |
| `write_file` | 工具集声明 `write_file` + 用户确认 | 写入本地文件 |
| `extract_findings` | 自动触发（后置处理） | 从回复中提取可存入记忆的内容 |

---

## useSSEStream Hook

连接后端 SSE 流的核心 Hook，封装了 `fetch + ReadableStream`。

```tsx
import { useSSEStream } from '@meso.ai/ui'
import type { StreamCallbacks } from '@meso.ai/ui'

const callbacks: StreamCallbacks = {
  onDone: (finalState) => console.log('完成', finalState.textContent),
  onToolCall: (call) => console.log('工具调用', call.name),
}

const { state, start, abort, reset } = useSSEStream('/api/chat/stream', callbacks)
```

### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `state` | `StreamState` | 当前流式状态（见下方结构） |
| `start(options?)` | `(StreamOptions) => void` | 发起请求，开始接收流 |
| `abort()` | `() => void` | 中止当前流（发送 AbortSignal） |
| `reset()` | `() => void` | 重置 state 为初始状态 |

### StreamOptions

```typescript
interface StreamOptions {
  method?: 'GET' | 'POST'      // 默认 'GET'
  body?: Record<string, unknown> // POST 时的请求体（自动 JSON 序列化）
  headers?: Record<string, string> // 附加请求头（如 Authorization）
}
```

示例：

```tsx
start({
  method: 'POST',
  body: { message: input, session_id: sessionId },
  headers: { Authorization: 'Bearer ' + token }
})
```

### StreamState 结构

```typescript
interface StreamState {
  status: 'idle' | 'streaming' | 'done' | 'error'

  // 能力上下文（LLM 生成前设定）
  availableCapabilities: CapabilitiesPayload | null
  activeSoul:  SoulPayload | null
  activeSkill: SkillPayload | null

  // 阶段进度
  stages: StagePayload[]

  // 记忆
  memorySnippets: MemorySnippet[]
  memorySaved:    MemorySavedPayload[]

  // 工具调用 & 资源读取
  toolCalls:         Record<string, ToolCallState>
  toolCallOrder:     string[]
  resourceReads:     Record<string, ResourceReadState>
  resourceReadOrder: string[]

  // LLM 输出
  thinkContent: string
  thinkDone:    boolean
  textContent:  string
  artifacts:    Record<string, ArtifactState>
  artifactOrder: string[]

  // 工作流节点（开发者可观测）
  workflowRuns:     Record<string, WorkflowRunState>
  workflowRunOrder: string[]

  // 扩展事件
  extensions:   Record<string, ExtensionEvent[]>
  extensionLog: ExtensionEvent[]

  errorMessage: string | null
}
```

### 典型 UI 状态机

```
idle ──start()──▶ streaming ──done 事件──▶ done
                    │                        │
                  abort()               reset()
                    │                        │
                    ▼                        ▼
                  done                     idle
```

---

## useTheme Hook

亮/暗主题切换，状态持久化到 `localStorage`。

```tsx
import { useTheme } from '@meso.ai/ui'

const { theme, toggle } = useTheme()
// theme: 'light' | 'dark'
// toggle(): 切换并写入 localStorage['meso-theme']
```

切换通过设置 `document.documentElement.setAttribute('data-theme', theme)` 实现，CSS token 自动响应。

---

## @meso.ai/ui/runtime — 无 React 运行时

在 Node.js、边缘函数或测试环境中验证后端输出，无需启动前端。

```bash
npm install @meso.ai/ui
```

```typescript
import {
  parseSSELine,
  applyEvent,
  createInitialStreamState,
  PROTOCOL_VERSION,
} from '@meso.ai/ui/runtime'
```

### parseSSELine(line)

解析一行 SSE 数据，处理 `[DONE]`、注释行、格式错误的 JSON。

```typescript
const event = parseSSELine('data: {"type":"text","schema_version":"1.0","payload":{"delta":"hello"}}')
// → { type: 'text', schema_version: '1.0', payload: { delta: 'hello' } }

parseSSELine('data: [DONE]')  // → null（流结束标记）
parseSSELine(': comment')     // → null（注释行）
```

### applyEvent(state, event)

纯函数状态机 reducer，接受当前状态和事件，返回新状态。

```typescript
const state0 = createInitialStreamState()
const state1 = applyEvent(state0, { type: 'text', payload: { delta: 'hello' } })
// state1.textContent === 'hello'
```

### 验证后端输出（完整示例）

```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/ui/runtime'

const sseOutput = `
data: {"type":"stage","schema_version":"1.0","payload":{"name":"检索知识","state":"active"}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"根据知识库，"}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"答案是…"}}

data: {"type":"done","schema_version":"1.0","payload":{}}
`.trim()

const state = sseOutput.split('\n').reduce((s, line) => {
  const event = parseSSELine(line)
  return event ? applyEvent(s, event) : s
}, createInitialStreamState())

console.log(state.status)      // 'done'
console.log(state.textContent) // '根据知识库，答案是…'
console.log(state.stages)      // [{ name: '检索知识', state: 'active' }]
```

### 契约测试 Fixture

`packages/meso-types/src/__fixtures__/` 提供标准 SSE 流样本，可用于回归测试：

```typescript
import { readFileSync } from 'fs'

const fixture = readFileSync('packages/meso-types/src/__fixtures__/full-stream.txt', 'utf8')
const state = fixture.split('\n').reduce((s, line) => {
  const ev = parseSSELine(line)
  return ev ? applyEvent(s, ev) : s
}, createInitialStreamState())

expect(state.status).toBe('done')
expect(state.textContent).toMatchSnapshot()
```
