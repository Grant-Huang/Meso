# 流式对话设计

流式对话是 Meso 的交互主干。本文描述 SSE 协议、事件类型、前端渲染状态机，以及各类流式内容的处理策略。

---

## 一、为什么流式是核心

传统 AI 应用把"调用 LLM"和"展示结果"分开处理，等待 LLM 返回完整内容后再渲染。Meso 反其道而行：

- 用户发送后**立即**看到阶段进度（记忆召回 → 知识检索 → 生成）
- 工具调用实时可见，包括执行结果和风险等级
- MCP 资源读取以卡片形式展示 URI 和内容
- Think 过程实时可见，完成后自动折叠
- Artifact（代码/图表/HTML）边生成边渲染到右侧面板
- 记忆召回/写入在流式头部/尾部可视化展示

这意味着"等待"被消除了——用户始终看到系统在做什么。

---

## 二、SSE 事件协议

> **规范性文档**：完整协议定义（含 schema_version、字段类型、扩展事件机制、迁移指南）见
> [`docs/streaming-protocol.md`](./streaming-protocol.md)。
> 本节为概览，以规范文档为准。

所有流式事件格式：

```
data: {"type": "<event_type>", "schema_version": "1.0", "payload": {...}}\n\n
```

### 事件类型总览

| event_type | 触发时机 | 前端效果 |
|------------|----------|----------|
| `capabilities` | 流式开始时发送一次 | 填充可用工具/技能/资源列表 |
| `soul` | 流式开始时发送一次 | 显示头像 chip + 名字 + 特质标签 |
| `skill_active` | 技能切换时 | 显示技能徽章 + 提供方 + 焦点 |
| `stage` | 每个阶段开始/结束 | 更新 StageTimeline 进度条 |
| `memory` | 记忆召回后、生成前 | 渲染召回记忆 chip |
| `memory_saved` | 后端持久化记忆后 | 追加"已记忆"chip |
| `tool_call` | LLM 决定调用工具 | 渲染 ToolCallBlock（spinner + 风险徽章）|
| `tool_result` | 工具执行完成 | 更新 ToolCallBlock（结果/错误）|
| `resource_read` | 后端请求 MCP 资源 | 渲染 ResourceReadBlock（spinner）|
| `resource_content` | MCP 资源内容到达 | 更新 ResourceReadBlock（内容/错误）|
| `think` | Think block 流式输出 | 追加到 ThinkBlock |
| `text` | 正文逐字输出 | 追加到 ChatBubble |
| `artifact` | Artifact 内容增量 | 追加到 ArtifactPanel |
| `done` | 流正常结束 | 最终化状态，移除光标 |
| `error` | 任意阶段出错 | 显示错误状态 |
| `extension` | 自定义域事件 | 传递给 `renderExtension` 回调 |

### 典型事件序列（带 MCP）

```
→ capabilities  { tools: [{name:"web_search",provider:"mcp",server:"brave"}], ... }
→ soul          { id: "assistant-v2", name: "Aria", traits: ["严谨"] }
→ skill_active  { id: "research", name: "研究模式", provider: "mcp" }
→ stage         { name: "召回记忆", state: "active" }
→ stage         { name: "召回记忆", state: "done" }
→ memory        { snippets: [{ category: "preference", content: "偏好简洁回答" }] }
→ resource_read { id: "rr_001", uri: "file:///docs/api.md", server: "fs-server" }
→ resource_content { resource_read_id: "rr_001",
                     contents: [{ type: "text", text: "..." }], duration_ms: 18 }
→ tool_call     { id: "tc_001", name: "web_search",
                  args: { query: "..." }, risk: "safe",
                  provider: "mcp", server: "brave",
                  annotations: { open_world: true } }
→ tool_result   { tool_call_id: "tc_001", output: "...", duration_ms: 612 }
→ stage         { name: "生成回复", state: "active" }
→ think         { delta: "用户问的是...", done: false }
→ think         { delta: "", done: true }
→ text          { delta: "根据" }
→ text          { delta: "你的需求" }
→ artifact      { id: "a1", lang: "python", delta: "def hello():\n", done: false }
→ artifact      { id: "a1", lang: "python", delta: "    print('hi')\n", done: false }
→ artifact      { id: "a1", lang: "python", delta: "", done: true }
→ text          { delta: "以上代码实现了..." }
→ stage         { name: "生成回复", state: "done" }
→ memory_saved  { id: "mem_001", category: "fact", preview: "用户在学习 Python" }
→ done          {}
```

