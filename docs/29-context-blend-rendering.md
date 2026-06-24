# Context-Blend 上下文融合渲染

> 自 `@meso.ai/ui@3.1.0` / `@meso.ai/types@2.1.0` 起，`MessageList` 默认采用 **Context-Blend**（上下文融合）渲染：工具调用、文本、资源读取、产物按**到达顺序交错**呈现，形成一段流畅的会话叙述，而不是把工具成块堆在文本前后。

---

## 1. 为什么需要 Context-Blend

旧的渲染把"执行过程"（工具/阶段/资源）和"回答文本"分成两段：工具卡片成块聚在一起，文本单独一块。这带来两个问题：

1. **工具卡片永远堆在底部**，文本无法穿插其间，叙述被割裂。
2. **流结束（done）时整轮内容被换组件重渲**——流式期间走"执行过程"组件，done 后只把纯文本提交为一条消息，工具执行过程整体消失。用户看到的是一次明显的"回写/重排"。

第二点直接违反 [`docs/25-linear-streaming-ui-pattern.md`](./25-linear-streaming-ui-pattern.md) 与 `CLAUDE.md` 的核心原则：

> **streaming 与 done 必须共用同一渲染路径。done 不是"换组件"，是"同组件的不同 prop 状态"。**

Context-Blend 把 live（流式中）与 committed（已完成历史）统一到**同一个渲染组件**，done 只是把 `streaming` 从 `true` 切到 `false`，因此**零回写、零重排**。

---

## 2. 两种渲染模式

| 模式 | 行为 | 何时使用 |
|------|------|---------|
| **blend**（默认） | 工具/文本/资源/产物按到达顺序交错；已完成工具内联折叠、可原地展开；当前工具展开（可显示确认门） | 新默认，推荐 |
| **block**（兼容） | 旧行为：工具分组在上、文本在下 | 通过 `renderingMode="block"` 显式切回，用于过渡 |

```tsx
import { MessageList } from '@meso.ai/ui'

// 默认即 blend，无需任何配置
<MessageList messages={messages} streaming={stream} />

// 显式切回旧的 block 行为
<MessageList messages={messages} streaming={stream} renderingMode="block" />
```

---

## 3. `MessageList` 新增 API

### 3.1 `renderingMode?: 'block'`

不传或传 `undefined` → **blend**（默认）。传 `'block'` → 兼容模式。

### 3.2 `simplify?: SimplifyOptions`

控制 blend 模式下**内联工具卡片**的详情程度（复用 `ProcessTrace` 的 `SimplifyOptions`）。最常用的是三档 `verbosity`：

```tsx
<MessageList
  messages={messages}
  streaming={stream}
  simplify={{ verbosity }}  // 'compact' | 'standard' | 'detailed'
/>
```

| verbosity | 工具卡片详情 |
|-----------|-------------|
| `compact` | 仅摘要行，参数/输出折叠 |
| `standard` | 摘要 + Provider/风险徽章，参数/输出折叠（可点开） |
| `detailed` | 全部展开，含执行耗时等 |

### 3.3 `Message.trace?: StreamState`

让一条**已完成的助手消息**带上整轮的 `StreamState` 冻结快照。带 `trace` 的 assistant 消息会走与 live **完全相同**的 blend 渲染路径（`streaming={false}`），因此工具+文本在历史里保持交错、不丢失执行过程。

```tsx
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  artifacts?: ArtifactDef[]
  trace?: StreamState   // ← 新增：整轮冻结快照
}
```

> `StreamState` 是不可变的（`applyEvent` 为纯函数，`reset()` 创建全新对象），因此在 `done` 回调里捕获的 `state` 快照即使之后 `reset()` 也始终安全，可直接存入 `Message.trace`。

---

## 4. 完整用法：流式 → 提交历史（同源路径）

关键在于 **done 时把整轮 `state` 存进 `Message.trace`**，而不是只提取纯文本：

