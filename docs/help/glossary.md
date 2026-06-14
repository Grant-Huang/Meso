# 术语表

## session / turn / stream

| 术语 | 定义 | 由谁管理 |
|------|------|----------|
| **session** | 多轮对话的持久化容器（含 history、auth 上下文） | 应用 / `@meso.ai/client` |
| **turn** | 用户一次输入 + 助手一次完整响应 | 应用 |
| **stream** | 单次 SSE 连接产生的 `StreamState` 快照 | `@meso.ai/types` + `useSSEStream` |

关系：`session` 包含多个 `turn`；每个 assistant `turn` 对应一次 `stream`。

## stage vs phase

| 概念 | 粒度 | UI 组件 |
|------|------|---------|
| **stage** | 轻量进度标签（召回记忆、生成回复） | `StageTimeline` |
| **phase** | 多阶段流水线（含 per-phase think + body） | `ProcessTrace` phase 块 |

优先使用 `phase`；`stage` 适合简单管道。

## tool_call 状态

| 状态 | 含义 | 如何进入 |
|------|------|----------|
| `pending` | 已收到调用，未开始 | `tool_call` 事件（safe 工具） |
| `awaiting_confirm` | 等待用户确认 | `tool_call`（write/destructive/requires_confirm）或 `tool_status` |
| `running` | 正在执行 | `tool_status` 事件 |
| `done` / `error` | 已完成 / 失败 | `tool_result` 事件 |

## extension vs 一等事件

见 [扩展事件选型](../extension-guide.md#决策树)。