---

## 三、前端渲染状态机

`useSSEStream` 维护一个 `StreamState`，通过纯函数 `applyEvent` 驱动更新（无 side effects）：

```
IDLE
  │ 收到第一个事件
  ↓
STREAMING ──────────────────────────────────────────────────────┐
  │                                                             │
  ├─ capabilities → availableCapabilities 填充                  │
  ├─ soul         → activeSoul 设置                            │
  ├─ skill_active → activeSkill 设置                           │
  ├─ stage        → stages[] 追加/更新                         │
  ├─ memory       → memorySnippets 替换                        │
  ├─ memory_saved → memorySaved[] 追加                         │
  ├─ tool_call    → toolCalls[id] 创建（status: pending）       │
  ├─ tool_result  → toolCalls[id] 更新（status: done/error）    │
  ├─ resource_read    → resourceReads[id] 创建（pending）       │
  ├─ resource_content → resourceReads[id] 更新（done/error）    │
  ├─ think        → thinkContent 追加                          │
  ├─ text         → textContent 追加                           │
  ├─ artifact     → artifacts[id] 追加/更新                    │
  ├─ extension    → extensionLog[] + extensions[name][] 追加   │
  │                                                             │
  ├─ error 事件 ──────────────────────────────────→ ERROR      │
  └─ done 事件  ──────────────────────────────────→ DONE      │
                                                               │
DONE                                                           │
  │ 光标消失，操作栏淡入                                         │
  │ Stage 区域 1500ms 后折叠                                    │
  │ Think block 若仍展开则自动折叠                               │
                                                               │
ERROR                                                          │
  │ 光标消失，追加错误提示块                                     │
  │ 提供"重试"按钮                                              │
```

### StreamState 完整结构

```typescript
interface StreamState {
  status: 'idle' | 'streaming' | 'done' | 'error'

  // Session context (set at stream start)
  availableCapabilities: CapabilitiesPayload | null
  activeSoul: SoulPayload | null
  activeSkill: SkillPayload | null

  // Pipeline progress
  stages: StagePayload[]

  // Memory
  memorySnippets: MemorySnippet[]   // recalled memories (replaced on each memory event)
  memorySaved: MemorySavedPayload[] // write confirmations (accumulated)

  // Tool calls: Record<id, ToolCallState>
  toolCalls: Record<string, ToolCallState>
  toolCallOrder: string[]           // insertion order for rendering

  // MCP Resource reads: Record<id, ResourceReadState>
  resourceReads: Record<string, ResourceReadState>
  resourceReadOrder: string[]

  // Content
  thinkContent: string
  thinkDone: boolean
  textContent: string
  artifacts: Record<string, ArtifactState>
  artifactOrder: string[]

  // Extension events
  extensions: Record<string, ExtensionEvent[]>  // by name
  extensionLog: ExtensionEvent[]                // all in order

  errorMessage: string | null
}
```

---

## 四、各事件前端处理细节

### 4.1 `capabilities` 事件

收到后存入 `availableCapabilities`，供上层 App 渲染技能选择器、工具开关等。
平台 UI 不消费此数据——它是给 App 层的元信息。

### 4.2 `soul` / `skill_active` 事件

`soul` → `activeSoul`（整个会话内稳定，渲染头像 chip）
`skill_active` → `activeSkill`（可切换，渲染技能徽章）

两者显示在 `MessageList` 的 `context-row` 中：
```
[Aria头像] Aria  [🎯 代码审查] 安全漏洞 · 性能
```

### 4.3 `stage` 事件

Stage 组件维护有序列表，按事件到达顺序追加，同名事件更新：

- `active`：旋转动画点 + accent 色文字
- `done`：实心绿点 + 次要色文字
- `error`：红点 + error 色文字

`done` 主事件触发后 1500ms，整个 Stage 区域以 `max-height` 动画折叠。

### 4.4 `memory` / `memory_saved` 事件

`memory` → 在 Stage 区域下方展示一行召回 chips（hover 展开完整内容）
`memory_saved` → 在回复尾部展示"已记忆"chip，含书签图标和类别