```tsx
function ChatPage() {
  const { state, send, reset } = useMyStream()
  const [messages, setMessages] = useState<Message[]>([])

  // done 时把整轮 trace 快照提交进历史，再 reset
  useEffect(() => {
    if (state.status !== 'done') return
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: state.textContent,
      timestamp: new Date().toLocaleTimeString(),
      trace: { ...state, status: 'done' },   // ← 整轮快照，零回写
    }])
    reset()
  }, [state.status])

  return (
    <MessageList
      messages={messages}
      streaming={state.status !== 'idle' ? state : undefined}
      simplify={{ verbosity: 'standard' }}
      renderMarkdown={renderMarkdown}
    />
  )
}
```

效果：
- **流式中**：blend 路径渲染 live `state`，工具与文本按到达顺序交错，最后一个工具展开（可确认）。
- **done 瞬间**：`streaming` 变 `undefined`，该轮以 `trace` 形式进入 `messages`，由**同一组件**以 `streaming={false}` 渲染——内容原地冻结，工具折叠为历史形态，**无任何消失或跳变**。

---

## 5. blend 模式渲染了哪些内容

`MessageList` 内部组件 `InterleavedStreamingContent`（不单独导出，通过 `MessageList` 使用）按 `StreamState.eventLog` 的到达顺序渲染：

- **文本**：连续的 `text` delta 合并为一段（保持叙述连贯，可经 `renderMarkdown` 渲染 Markdown），由工具/资源/产物卡片自然打断。
- **工具调用**：内联卡片（`CollapsibleToolTrace` + `ToolCallBlock`），已完成折叠、点击原地展开；当前工具展开，可显示 `ConfirmGate`。
- **资源读取**（`resource_read`）：内联 `ResourceReadBlock`。
- **产物**（`artifact`）：内联 `ArtifactPanel`，遵循 `hiddenArtifactLangs`。
- **轮次开头**：召回记忆 chips、`ThinkBlock`（推理）、Soul/Skill 徽章。

> 自定义 `renderLiveTrace` 仍然受支持；一旦提供，它会接管 live 区域的渲染（即不再走 blend）。若希望使用 blend，请勿传 `renderLiveTrace`。

---

## 6. 底层支撑：`eventLog` 与 `textChunks`

blend 依赖 `@meso.ai/types@2.1.0` 在 `StreamState` 上新增的两个字段（向后兼容，旧消费者无需改动）：

```ts
interface StreamState {
  // ...既有字段...

  /** 所有事件的严格到达顺序（timestamp/type/id/data）。 */
  eventLog: Array<{ timestamp: number; type: SSEEvent['type']; id: string; data: unknown }>

  /** 文本 delta 按到达顺序索引（id/delta/position）。 */
  textChunks: Array<{ id: string; delta: string; position: number }>
}
```

`applyEvent()` 在每次状态更新后把事件追加进 `eventLog`；`text` 事件同时记入 `textChunks`。渲染层据此重建"工具与文本交错"的时间线。`textContent` 仍保留（所有 delta 的拼接），向后兼容。

---

## 7. 从旧用法迁移

| 旧用法 | 新用法 |
|--------|--------|
| `renderLiveTrace={s => <ProcessTrace stream={s} simplify={{verbosity}} />}` | 删除 `renderLiveTrace`，改传 `simplify={{ verbosity }}` 给 `MessageList` |
| done 时 `setMessages([...].push({ content, artifacts }))` | done 时改存 `trace: { ...state, status: 'done' }` |
| 依赖旧的分段（工具在上、文本在下） | 默认即交错；如需旧版式传 `renderingMode="block"` |

无破坏性 API 变更：`renderingMode`、`simplify`、`Message.trace` 均为新增可选项；不传时即获得 blend 默认体验。

---

## 8. 相关文档

- [`25-linear-streaming-ui-pattern.md`](./25-linear-streaming-ui-pattern.md) — 线性追加原则（blend 的前身与理论基础）
- [`28-tool-execution-verbosity-levels.md`](./28-tool-execution-verbosity-levels.md) — `SimplifyOptions` 三档 verbosity 详解
- [`streaming-protocol.md`](./streaming-protocol.md) — SSE 协议与事件类型
