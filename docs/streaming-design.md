# 流式对话设计

流式对话是 Meso 的交互主干。本文描述 SSE 协议、事件类型、前端渲染状态机，以及各类流式内容的处理策略。

---

## 一、为什么流式是核心

传统 AI 应用把"调用 LLM"和"展示结果"分开处理，等待 LLM 返回完整内容后再渲染。Meso 反其道而行：

- 用户发送后**立即**看到阶段进度（记忆召回 → 知识检索 → 生成）
- Think 过程实时可见，完成后自动折叠
- Artifact（代码/图表/HTML）边生成边渲染到右侧面板
- 记忆召回结果在流式头部作为 `memory` 事件可视化展示

这意味着"等待"被消除了——用户始终看到系统在做什么。

---

## 二、SSE 事件协议

所有流式事件格式：

```
data: {"type": "<event_type>", "payload": {...}}\n\n
```

### 事件类型总览

| event_type | payload | 触发时机 |
|------------|---------|----------|
| `stage`    | `{"name": "...", "state": "active\|done\|error"}` | 每个阶段开始/结束 |
| `memory`   | `{"snippets": [{"category": "...", "content": "..."}]}` | 记忆召回完成后，生成前 |
| `think`    | `{"delta": "...", "done": bool}` | Think block 流式输出 |
| `text`     | `{"delta": "..."}` | 正文逐字输出 |
| `artifact` | `{"id": "...", "lang": "...", "delta": "...", "done": bool}` | Artifact 内容增量 |
| `error`    | `{"message": "...", "code": "..."}` | 任意阶段出错 |
| `done`     | `{}` | 流结束 |

### 典型事件序列

```
→ stage   {"name": "召回记忆",  "state": "active"}
→ stage   {"name": "召回记忆",  "state": "done"}
→ memory  {"snippets": [...]}
→ stage   {"name": "检索知识",  "state": "active"}
→ stage   {"name": "检索知识",  "state": "done"}
→ stage   {"name": "生成回复",  "state": "active"}
→ think   {"delta": "用户问的是...", "done": false}
→ think   {"delta": "所以我应该...", "done": false}
→ think   {"delta": "", "done": true}
→ text    {"delta": "根据"}
→ text    {"delta": "你的"}
→ text    {"delta": "需求"}
→ artifact{"id": "a1", "lang": "python", "delta": "def hello():\n", "done": false}
→ artifact{"id": "a1", "lang": "python", "delta": "    print('hi')\n", "done": false}
→ artifact{"id": "a1", "lang": "python", "delta": "", "done": true}
→ text    {"delta": "以上代码实现了..."}
→ stage   {"name": "生成回复",  "state": "done"}
→ done    {}
```

---

## 三、前端渲染状态机

每个 `AssistantBubble` 有一个独立的流式状态机：

```
IDLE
  │ 收到第一个事件
  ↓
STREAMING ──────────────────────────────────┐
  │                                         │
  ├─ text 事件     → 追加文字 + 光标闪烁     │
  ├─ think 事件    → Think block 更新        │
  ├─ artifact 事件 → ArtifactPane 更新       │
  ├─ stage 事件    → StageBar 更新           │
  ├─ memory 事件   → MemoryChips 展示        │
  │                                         │
  ├─ error 事件 ───────────────────→ ERROR   │
  │                                         │
  └─ done 事件  ───────────────────→ DONE   │
                                            │
DONE                                        │
  │ 光标消失，操作栏淡入                     │
  │ Stage 区域 1500ms 后折叠                 │
  │ Think block 若仍展开则自动折叠            │

ERROR
  │ 光标消失，追加错误提示块
  │ 提供"重试"按钮
```

---

## 四、各事件前端处理细节

### 4.1 `stage` 事件

Stage 组件维护一个有序列表，按事件到达顺序追加：

```typescript
type StageItem = {
  name: string
  state: 'active' | 'done' | 'error'
}
```

- `active`：旋转动画点（CSS animation）+ accent 色文字
- `done`：实心绿点 + 次要色文字 + 时间戳
- `error`：红点 + error 色文字

`done` 主事件触发后 1500ms，整个 Stage 区域以 `max-height` 动画折叠。

### 4.2 `memory` 事件

在 Stage 区域下方展示一行记忆 chips，样式参考 `--tag-info`：

```
[用户偏好] 偏好简洁回答    [项目背景] PostgreSQL 15    [上次讨论] 索引优化
```

hover 时展开完整内容。随 Stage 区域一同折叠。

### 4.3 `think` 事件

Think block 容器默认**展开**，流式追加内容（`done: false`）。
收到 `done: true` 后，执行：

1. 内容不变
2. 标题从"思考中…" → "已思考（点击展开）"
3. `max-height` 折叠动画 `300ms ease`

用户点击可随时展开/折叠，状态不重置。

### 4.4 `text` 事件

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

### 4.5 `artifact` 事件

每个 `artifact.id` 对应一个 Tab：
- 新 id → 创建新 Tab，若面板不可见则触发分屏动画
- 已有 id → 追加 delta 到对应 Tab 内容
- `done: true` → 触发最终高亮渲染；若 `lang` 为 `html preview` 则载入 iframe；若为 `mermaid` 则触发图表渲染

---

## 五、后端流式生成

参见 `architecture.md` §3.3 流式对话数据流 和 §4 SSE 事件协议。

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
