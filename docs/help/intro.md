# Meso — 流式 LLM 对话平台

Meso 不是一个普通的 UI 组件库。它是一个**以流式协议为核心的 LLM 对话平台层**，由三个同心圆构成：

```
┌─────────────────────────────────────────────────────────────────┐
│  潜在应用层                                                       │
│  工业 / 专业场景 · 多 App 切换 · 行业定制                          │
├─────────────────────────────────────────────────────────────────┤
│  平台扩展层                                                       │
│  记忆系统设计 · 应用插件 Manifest · 第三方扩展事件                  │
├─────────────────────────────────────────────────────────────────┤
│  核心平台（已实现，稳定可用）                                        │
│  SSE 协议 v1.0  ·  @meso.ai/ui 组件  ·  @meso.ai/types 运行时          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心平台（已实现）

这是 `@meso.ai/ui` 和 `@meso.ai/types` 两个包所覆盖的内容，是当前可生产使用的部分：

### SSE 事件协议 v1.0

平台与后端之间的唯一契约。所有通信走一条 SSE 流，8 种标准事件类型：

| 事件 | 作用 |
|------|------|
| `stage` | 流水线阶段进度（"召回记忆" active → done）|
| `memory` | 本轮召回了哪些记忆片段 |
| `think` | LLM 推理过程（增量，可折叠）|
| `text` | 正文生成（增量，逐字流入）|
| `artifact` | 代码/HTML/图表（增量，多 Artifact 支持）|
| `done` | 流正常结束 |
| `error` | 错误终止 |
| `extension` | 第三方业务扩展事件（无需修改平台）|

协议使用版本化信封 `{"type":"…","schema_version":"1.0","payload":{…}}`，Breaking 变更通过 major 版本管理。

### @meso.ai/ui — React 组件库

```tsx
import {
  ThreeColumnLayout,  // 三栏应用壳
  MessageList,        // 多轮对话渲染（历史 + 流式）
  ChatBubble,         // 消息气泡（Markdown，流式光标）
  ThinkBlock,         // 可折叠推理块
  StageTimeline,      // 流水线进度条
  ArtifactPanel,      // 代码/HTML/Mermaid 面板
  StreamingCursor,    // 流式光标（独立）
  useSSEStream,       // SSE 客户端 Hook
  useTheme,           // 亮/暗主题切换
} from '@meso.ai/ui'
```

### @meso.ai/types — 零依赖运行时

```typescript
import {
  parseSSELine,             // 解析单行 SSE 文本 → SSEEvent | null
  applyEvent,               // 纯函数状态机：(state, event) → newState
  createInitialStreamState, // 初始 StreamState 工厂
  PROTOCOL_VERSION,         // "1.0"
} from '@meso.ai/types'
```

可在 Node.js、边缘函数、测试环境中使用——无 React，零浏览器依赖。用于后端 SSE 输出合规验证。

---

## 平台扩展层（设计规范，待实现）

这一层描述平台的**扩展点设计**——前端集成接口已定义，后端实现由第三方完成：

### 记忆系统

平台定义了 `memory` SSE 事件和 Memory Chips UI（已实现）。后端如何存储、召回记忆由第三方自行实现。平台不假设任何存储方案：

```
后端实现（任意方案）        平台提供
     ↓                       ↓
召回记忆片段     →  memory 事件  →  Memory Chips UI 显示
```

设计建议见 [记忆系统](#memory)。

### 应用插件 / Manifest

平台定义了 App Manifest 格式——通过 JSON 文件描述一个"应用"的提示词、工具集、知识库、UI 配置（已有规范文档，前端加载逻辑待实现）：

```json
{
  "id": "doc-review",
  "name": "文档审查",
  "skill": { "system_prompt": "…" },
  "tools": ["search_knowledge"],
  "ui": { "composer_placeholder": "上传文档或输入审查要求…" }
}
```

应用切换、工具调用进度等通过**扩展事件**机制传递到前端（已实现）。详见 [应用插件](#plugin)。

---

## 潜在应用层

平台为工业、专业级场景提供基础能力。[工业愿景白皮书](industrial-vision.html)描述了六个探索方向：

| 章节 | 主题 |
|------|------|
| 01. 新范式的诞生 | 为什么对话式 LLM 需要专门的 UI 平台层 |
| 02. 工业场景的呼唤 | 制造、运维、质检等场景的具体挑战 |
| 03. 对话另一端的角色 | AI 在工业流程中扮演的角色定位 |
| 04. 触发边界与协作节点 | 人机协作的触发时机与边界设计 |
| 05. 入口形态与部署边界 | 端侧、私有云、混合部署的取舍 |
| 06. 基于 Meso 的实现路径 | 在具体场景中落地的方法论 |

---

## 平台边界（明确不做的事）

| 不包含 | 说明 |
|--------|------|
| 业务后端 / API 服务 | 第三方自行实现；平台只约定 SSE 协议 |
| 用户鉴权与会话持久化 | 第三方负责 |
| Tools 执行引擎 | 声明工具 ID，执行在业务后端 |
| 知识库检索 / 向量索引 | 业务能力，不在平台包内 |
| 记忆存储后端 | 平台提供 UI 展示 + 事件接口，存储方案由第三方选型 |
| Composer 组件 | 输入区因业务差异大，应用自行实现；平台提供 CSS token |
| 计费 / 用户体系 | 业务层责任 |

---

## 架构总览

```
你的 React 应用
  │
  ├── ThreeColumnLayout     (三栏壳，槽位)
  ├── MessageList           (多轮渲染，历史 + 流式)
  │     ├── StageTimeline   (阶段进度)
  │     ├── Memory Chips    (记忆召回展示)
  │     ├── ThinkBlock      (推理折叠块)
  │     ├── ChatBubble      (消息气泡)
  │     └── ArtifactPanel   (代码/HTML/图表)
  ├── useSSEStream          (SSE 客户端 Hook)
  └── useTheme              (亮/暗主题)
         │
         │ fetch + ReadableStream
         │ SSE 协议 v1.0
         ↓
  你的后端 API
  │
  ├── LLM 调用（任意模型）
  ├── 记忆召回（任意实现）
  ├── 工具执行（任意实现）
  └── 扩展事件（citation、entity_reference…）
```

---

## 快速自测清单

接入完成后，确认以下行为均正常：

- [ ] 发送消息后**立即**出现阶段进度（`ProcessTrace` / `StageTimeline`）
- [ ] ThinkBlock 在推理时展开，收到 `done:true` 后 1.5s 自动折叠
- [ ] 正文逐字流入，末尾显示闪烁光标 ▋
- [ ] Artifact 面板在首个 artifact 事件到达时弹出
- [ ] 收到 `done` 事件后光标消失，可再次发送
- [ ] 明/暗主题切换无 FOUC 闪烁
- [ ] 扩展事件通过 `renderExtension` 渲染，无需改平台代码
