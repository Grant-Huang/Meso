# 扩展事件指南

本文说明第三方如何通过扩展事件机制传递业务语义事件，以及平台在时序、历史消息方面的约定。

---

## 为什么需要扩展事件

平台内置 7 个标准事件（`stage` / `memory` / `think` / `text` / `artifact` / `done` / `error`）。
第三方后端几乎必然有平台无法预见的语义，例如：

- 工具调用进度（`tool_progress`）
- 需要用户确认才能继续的操作（`confirm_gate`）
- 业务实体引用（`entity_reference`）
- 会话元数据更新（`session_meta`）

**扩展事件机制允许第三方传递任意业务事件，而无需 fork 或修改平台源码。**

---

## Wire Format

```
data: {"type":"extension","schema_version":"1.0","payload":{"name":"<extension_id>","version":"1.0","data":{…}}}\n\n
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `payload.name` | ✅ | 扩展标识符，如 `"tool_progress"`、`"confirm_gate"` |
| `payload.version` | ❌ | 扩展 schema 自身的版本号（语义化，可选） |
| `payload.data` | ✅ | 任意对象，结构由扩展定义，平台不解析 |

---

## 后端示例

```python
# Python / FastAPI（非规范参考实现）
async def stream_with_tool():
    yield f'data: {json.dumps({"type":"extension","schema_version":"1.0","payload":{"name":"tool_progress","data":{"tool":"web_search","status":"running","query":"Meso platform"}}})}\n\n'
    # ... 执行工具 ...
    yield f'data: {json.dumps({"type":"extension","schema_version":"1.0","payload":{"name":"tool_progress","data":{"tool":"web_search","status":"done","results":3}}})}\n\n'
    yield f'data: {json.dumps({"type":"text","schema_version":"1.0","payload":{"delta":"根据搜索结果，"}})}\n\n'
    yield f'data: {json.dumps({"type":"done","schema_version":"1.0","payload":{}})}\n\n'
```

---

## 前端渲染

通过 `MessageList` 的 `renderExtension` prop 渲染扩展事件 UI：

```tsx
import { MessageList } from '@meso/ui'
import type { ExtensionEvent } from '@meso/ui'

<MessageList
  messages={messages}
  streaming={state}
  renderExtension={(event: ExtensionEvent) => {
    switch (event.payload.name) {
      case 'tool_progress':
        return <ToolProgressCard data={event.payload.data as ToolProgressData} />
      case 'confirm_gate':
        return (
          <ConfirmGate
            data={event.payload.data as ConfirmGateData}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )
      default:
        return null  // 忽略未知扩展
    }
  }}
/>
```

`renderExtension` 不提供时，扩展事件静默忽略，不影响其他渲染。

---

## 时序约定

### extensionLog（时序渲染）

`StreamState.extensionLog` 按事件到达顺序追加，**保证严格时间序**。

使用场景：`tool_start → tool_done → confirm_gate` 交替出现，需要按顺序渲染。

```typescript
// 平台内部：extensionLog 保证顺序
state.extensionLog
// → [tool_progress(running), tool_progress(done), confirm_gate(...)]
```

`renderExtension` 接收的正是 `extensionLog` 中的事件，按顺序调用。

### extensions（按名称查找）

`StreamState.extensions` 以 `name` 为 key，存储同名事件的数组：

```typescript
state.extensions['tool_progress']
// → [event(running), event(done)]

state.extensions['confirm_gate']
// → [event(...)]
```

使用场景：需要"取某类事件的最新状态"时（如 `tool_progress[-1].data.status`）。

**两者同时维护，选择适合场景的结构。**

---

## 历史消息中的扩展事件

### 平台的明确约定

> **扩展事件仅在当前流式轮次（`StreamState`）中展示。**  
> 平台不持久化扩展事件，不负责在历史消息中重现扩展 UI。

原因：扩展事件是业务实现细节（工具调用状态、门禁状态），其持久化格式属于第三方业务领域，平台无法统一处理。

### 第三方如何处理历史轮次的扩展 UI

有两种推荐模式：

**模式 A：落库时折叠为 metadata**

流结束后，将扩展事件汇总为 `message.metadata`，历史渲染时按 metadata 自行绘制：

```typescript
// 流结束后由应用层存储
const messageRecord = {
  id: uuid(),
  role: 'assistant',
  content: state.textContent,
  metadata: {
    // 应用自行决定保留哪些扩展信息
    toolCalls: state.extensions['tool_progress']?.map(e => e.payload.data),
  },
}

// MessageList 渲染历史时，在 ChatBubble 下方渲染业务摘要
messages.map(m => (
  <div key={m.id}>
    <ChatBubble role={m.role} content={m.content} />
    {m.metadata?.toolCalls && <ToolCallSummary calls={m.metadata.toolCalls} />}
  </div>
))
```

**模式 B：明确声明"仅当前轮次"**

对于确认门禁等一次性操作，历史中不显示扩展 UI 是合理的。
在 `renderExtension` 中直接渲染，流结束后随 `StreamState` 重置自然消失。

---

## Well-known 扩展名称（社区建议，非强制）

| name | 建议用途 | data 示例 |
|------|----------|-----------|
| `tool_progress` | 工具调用开始 / 结束 / 错误 | `{tool,status,query?,results?}` |
| `confirm_gate` | 等待用户确认 | `{prompt,options:[],timeout?}` |
| `entity_reference` | 引用业务实体（文档、人物等） | `{type,id,name,url?}` |
| `session_meta` | 更新会话元数据（标题等） | `{title?,tags?}` |

建议在应用内统一定义 TypeScript 类型：

```typescript
type ToolProgressData = {
  tool: string
  status: 'running' | 'done' | 'error'
  query?: string
  results?: number
}

function renderExtension(event: ExtensionEvent) {
  if (event.payload.name === 'tool_progress') {
    const data = event.payload.data as ToolProgressData
    // ...
  }
}
```

---

## 验证扩展事件（无 React）

使用 `@meso/ui/runtime` 在 Node.js 中验证后端发送的扩展事件：

```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso/ui/runtime'

const lines = [
  'data: {"type":"extension","schema_version":"1.0","payload":{"name":"tool_progress","data":{"status":"running"}}}',
  'data: {"type":"done","schema_version":"1.0","payload":{}}',
]

const state = lines.reduce((s, line) => {
  const event = parseSSELine(line)
  return event ? applyEvent(s, event) : s
}, { ...createInitialStreamState(), status: 'streaming' as const })

console.log(state.extensionLog.length)        // 1
console.log(state.extensions['tool_progress']) // [ExtensionEvent]
console.log(state.status)                      // 'done'
```
