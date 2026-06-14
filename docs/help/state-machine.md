# 状态机参考

`applyEvent` 是纯函数 reducer：`StreamState × SSEEvent → StreamState`。

## 流级状态

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> streaming: useSSEStream.start
  streaming --> done: done_event
  streaming --> error: error_event_or_network
  done --> [*]
  error --> [*]
  streaming --> idle: abort_or_reset
```

## tool_call 状态

```mermaid
stateDiagram-v2
  [*] --> pending: tool_call_safe
  [*] --> awaiting_confirm: tool_call_write_or_destructive
  awaiting_confirm --> running: tool_status_running_after_confirm
  pending --> running: tool_status_running
  running --> done: tool_result_ok
  running --> error: tool_result_error
  awaiting_confirm --> error: tool_result_error
```

## 关键规则

- `done` 与 `error` 互斥，均终止流
- `tool_result` 保留 `groupId` / `groupKind`
- `error.code` 写入 `StreamState.errorCode`
- `phase` 事件创建/更新 `phases[id]`；`think.phase_id` 路由到对应 phase

权威实现：[`packages/meso-types/src/applyEvent.ts`](../../packages/meso-types/src/applyEvent.ts)

契约测试：[`packages/meso-types/src/__tests__/runtime.contract.test.ts`](../../packages/meso-types/src/__tests__/runtime.contract.test.ts)
