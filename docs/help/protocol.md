# SSE 协议 v1.0

所有流式事件遵循统一信封格式。这是平台与后端之间的**唯一契约**，也是单一事实来源。

---

## 信封格式

```
data: {"type":"<event_type>","schema_version":"1.0","payload":{…}}\n\n
```

每条 SSE 消息 = 一行 `data:` 开头的 JSON + 一个空行。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 事件类型（见下表）|
| `schema_version` | `"1.0"` | ✅ | 协议版本，用于破坏性变更路由 |
| `payload` | object | ✅ | 事件数据，不可为 null |

> 解析器对缺失 `schema_version` 宽容处理，视为 `"1.0"`，支持渐进迁移。

---

## 标准事件一览

| 事件 | 触发时机 | UI 效果 |
|------|---------|---------|
| `capabilities` | 本次会话能力清单 | 应用可按需展示可用能力 |
| `soul` | 激活的 Soul/人格 | SoulIndicator 显示 |
| `skill_active` | 激活的 Skill/工作模式 | SkillIndicator 显示 |
| `phase` | 流水线阶段开始/完成 | ProcessTrace / StageTimeline |
| `memory` | 记忆召回完成 | Memory 芯片显示 |
| `memory_saved` | 记忆已持久化 | 可选 UI 提示 |
| `think` | LLM 推理过程（增量）| ThinkBlock 展开/折叠 |
| `text` | 正文生成（增量）| ChatBubble 逐字显示 |
| `artifact` | 代码/图表/HTML（增量）| ArtifactPanel 弹出 |
| `tool_call` | 工具调用发起 | ToolCallBlock 出现 |
| `tool_result` | 工具调用结果 | ToolCallBlock 更新 |
| `resource_read` | MCP 资源读取发起 | ResourceReadBlock 出现 |
| `resource_content` | MCP 资源内容到达 | ResourceReadBlock 更新 |
| `workflow_node` | DAG 工作流节点状态 | WorkflowTimeline 更新 |
| `done` | 流正常结束 | 光标消失，状态变 done |
| `error` | 错误提前终止 | 错误提示，状态变 error |
| `extension` | 第三方扩展事件 | 由 `renderExtension` 自定义渲染 |

---

## phase — 流水线阶段进度

`phase` 支持 per-phase think 流、冻结快照与结构化产出：

```json
{"type":"phase","schema_version":"1.0","payload":{"id":"understand","name":"理解需求","state":"running"}}
{"type":"think","schema_version":"1.0","payload":{"delta":"用户想要简洁答案","done":false,"phase_id":"understand"}}
{"type":"think","schema_version":"1.0","payload":{"delta":"","done":true,"phase_id":"understand"}}
{"type":"phase","schema_version":"1.0","payload":{
  "id":"understand","name":"理解需求","state":"done",
  "pinned_think":"用户想要简洁答案",
  "body":"{\"intent\":\"factual\",\"tone\":\"concise\"}",
  "started_at":1749433200000,"ended_at":1749433201800
}}
```

| payload 字段 | 类型 | 必填 | 说明 |
|-------------|------|------|------|
| `id` | string | ✅ | 阶段唯一标识（字母数字下划线），同一 id 的后发事件覆盖前态 |
| `name` | string | ✅ | 可读阶段名称，用于 UI 显示 |
| `state` | `"pending"` \| `"running"` \| `"done"` \| `"error"` | ✅ | 生命周期状态 |
| `body` | string | — | JSON 字符串，阶段结构化产出（如分析意图、提取结果等）|
| `pinned_think` | string | — | 完成时提供的冻结推理快照，优先于流式内容渲染，防止 flash |
| `started_at` | number | — | 毫秒时间戳 |
| `ended_at` | number | — | 毫秒时间戳 |

**典型后端序列（Python）：**

```python
# 阶段开始
yield phase_event(id="understand", name="理解需求", state="running")

# 阶段独立 think 流（phase_id 路由到阶段，不影响顶层 thinkContent）
yield think_event(delta="分析用户意图...", phase_id="understand")
yield think_event(delta="需要简洁回答", phase_id="understand", done=True)

# 阶段完成，携带冻结快照和结构化产出
yield phase_event(
    id="understand", name="理解需求", state="done",
    pinned_think="分析用户意图...需要简洁回答",
    body=json.dumps({"intent": "factual", "tone": "concise"}),
)
```

**去重规则**：相同 `id` 的后发事件覆盖前一个，渲染顺序按 `phaseOrder`。

---

## think — 推理过程（增量）

