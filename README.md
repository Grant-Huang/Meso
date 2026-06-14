<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/stream/banner-dark.svg">
  <img src="brand/stream/banner.svg" alt="Meso — Streaming LLM UI Platform" width="100%">
</picture>

<br/>

**Meso** 是面向流式 LLM 交互的前端平台层。后端按协议发 SSE 事件流，前端开箱即用。

[![npm @meso.ai/ui](https://img.shields.io/npm/v/@meso.ai/ui?label=%40meso.ai%2Fui&color=0070f3)](https://www.npmjs.com/package/@meso.ai/ui)
[![npm @meso.ai/types](https://img.shields.io/npm/v/@meso.ai/types?label=%40meso.ai%2Ftypes&color=6366f1)](https://www.npmjs.com/package/@meso.ai/types)

---

## 安装

```bash
npm install @meso.ai/ui @meso.ai/types
# 或
pnpm add @meso.ai/ui @meso.ai/types
```

peer：`react >= 18.0.0`、`react-dom >= 18.0.0`

---

## 快速接入（5 分钟）

```tsx
// main.tsx — 入口引入样式（必须）
import '@meso.ai/ui/tokens.css'
import '@meso.ai/ui/style.css'
```

```tsx
// ChatPage.tsx
import { ThreeColumnLayout, MessageList, useSSEStream } from '@meso.ai/ui'
import { useState, useEffect } from 'react'

export function App() {
  const { state, start, abort, reset } = useSSEStream('https://your-backend/stream')
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')

  // 流结束后追加到历史
  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', content: state.textContent,
      }])
      reset()
    }
  }, [state.status])

  const send = () => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: input }])
    start({ method: 'POST', body: { message: input } })
    setInput('')
  }

  return (
    <ThreeColumnLayout appName="My App" navItems={[...]}>
      <MessageList
        messages={messages}
        streaming={state.status !== 'idle' ? state : undefined}
      />
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={send}  disabled={state.status === 'streaming'}>发送</button>
      <button onClick={abort} disabled={state.status !== 'streaming'}>停止</button>
    </ThreeColumnLayout>
  )
}
```

后端只需按 [SSE 协议规范](docs/streaming-protocol.md) 发送事件流，无需部署平台代码。  
完整步骤见 [接入指南](docs/integration-guide.md)。

---

## 平台边界

| 层 | 包 | 职责 |
|----|-----|------|
| 协议 | `@meso.ai/types` | SSE 事件形状、`applyEvent` 状态机 |
| UI | `@meso.ai/ui` | 组件、`useSSEStream`、设计 token |
| 会话 | `@meso.ai/client` | session/turn 管理、持久化 adapter、tool 确认回传 |

| Meso 提供 | 应用侧负责 |
|-----------|-----------|
| SSE 协议解析与状态机 | 业务后端 / API 服务 |
| `ProcessTrace` / `MessageList` 多 tool UI | 用户鉴权 |
| `useSSEStream`（watchdog、合批、可选重连） | Tools 执行引擎 |
| `@meso.ai/client` session 骨架 | 知识库检索 / 记忆存储后端 |

完整端到端 recipe 见 [docs/help/end-to-end-recipe.md](docs/help/end-to-end-recipe.md)。

---

## 推荐接入路径

| 场景 | 推荐方式 |
|------|----------|
| React 应用 | `useSSEStream` hook — 封装 fetch、解析、状态机，开箱即用 |
| 自定义 transport（WebSocket、轮询等） | `parseSSELine` + `applyEvent` — 只对接数据来源 |
| 非 React 环境 | `import '@meso.ai/ui/runtime'` 或 `@meso.ai/types` — 零 React 依赖 |

---

## 版本兼容性检查（推荐）

```tsx
import { isCompatibleVersion, assertCompatibleVersion } from '@meso.ai/ui'

// 宽松：schema_version 不兼容时静默跳过
if (!isCompatibleVersion(event)) return

// 严格：不兼容时抛出，适合开发 / 测试环境
assertCompatibleVersion(event)  // throws: "Meso protocol version mismatch: ..."
```

---

## 包结构

| 导入路径 | 内容 | React |
|----------|------|-------|
| `@meso.ai/ui` | 全部组件 + Hook | ✅ |
| `@meso.ai/ui/runtime` | `parseSSELine` / `applyEvent` / `createInitialStreamState` | ❌ |
| `@meso.ai/ui/tokens.css` | CSS 变量，亮/暗双主题 | — |
| `@meso.ai/ui/style.css` | 所有组件样式 | — |
| `@meso.ai/types` | 完整协议类型定义（TypeScript） | ❌ |
| `@meso.ai/client` | session、transport、tool 确认、replay | ❌ |

---

## 组件一览

| 组件 | 用途 | 驱动事件 |
|------|------|----------|
| `ThreeColumnLayout` | 三栏应用壳（侧栏 / 会话列 / 主区 + 分屏） | — |
| `MessageList` | 多轮对话渲染，合并历史 + 流式状态 | 所有事件 |
| `ChatBubble` | 用户 / 助手气泡，支持 Markdown | `text` |
| `ThinkBlock` | 可折叠推理过程块 | `think` |
| `StageTimeline` | 流水线阶段进度指示器 | `phase` |
| `ArtifactPanel` | 代码 / HTML / Mermaid / Markdown / 表格面板 | `artifact` |
| `WorkflowTimeline` | 工作流节点进度（含并行分支） | `workflow_node` |
| `ToolCallBlock` | 工具调用状态（含确认门控） | `tool_call`, `tool_result` |
| `ResourceReadBlock` | MCP 资源读取卡片 | `resource_read`, `resource_content` |
| `SoulIndicator` | 角色人格芯片（头像 + 特质标签） | `soul` |
| `SkillIndicator` | 技能徽章（专注方向） | `skill_active` |
| `ConfirmGate` | 危险操作确认对话框 | — |
| `StreamingCursor` | 流式光标动画 | — |
| `useSSEStream` | SSE 客户端 Hook（POST / AbortController） | — |
| `useTheme` | 亮暗主题切换（`data-theme` + localStorage） | — |

---

## SSE 协议速览

```
data: {"type":"<event_type>","schema_version":"1.0","payload":{…}}\n\n
```

**标准事件（17 种）**：`capabilities` · `soul` · `skill_active` · `phase` · `memory` · `memory_saved` · `think` · `text` · `artifact` · `tool_call` · `tool_status` · `tool_result` · `resource_read` · `resource_content` · `workflow_node` · `done` · `error`

**扩展事件**（第三方业务事件，不改平台代码）：

```json
{"type":"extension","schema_version":"1.0","payload":{"name":"citation","data":{"source":"paper-42","title":"…"}}}
```

完整规范：[`docs/streaming-protocol.md`](docs/streaming-protocol.md)

---

## 主题 token

```css
/* 公开稳定 token（SemVer 保护） */
--color-bg / --color-bg-elevated / --color-bg-white / --color-bg-sidebar
--color-text / --color-text-secondary / --color-text-muted
--color-accent / --color-accent-dark
--color-border / --color-border-light
--color-error / --color-warning / --color-success / --color-info
--color-code-bg / --color-code-text
--sidebar-w / --sidebar-w-collapsed / --session-col-w
```

FOUC 防护（放在 `<head>` 内、`tokens.css` 之前）：

```html
<script>
(function(){
  var t = localStorage.getItem('meso-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
</script>
```

---

## 文档

| 文档 | 内容 |
|------|------|
| [接入指南](docs/integration-guide.md) | 从安装到首轮流式对话，含框架集成、验收清单 |
| [消费指南](docs/consuming.md) | npm / tarball / file: 安装方式对比、故障排查 |
| [SSE 协议规范](docs/streaming-protocol.md) | 事件信封、16 种事件类型、扩展机制 |
| [架构总览](docs/architecture.md) | 系统分层、组件树、能力模型 |
| [流式设计](docs/streaming-design.md) | 状态机与前端处理细节 |
| [扩展事件指南](docs/extension-guide.md) | 第三方自定义事件接入方式 |
| [UI 规范](docs/ui-spec.md) | 布局、配色、字体、动画 |
| [应用插件系统](docs/app-plugin-system.md) | App Manifest、Tools、Knowledge |
| [CHANGELOG](CHANGELOG.md) | Breaking Changes 对照表 |

---

## Monorepo 外（file: 路径）消费

```bash
pnpm --filter @meso.ai/types run build
pnpm --filter @meso.ai/ui run build
```

```json
{
  "dependencies": {
    "@meso.ai/types": "file:../meso/packages/meso-types",
    "@meso.ai/ui":    "file:../meso/packages/meso-ui"
  }
}
```

详见 [消费指南](docs/consuming.md)。

---

## 版本管理

遵循 [SemVer](https://semver.org/)：Patch = bug fix · Minor = 新功能（向后兼容）· Major = Breaking Changes。  
协议层变更须先更新 `docs/streaming-protocol.md` 和契约测试 fixture，再发布 `@meso.ai/ui`。
