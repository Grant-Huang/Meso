# 工具与 Hooks

Meso 使用一等 `tool_call` / `tool_result` / `tool_status` 事件表达工具生命周期。`extension` 仅作领域特定事件的兜底通道。

## 推荐路径：标准 tool 事件

### 后端（Python FastAPI）

```python
import json

def sse_line(event_type: str, payload: dict) -> str:
    return f"data: {json.dumps({'type': event_type, 'schema_version': '1.0', 'payload': payload}, ensure_ascii=False)}\n\n"

async def stream_with_tools(query: str):
    # 1. 工具调用（write 工具自动进入 awaiting_confirm）
    yield sse_line("tool_call", {
        "id": "tc1",
        "name": "search_knowledge",
        "args": {"query": query},
        "risk": "safe",
        "groupId": "batch-1",
        "groupKind": "parallel_search",
    })

    # 2. 开始执行
    yield sse_line("tool_status", {"id": "tc1", "status": "running"})

    # 3. 结果
    yield sse_line("tool_result", {
        "tool_call_id": "tc1",
        "output": "找到 3 条记录",
        "duration_ms": 420,
    })

    yield sse_line("text", {"delta": "根据检索结果……"})
    yield sse_line("done", {})
```

### 危险工具 + 确认

```python
yield sse_line("tool_call", {
    "id": "tc2",
    "name": "delete_file",
    "args": {"path": "/tmp/x"},
    "risk": "destructive",
})
# 前端自动显示 ConfirmGate；用户确认后 POST /api/tools/confirm
# 后端收到确认后继续执行，发送 tool_status + tool_result
```

非 destructive 但需确认（如批量发邮件）：

```python
yield sse_line("tool_call", {
    "id": "tc3",
    "name": "send_bulk_email",
    "args": {"count": 50},
    "risk": "safe",
    "requires_confirm": True,
})
```

### 前端

```tsx
import { MessageList, ProcessTrace } from '@meso.ai/ui'
import { createMesoSession } from '@meso.ai/client'

<MessageList
  messages={messages}
  streaming={state}
  onToolConfirm={(id) => session.confirmToolCall(id, true)}
  onToolCancel={(id) => session.confirmToolCall(id, false)}
/>
```

`ProcessTrace` 按 `groupId` 分组渲染工具步骤。

## useSSEStream 生产选项

```tsx
const { state, start } = useSSEStream('/api/chat/stream', {
  onToolCall: (call) => metrics.toolStarted(call.id),
  onToolResult: (result) => metrics.toolDone(result.tool_call_id),
  onError: (msg, code) => console.error(code, msg),
})

start({
  headers: { Authorization: `Bearer ${token}` },
  batchMs: 16,           // 合批 text/think delta
  reconnect: true,       // 网络错误指数退避重连
  watchdogMs: 120_000,
})
```

## 何时仍用 extension

仅当事件语义无法映射到标准类型时（见 [扩展事件选型](../extension-guide.md)）。工具进度请使用 `tool_call` + `tool_status` + `tool_result`。

## 相关文档

- [SSE 协议](./protocol.md) — `tool_call` / `tool_result` / `tool_status` 字段
- [状态机](./state-machine.md) — tool 状态转移图
- [端到端 Recipe](./end-to-end-recipe.md) — 完整应用骨架