```json
{"type":"think","schema_version":"1.0","payload":{"delta":"用户想要一个","done":false}}
{"type":"think","schema_version":"1.0","payload":{"delta":"文件上传组件，","done":false}}
{"type":"think","schema_version":"1.0","payload":{"delta":"","done":true}}
```

`delta` 追加到 `thinkContent`。`done:true` 触发 ThinkBlock 自动折叠（默认 1.5s 延迟）。

**per-phase 路由（v2.1+）**：当 `phase_id` 字段存在时，`delta` 路由到 `phases[phase_id].thinkContent`，不影响顶层 `thinkContent`：

```json
{"type":"think","schema_version":"1.0","payload":{"delta":"分析意图…","done":false,"phase_id":"understand"}}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| `delta` | string | 推理文本片段，追加到目标 thinkContent |
| `done` | boolean | `true` 时标记推理结束，触发自动折叠 |
| `phase_id` | string | （v2.1+）存在时路由到指定 phase；phase 不存在则忽略 |

---

## text — 正文（增量）

```json
{"type":"text","schema_version":"1.0","payload":{"delta":"以下是代码示例："}}
```

`delta` 追加到 `textContent`，同时触发末尾光标闪烁。支持 Markdown。

---

## artifact — 代码/图表/HTML（增量，多 Artifact）

```json
{"type":"artifact","schema_version":"1.0","payload":{"id":"a1","lang":"python","delta":"def hello():\n","done":false}}
{"type":"artifact","schema_version":"1.0","payload":{"id":"a1","lang":"python","delta":"    print('hi')\n","done":true}}
```

| payload 字段 | 说明 |
|-------------|------|
| `id` | 唯一标识，同一 `id` 的 `delta` 追加。一次回复可有多个不同 `id` 的 artifact |
| `lang` | 语言/类型。`"html preview"` → iframe 渲染；`"mermaid"` → 图表；其余 → 代码高亮 |
| `done` | `true` 时触发最终语法高亮 / 图表渲染 |

---

## tool_call — 工具调用发起

```json
{"type":"tool_call","schema_version":"1.0","payload":{
  "id":"tc_1",
  "name":"web_search",
  "description":"搜索网页",
  "arguments":{"query":"Meso platform"},
  "annotations":{"risk":"safe"}
}}
```

| payload 字段 | 类型 | 必填 | 说明 |
|-------------|------|------|------|
| `id` | string | ✅ | 全局唯一，与 `tool_result.tool_call_id` 对应 |
| `name` | string | ✅ | 工具名称 |
| `description` | string | — | 工具描述，显示在 ToolCallBlock 中 |
| `arguments` | object | — | 调用参数 |
| `annotations.risk` | `"safe"` \| `"write"` \| `"destructive"` | — | `write`/`destructive` 触发 ConfirmGate |
| `groupId` | string | — | （v2.1+）同组工具调用的稳定 group id（如子话题 id、并行搜索批次）|
| `groupKind` | string | — | （v2.1+）语义分类（如 `"subtopic"`、`"parallel_search"`）|

**`groupId` / `groupKind` 的用途：**

消除文本解析 `(1/4)` 式编号的脆弱做法，后端直接标注：

```json
{"payload":{"id":"tc_1","name":"search","groupId":"batch_a","groupKind":"parallel_search"}}
{"payload":{"id":"tc_2","name":"search","groupId":"batch_a","groupKind":"parallel_search"}}
{"payload":{"id":"tc_3","name":"search","groupId":"batch_a","groupKind":"parallel_search"}}
```

前端按 `groupId` 分组渲染，无需解析名称：

```ts
const groups = state.toolCallOrder.reduce((acc, id) => {
  const tc = state.toolCalls[id]
  const key = tc.groupId ?? id
  ;(acc[key] ??= []).push(tc)
  return acc
}, {} as Record<string, ToolCallState[]>)
```

---

## tool_result — 工具调用结果

```json
{"type":"tool_result","schema_version":"1.0","payload":{
  "tool_call_id":"tc_1",
  "content":"搜索结果：…",
  "error":null
}}
```

| payload 字段 | 说明 |
|-------------|------|
| `tool_call_id` | 对应 `tool_call.id` |
| `content` | 结果内容（文本或 JSON 字符串）|
| `error` | 非 null 时 ToolCallBlock 显示错误状态 |

---

## resource_read / resource_content — MCP 资源读取

```json
{"type":"resource_read","schema_version":"1.0","payload":{"id":"r1","uri":"file:///src/main.ts","description":"读取主文件"}}
{"type":"resource_content","schema_version":"1.0","payload":{"resource_read_id":"r1","contents":[{"uri":"file:///src/main.ts","text":"..."}]}}
```

---

## memory — 记忆召回结果

```json
{"type":"memory","schema_version":"1.0","payload":{
  "snippets":[
    {"category":"preference","content":"偏好 TypeScript，arrow functions"},
    {"category":"project","content":"当前项目使用 React 18 + Vite"}
  ]
}}
```

整体替换（非增量），通常在生成正文前发送一次。

---

## done / error

```json
{"type":"done","schema_version":"1.0","payload":{}}

