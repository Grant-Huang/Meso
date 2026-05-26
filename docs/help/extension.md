# 扩展事件

第三方后端通过扩展事件传递业务语义，无需修改平台源码。

---

## 为什么需要扩展事件

平台内置 16 个标准事件（capabilities/soul/skill_active/stage/memory/memory_saved/tool_call/tool_result/resource_read/resource_content/think/text/artifact/workflow_node/done/error），但业务场景必然有更多需求。扩展事件机制让你注入任意业务事件，前端通过 `renderExtension` prop 渲染，平台只负责透传和排序。

| 业务需求 | 建议 `name` |
|---------|------------|
| 工具调用进度（搜索、代码执行…）| `tool_progress` |
| 需要用户确认才能继续 | `confirm_gate` |
| 引用业务实体（文档、工单…）| `entity_reference` |
| 更新会话标题 / 标签 | `session_meta` |
| 流式数据可视化 | `chart_update` |

---

## 后端：发送扩展事件

```python
# 工具调用开始
yield sse({"type":"extension","schema_version":"1.0","payload":{
    "name": "tool_progress",
    "version": "1.0",
    "data": {"tool": "web_search", "status": "running", "query": "Meso platform"}
}})

# 工具调用完成
yield sse({"type":"extension","schema_version":"1.0","payload":{
    "name": "tool_progress",
    "version": "1.0",
    "data": {"tool": "web_search", "status": "done", "results": 5}
}})

# 继续正文
yield sse({"type":"text","schema_version":"1.0","payload":{"delta":"搜索到以下结果…"}})
```

> `version` 字段可选，建议填写便于前端做兼容处理。

---

## 前端：通过 renderExtension 渲染

```tsx
import type { ExtensionEvent } from '@meso/ui'

<MessageList
  messages={messages}
  streaming={state}
  renderExtension={(event: ExtensionEvent) => {
    const { name, data } = event.payload

    if (name === 'tool_progress') {
      const d = data as { tool: string; status: string; query?: string; results?: number }
      return (
        <div style={{
          padding: '8px 12px', margin: '4px 0',
          background: 'var(--color-bg-elevated)',
          borderRadius: 8, border: '1px solid var(--color-border)',
          fontSize: 13, color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{d.status === 'running' ? '⟳' : '✓'}</span>
          <span>
            {d.status === 'running'
              ? `正在搜索：${d.query}`
              : `搜索完成（${d.results} 条结果）`}
          </span>
        </div>
      )
    }

    if (name === 'confirm_gate') {
      const d = data as { prompt: string; action: string }
      return (
        <div style={{
          padding: 16, margin: '8px 0',
          background: 'rgba(180,83,9,0.06)',
          borderRadius: 10, border: '1px solid var(--color-warning)',
        }}>
          <p style={{ marginBottom: 12, color: 'var(--color-text)', fontWeight: 500 }}>
            {d.prompt}
          </p>
          <button
            onClick={() => confirmAction(d.action)}
            style={{
              background: 'var(--color-accent)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer',
            }}
          >
            确认执行
          </button>
        </div>
      )
    }

    if (name === 'entity_reference') {
      const d = data as { type: string; id: string; title: string }
      return (
        <a
          href={`/entities/${d.type}/${d.id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 6,
            border: '1px solid var(--color-border)',
            color: 'var(--color-accent)', fontSize: 12, textDecoration: 'none',
            background: 'var(--color-bg-elevated)',
          }}
        >
          📎 {d.title}
        </a>
      )
    }

    return null  // 未知扩展静默忽略
  }}
/>
```

---

## extensionLog vs extensions：两种视图

StreamState 同时维护两种访问方式：

```typescript
// 1. 按到达顺序（用于渲染 renderExtension）
state.extensionLog
// → [tool_progress(running), tool_progress(done), entity_ref(...)]

// 2. 按名称分桶（用于查询最新状态）
state.extensions['tool_progress']
// → [event(running), event(done)]

state.extensions['tool_progress']?.at(-1)?.payload.data
// → { status: 'done', results: 5 }  ← 最新状态
```

**何时用哪个：**

| 场景 | 用法 |
|------|------|
| 渲染事件 UI（顺序很重要）| `extensionLog`（`renderExtension` 内部已使用这个）|
| 查询某类事件的当前状态 | `extensions[name].at(-1)` |
| 判断某工具是否仍在运行 | `extensions['tool_progress']?.at(-1)?.payload.data.status === 'running'` |

---

## 历史消息中的扩展 UI

> **平台约定（normative）**：扩展事件仅在当前流式轮次展示。平台不持久化扩展事件，历史轮次重现扩展 UI 由应用自行负责。

**模式 A：流结束时折叠为 metadata（推荐）**

```typescript
useEffect(() => {
  if (state.status === 'done') {
    const msg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: state.textContent,
      metadata: {
        toolCalls: state.extensions['tool_progress']?.map(e => e.payload.data) ?? [],
        entities:  state.extensions['entity_reference']?.map(e => e.payload.data) ?? [],
      }
    }
    setMessages(prev => [...prev, msg])
    reset()
  }
}, [state.status])

// 渲染历史时，在气泡下方显示摘要
{messages.map(m => (
  <div key={m.id}>
    <ChatBubble role={m.role} content={m.content} />
    {m.metadata?.toolCalls?.length > 0 && (
      <ToolCallSummary calls={m.metadata.toolCalls} />
    )}
  </div>
))}
```

**模式 B：一次性 UI（不需要保留）**

对于确认门禁等单次操作，流结束后 UI 随 StreamState 重置自然消失，无需特殊处理。

---

## 扩展事件命名约定

- 使用 `snake_case`
- 名称应反映业务含义，不要用通用名（`event`、`update`、`data`）
- 如有多个版本，使用 `version` 字段区分，而不是改 `name`
- 平台不维护保留名列表，但约定以 `meso_` 为前缀的名称供平台内部使用，不要占用