### 4.5 `tool_call` / `tool_result` 事件

每个 `tool_call.id` 对应一个 `ToolCallBlock`：
- `pending` / `running`：spinner
- `awaiting_confirm`：warn 图标 + 确认门（需用户点击才继续）
- `done`：green check + 可展开结果
- `error`：red X + 可展开错误信息

风险等级控制 UI：
- `safe` → 仅 spinner，自动执行
- `write` → 黄色"写入"徽章，自动执行
- `destructive` → 红色"危险"徽章 + 确认门

### 4.6 `resource_read` / `resource_content` 事件

每个 `resource_read.id` 对应一个 `ResourceReadBlock`：
- `pending`：spinner + URI 显示
- `done`：green check + duration + 可展开内容（text/image/blob）
- `error`：red X + 错误信息

### 4.7 `think` 事件

Think block 容器默认**展开**，流式追加内容（`done: false`）。
收到 `done: true` 后，执行：

1. 内容不变
2. 标题从"思考中…" → "已思考（点击展开）"
3. `max-height` 折叠动画 `300ms ease`

用户点击可随时展开/折叠，状态不重置。

### 4.8 `text` 事件

直接追加到消息内容字符串，React 状态更新触发 Markdown 重新渲染。
末尾追加光标字符 `▋`，CSS：

```css
.streaming-cursor {
  display: inline-block;
  color: var(--color-accent);
  animation: blink 0.6s ease-in-out infinite alternate;
}
@keyframes blink { from { opacity: 1 } to { opacity: 0.2 } }
```

### 4.9 `artifact` 事件

每个 `artifact.id` 对应一个 Tab：
- 新 id → 创建新 Tab，若面板不可见则触发分屏动画
- 已有 id → 追加 delta 到对应 Tab 内容
- `done: true` → 触发最终高亮渲染；若 `lang` 为 `html preview` 则载入 iframe；若为 `mermaid` 则触发图表渲染

---

## 五、useSSEStream Hook

```typescript
const { state, start, stop } = useSSEStream(url, callbacks?)
```

`callbacks` 是一个可选对象，各字段均为可选回调：

```typescript
interface StreamCallbacks {
  onCapabilities?: (capabilities: CapabilitiesPayload) => void
  onStageChange?: (stage: StagePayload) => void
  onMemoryRecalled?: (snippets: MemorySnippet[]) => void
  onMemorySaved?: (saved: MemorySavedPayload) => void
  onSoulActivated?: (soul: SoulPayload) => void
  onSkillActivated?: (skill: SkillPayload) => void
  onToolCall?: (call: ToolCallPayload) => void
  onToolResult?: (result: ToolResultPayload) => void
  onResourceRead?: (read: ResourceReadPayload) => void
  onResourceContent?: (content: ResourceContentPayload) => void
  onArtifact?: (artifact: ArtifactState) => void
  onError?: (message: string, code?: string) => void
  onDone?: (finalState: StreamState) => void
}
```

回调对象通过 ref 存储——可以传入内联对象而无需 `useCallback` 包裹。

---

## 六、后端流式生成（参考实现，非规范）

> ⚠️ **Non-normative / Demo only**
> 以下后端结构为参考实现，不属于 `@meso/ui` 平台契约。
> 第三方可使用任意后端技术栈，只需遵守 `docs/streaming-protocol.md` 定义的 SSE 协议。

核心实现在 `backend/core/streaming.py`，提供：

```python
async def stream_response(
    messages: list,
    manifest: AppManifest,
    memory_snippets: list,
    knowledge_snippets: list,
) -> AsyncGenerator[dict, None]:
    """
    生成 SSE 事件序列。
    解析 LLM 输出中的 think block、artifact fence，
    路由到对应事件类型。
    """
```

Artifact fence 约定：

```
```html preview      → {"type": "artifact", "lang": "html preview"}
```mermaid           → {"type": "artifact", "lang": "mermaid"}
```artifact:table    → {"type": "artifact", "lang": "table"}
```python            → {"type": "artifact", "lang": "python"}（仅当满足 heuristic 时）
```

Think block 约定：`<think>...</think>` 或模型原生 thinking token（Claude extended thinking）。
