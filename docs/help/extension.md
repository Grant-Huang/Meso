# 扩展事件

第三方后端通过扩展事件传递业务语义，无需修改平台源码。

---

## 为什么需要扩展事件

平台内置标准事件（capabilities/soul/skill_active/phase/memory/memory_saved/tool_call/tool_result/tool_status/resource_read/resource_content/think/text/artifact/workflow_node/done/error），但业务场景必然有更多需求。扩展事件机制让你注入任意业务事件，前端通过 `renderExtension` prop 渲染，平台只负责透传和排序。

**工具调用进度、用户确认门控请使用标准事件**，见 [工具调用](tools.md)。扩展事件用于平台无法预见的业务语义。

| 业务需求 | 建议 `name` |
|---------|------------|
| 引用来源 / 文献卡片 | `citation` |
| 引用业务实体（文档、工单…）| `entity_reference` |
| 更新会话标题 / 标签 | `session_meta` |
| 流式数据可视化 | `chart_update` |

---

## 后端：发送扩展事件

```python
# 引用来源
yield sse({"type":"extension","schema_version":"1.0","payload":{
    "name": "citation",
    "version": "1.0",
    "data": {"source": "paper-42", "title": "Meso Protocol Overview"}
}})

# 继续正文
yield sse({"type":"text","schema_version":"1.0","payload":{"delta":"根据文献，"}})
```

> `version` 字段可选，建议填写便于前端做兼容处理。

---

## 前端：通过 renderExtension 渲染

```tsx
import type { ExtensionEvent } from '@meso.ai/ui'

<MessageList
  messages={messages}
  streaming={state}
  renderExtension={(event: ExtensionEvent) => {
    const { name, data } = event.payload

    if (name === 'citation') {
      const d = data as { source: string; title: string; url?: string }
      return (
        <a href={d.url ?? '#'} style={{ fontSize: 13, color: 'var(--color-accent)' }}>
          📎 {d.title}
        </a>
      )
    }

    if (name === 'entity_reference') {
      const d = data as { type: string; id: string; title: string }
      return (
        <a href={`/entities/${d.type}/${d.id}`}>
          📎 {d.title}
        </a>
      )
    }

    return null
  }}
/>
```

---

## extensionLog vs extensions：两种视图

```typescript
// 1. 按到达顺序（用于渲染 renderExtension）
state.extensionLog
// → [citation(...), entity_reference(...)]

// 2. 按名称分桶（用于查询最新状态）
state.extensions['citation']
// → [event(paper-42), event(paper-43)]
```

| 场景 | 用法 |
|------|------|
| 渲染事件 UI（顺序很重要）| `extensionLog` |
| 查询某类事件的当前状态 | `extensions[name].at(-1)` |

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
        citations: state.extensions['citation']?.map(e => e.payload.data) ?? [],
      }
    }
    setMessages(prev => [...prev, msg])
    reset()
  }
}, [state.status])
```

**模式 B：一次性 UI（不需要保留）**

流结束后 UI 随 StreamState 重置自然消失，无需特殊处理。

---

## 扩展事件命名约定

- 使用 `snake_case`
- 名称应反映业务含义，不要用通用名（`event`、`update`、`data`）
- 如有多个版本，使用 `version` 字段区分，而不是改 `name`
- 平台不维护保留名列表，但约定以 `meso_` 为前缀的名称供平台内部使用，不要占用
