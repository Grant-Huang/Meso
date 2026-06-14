# AI 应用开发概览

基于 Meso 构建 AI 应用时，Meso 提供前端 UI 层，你负责后端 AI 能力。两者通过 **SSE 协议 v1.0** 连接——这是唯一的平台契约。

---

## 技术栈全貌

```
         你的后端（任意语言：FastAPI / Node.js / Go / ...）
         ├── LLM Provider（OpenAI 兼容 / Anthropic / 本地模型）
         ├── 记忆存储（短期会话 + 长期知识库）
         ├── 知识检索（RAG：向量库 + embedding）
         └── 工具执行器（Function Calling）
                      ↕  SSE 协议 v1.0（唯一接口契约）
         你的前端
         ├── @meso.ai/ui — ThreeColumnLayout / MessageList / ArtifactPanel
         ├── useSSEStream Hook — 连接后端 SSE 流
         └── @meso.ai/types — 协议解析 + 纯状态机（无 React 依赖）
```

---

## 一次对话的完整生命周期

```
POST /api/chat  { message, session_id, app_id }
    │
    ├─ 1. 加载 App Manifest   确定系统提示 / 工具集 / 知识库
    ├─ 2. 召回记忆            → phase(id:"recall", running/done)
    │                         → memory({ snippets: [...] })
    ├─ 3. 检索知识            → phase(id:"search", running/done)
    ├─ 4. 构建 Prompt         注入记忆片段 + 知识片段 + 工具描述
    ├─ 5. 调用 LLM（流式）    → think / text / artifact 事件
    ├─ 6. 执行 Tools（如有）  → tool_call + tool_status + tool_result
    └─ 7. 完成               → phase(id:"generate", done) + done({})
```

---

## 平台提供 vs 你来实现

| 能力 | 平台提供 | 你来实现 |
|------|---------|---------|
| 流式渲染 UI | @meso.ai/ui 全部组件 | — |
| SSE 协议解析 | @meso.ai/types runtime | — |
| 布局 + 主题 | ThreeColumnLayout + CSS token | — |
| LLM 调用 | — | 对接 OpenAI 兼容 API |
| 记忆存储与召回 | — | 存储方案 + 检索逻辑 |
| 知识库检索（RAG） | — | 向量库 + embedding |
| 工具执行 | — | Function Calling 实现 |
| 用户鉴权 | — | JWT / OAuth / Session |
| 会话持久化 | — | 数据库 CRUD |

---

## AI 能力 → SSE 事件对应

所有 AI 能力都通过 SSE 事件流暴露给前端：

| AI 能力 | 使用的事件 | 前端渲染结果 |
|---------|-----------|------------|
| 推理/思考过程 | `think` | ThinkBlock（完成后自动折叠） |
| 处理阶段进度 | `phase` | ProcessTrace / StageTimeline |
| 记忆召回结果 | `memory` | Memory 芯片 |
| 工具调用进度 | `tool_call` + `tool_status` + `tool_result` | ToolCallBlock |
| 生成正文 | `text` | ChatBubble + 流式光标 |
| 代码/图表/HTML | `artifact` | ArtifactPanel（分屏） |
| 错误 | `error` | 错误提示 |

---

## 推荐开发步骤

1. **最小后端**：只发 `text` + `done`，确认前端渲染正常
2. **加入阶段进度**：在各步骤前后发 `phase`，让用户感知"AI 在干什么"
3. **推理展示**：LLM 输出思考过程，通过 `think` 事件推送
4. **Artifact 输出**：代码/图表路由到 `artifact` 事件
5. **接入记忆**：召回后先发 `memory` 事件，再开始生成
6. **添加 Tools**：通过 `tool_call` / `tool_status` / `tool_result` 传递工具状态
7. **多应用模式**：配置 App Manifest，不同场景用不同系统提示和工具集

---

## 用 @meso.ai/types 验证后端（不启动前端）

```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/types'

const lines = yourSseOutput.split('\n')
const state = lines.reduce((s, line) => {
  const event = parseSSELine(line)
  return event ? applyEvent(s, event) : s
}, createInitialStreamState())

console.log(state.status)       // 'done'
console.log(state.textContent)  // LLM 生成的正文
```

用平台提供的契约 fixture 文件（`packages/meso-types/src/__fixtures__/`）可以跑完整协议回归测试。
