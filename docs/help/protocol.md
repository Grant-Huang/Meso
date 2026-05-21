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
| `stage` | 流水线阶段开始/完成 | StageTimeline 动画 |
| `memory` | 记忆召回完成 | Memory 芯片显示 |
| `think` | LLM 推理过程（增量）| ThinkBlock 展开/折叠 |
| `text` | 正文生成（增量）| ChatBubble 逐字显示 |
| `artifact` | 代码/图表/HTML（增量）| ArtifactPanel 弹出 |
| `done` | 流正常结束 | 光标消失，状态变 done |
| `error` | 错误提前终止 | 错误提示，状态变 error |
| `extension` | 第三方扩展事件 | 由 `renderExtension` 自定义渲染 |

---

## stage — 流水线阶段进度

```json
{"type":"stage","schema_version":"1.0","payload":{"name":"召回记忆","state":"active"}}
{"type":"stage","schema_version":"1.0","payload":{"name":"召回记忆","state":"done"}}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| `name` | string | 阶段标签，如"召回记忆"、"检索知识"、"生成回复" |
| `state` | `"active"` \| `"done"` \| `"error"` | 同名后发覆盖前一个 |

**去重规则**：相同 `name` 的后发事件覆盖前一个，渲染顺序按首次出现。

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

整体替换（非增量），通常在生成正文前发送一次。`memorySnippets` 是数组，每项含 `category` 和 `content`。

---

## think — 推理过程（增量）

```json
{"type":"think","schema_version":"1.0","payload":{"delta":"用户想要一个","done":false}}
{"type":"think","schema_version":"1.0","payload":{"delta":"文件上传组件，","done":false}}
{"type":"think","schema_version":"1.0","payload":{"delta":"","done":true}}
```

`delta` 追加到 `thinkContent`。`done:true` 触发 ThinkBlock 自动折叠（默认 1.5s 延迟）。

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

一次对话可有多个 artifact，按 `artifactOrder` 数组顺序渲染。

---

## done — 流正常结束

```json
{"type":"done","schema_version":"1.0","payload":{}}
```

与 `error` 互斥。收到后 parser 停止处理后续行，光标消失，状态变 `done`。

---

## error — 错误

```json
{"type":"error","schema_version":"1.0","payload":{"message":"上游服务超时","code":"UPSTREAM_TIMEOUT"}}
```

与 `done` 互斥。`code` 为机器可读错误码（可选）。前端处理见 [错误处理](#error-handling)。

---

## extension — 第三方扩展事件

```json
{"type":"extension","schema_version":"1.0","payload":{
  "name":"tool_progress",
  "version":"1.0",
  "data":{"tool":"web_search","status":"running","query":"Meso platform"}
}}
```

详见 [扩展事件](#extension) 章节。

---

## 完整序列示例

```
data: {"type":"stage","schema_version":"1.0","payload":{"name":"召回记忆","state":"active"}}

data: {"type":"stage","schema_version":"1.0","payload":{"name":"召回记忆","state":"done"}}

data: {"type":"memory","schema_version":"1.0","payload":{"snippets":[{"category":"preference","content":"偏好简洁"}]}}

data: {"type":"stage","schema_version":"1.0","payload":{"name":"生成回复","state":"active"}}

data: {"type":"think","schema_version":"1.0","payload":{"delta":"用户问的是…","done":false}}

data: {"type":"think","schema_version":"1.0","payload":{"delta":"","done":true}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"根据你的需求，"}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"以下是代码："}}

data: {"type":"artifact","schema_version":"1.0","payload":{"id":"a1","lang":"python","delta":"def hello():\n    print('hi')\n","done":true}}

data: {"type":"stage","schema_version":"1.0","payload":{"name":"生成回复","state":"done"}}

data: {"type":"done","schema_version":"1.0","payload":{}}
```

---

## parseSSELine 行为规范

`@meso/types` 导出的 `parseSSELine(line)` 函数处理以下输入：

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

## 用 @meso/types 验证后端输出

无需浏览器和 React，在 Node.js / CI 中直接验证 SSE 流：

```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso/types'

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