{"type":"error","schema_version":"1.0","payload":{"message":"上游服务超时","code":"UPSTREAM_TIMEOUT"}}
```

与彼此互斥。`error.code` 为机器可读错误码（可选）。

---

## extension — 第三方扩展事件

```json
{"type":"extension","schema_version":"1.0","payload":{
  "name":"citation",
  "version":"1.0",
  "data":{"source":"paper-42","title":"Meso Protocol Overview"}
}}
```

详见 [扩展事件](#extension) 章节。

---

## 完整序列示例

### 基础序列

```
data: {"type":"phase","schema_version":"1.0","payload":{"id":"recall","name":"召回记忆","state":"running"}}

data: {"type":"phase","schema_version":"1.0","payload":{"id":"recall","name":"召回记忆","state":"done"}}

data: {"type":"memory","schema_version":"1.0","payload":{"snippets":[{"category":"preference","content":"偏好简洁"}]}}

data: {"type":"phase","schema_version":"1.0","payload":{"id":"generate","name":"生成回复","state":"running"}}

data: {"type":"think","schema_version":"1.0","payload":{"delta":"用户问的是…","done":false}}

data: {"type":"think","schema_version":"1.0","payload":{"delta":"","done":true}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"根据你的需求，"}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"以下是代码："}}

data: {"type":"artifact","schema_version":"1.0","payload":{"id":"a1","lang":"python","delta":"def hello():\n    print('hi')\n","done":true}}

data: {"type":"phase","schema_version":"1.0","payload":{"id":"generate","name":"生成回复","state":"done"}}

data: {"type":"done","schema_version":"1.0","payload":{}}
```

### 多阶段 phase 序列（v2.1+）

```
data: {"type":"phase","schema_version":"1.0","payload":{"id":"understand","name":"理解需求","state":"running"}}

data: {"type":"think","schema_version":"1.0","payload":{"delta":"用户需要简洁回答","done":false,"phase_id":"understand"}}

data: {"type":"think","schema_version":"1.0","payload":{"delta":"","done":true,"phase_id":"understand"}}

data: {"type":"phase","schema_version":"1.0","payload":{"id":"understand","name":"理解需求","state":"done","pinned_think":"用户需要简洁回答"}}

data: {"type":"phase","schema_version":"1.0","payload":{"id":"generate","name":"生成回复","state":"running"}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"这是最终答案"}}

data: {"type":"phase","schema_version":"1.0","payload":{"id":"generate","name":"生成回复","state":"done"}}

data: {"type":"done","schema_version":"1.0","payload":{}}
```

---

## parseSSELine 行为规范

`@meso.ai/types` 导出的 `parseSSELine(line)` 函数处理以下输入：

| 输入 | 返回 | 说明 |
|------|------|------|
| `"data: {...}"` | `SSEEvent` | 正常解析 |
| `"data: [DONE]"` | `DoneEvent` | OpenAI 兼容 sentinel |
| `""`（空行）| `null` | SSE 分隔符，跳过 |
| `": comment"` | `null` | SSE 注释，跳过 |
| `"data: {invalid"` | `null` | 非法 JSON，静默跳过 |
| 缺少 `payload` 字段 | `null` | 结构不合规，跳过 |
| 缺少 `schema_version` | `SSEEvent`（补充为 1.0）| 宽容迁移 |

---

## 用 @meso.ai/types 验证后端输出

无需浏览器和 React，在 Node.js / CI 中直接验证 SSE 流：

```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/types'

const sseOutput = `
data: {"type":"text","schema_version":"1.0","payload":{"delta":"hello"}}

data: {"type":"done","schema_version":"1.0","payload":{}}
`.trim()

const finalState = sseOutput.split('\n').reduce((state, line) => {
  const event = parseSSELine(line)
  return event ? applyEvent(state, event) : state
}, { ...createInitialStreamState(), status: 'streaming' as const })

console.log(finalState.textContent)  // "hello"
console.log(finalState.status)       // "done"
```

完整契约测试方法见 [测试与调试](#testing)。

---

## 从 v0.x 迁移

v0.x 使用扁平格式（无 `schema_version`，无 `payload` 包装）。迁移方法见 [升级迁移](#migration)。
