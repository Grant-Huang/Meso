# @meso/ui — 流式 LLM 对话 UI 平台

Meso 是一个**流式 LLM 交互的前端平台层**，提供：

- **SSE 事件协议**（版本化、可机器验证）
- **可发布 React 组件库** `@meso/ui`（ESM + CJS + TypeScript 声明）
- **无 React 依赖的运行时** `@meso/ui/runtime`（状态机 / 解析器）
- **设计规范**（布局、设计 token、主题）

第三方应用负责：后端实现、鉴权、会话持久化、Tools/知识库/记忆等业务逻辑。  
平台负责：**协议稳定、UI 可替换、扩展机制清晰**。

---

## 平台不包含（明确边界）

| 不包含 | 说明 |
|--------|------|
| 业务后端 / API 服务 | 第三方自行实现；平台只约定 SSE 协议 |
| 用户鉴权与会话持久化 | 第三方负责 |
| Tools 执行引擎 | Manifest 声明名称，执行逻辑在业务后端 |
| 知识库检索 / 记忆存储 | 业务能力，不在平台包内 |
| 特定行业页面或业务组件 | 按需在应用侧开发 |
| 生产级数据库 / 缓存方案 | 第三方自选 |
| 计费 / 用户体系 | 业务层责任 |

参考实现（`docs/architecture.md` §3 起）仅为 demo，非平台契约。

---

## 快速接入（1–2 天跑通首轮流式对话）

```bash
npm install @meso/ui
```

```tsx
// 1. 引入设计 token（放在应用入口）
import '@meso/ui/tokens.css'

// 2. FOUC 防护（放在 <head> 最前，tokens.css 之前）
// <script>(function(){var t=localStorage.getItem('meso-theme')||'light';
//   document.documentElement.setAttribute('data-theme',t);})()</script>

// 3. 布局 + 流式对话
import {
  ThreeColumnLayout,
  MessageList,
  useSSEStream,
  useTheme,
} from '@meso/ui'

export function App() {
  const { state, start, abort } = useSSEStream('https://your-backend/stream')
  const { theme, toggle } = useTheme()

  return (
    <ThreeColumnLayout
      appName="My App"
      navItems={[{ id: 'chat', icon: <ChatIcon />, label: '对话', onClick: () => {} }]}
    >
      <MessageList
        messages={completedMessages}
        streaming={state}
        emptyState={<p>发送消息开始对话</p>}
        // 渲染第三方扩展事件（工具进度、确认门禁等）
        renderExtension={(event) => {
          if (event.payload.name === 'tool_progress') {
            return <ToolProgressCard data={event.payload.data} />
          }
        }}
      />
      <button onClick={() => start({ method: 'POST', body: { message: input } })}>
        发送
      </button>
      <button onClick={abort}>停止</button>
    </ThreeColumnLayout>
  )
}
```

后端只需按 [SSE 协议规范](docs/streaming-protocol.md) 发送事件流，无需部署平台代码。

---

## Monorepo 外消费（file: 路径引用）

stock-fe、独立项目等不在 Meso workspace 内的消费方，需要以下步骤：

### 1. 构建顺序（必须先 types 再 ui）

```bash
# 在 Meso 根目录执行
pnpm --filter @meso/types run build
pnpm --filter @meso/ui run build
```

dist/ 目录必须存在，`file:` 引用直接读取编译产物。

### 2. 消费方 package.json

`@meso/ui` 将 `@meso/types` 声明为 `peerDependency`，消费方需同时引用两个包：

```json
{
  "dependencies": {
    "@meso/types": "file:../meso/packages/meso-types",
    "@meso/ui":    "file:../meso/packages/meso-ui",
    "react":       "^18.0.0",
    "react-dom":   "^18.0.0"
  }
}
```

一次 `npm install` 或 `pnpm install` 即可，无需任何 patch 脚本。

### 3. 版本更新后

每次拉取新版 Meso 后，重新执行第 1 步的 build 命令，dist/ 刷新即生效。

---

## 包结构

| 导入路径 | 内容 | React 依赖 |
|----------|------|-----------|
| `@meso/ui` | 全部组件 + Hook + 运行时类型 | ✅ 需要 |
| `@meso/ui/runtime` | `parseSSELine` / `applyEvent` / `createInitialStreamState` + 全部类型 | ❌ 无需 |
| `@meso/ui/tokens.css` | 设计 token（CSS 变量，亮/暗双主题） | — |

`@meso/ui/runtime` 可在 Node.js、边缘函数、测试环境中使用，用于验证后端发送的事件是否符合协议。

---

## 组件一览

| 组件 | 用途 |
|------|------|
| `ThreeColumnLayout` | 三栏应用壳（侧栏 / 会话列 / 主区），仅提供槽位 |
| `MessageList` | 多轮对话渲染，合并历史消息与流式状态；含 `renderExtension` 插槽 |
| `ChatBubble` | 用户 / 助手消息气泡，支持 Markdown |
| `ThinkBlock` | 可折叠推理过程块 |
| `StageTimeline` | 流水线阶段进度指示器 |
| `ArtifactPanel` | 代码 / HTML 预览 / Mermaid 图表渲染面板 |
| `StreamingCursor` | 流式光标动画 |
| `useSSEStream` | SSE 客户端 Hook（POST / 自定义 header / AbortController） |
| `useTheme` | 亮暗主题切换（`data-theme` + `localStorage`） |

---

## SSE 协议

规范文档：[`docs/streaming-protocol.md`](docs/streaming-protocol.md)（单一事实来源）

协议版本：`1.0`，事件信封：

```
data: {"type":"<event_type>","schema_version":"1.0","payload":{…}}\n\n
```

**标准事件**：`stage` / `memory` / `think` / `text` / `artifact` / `done` / `error`

**扩展事件**（第三方业务事件，无需改平台代码）：

```json
{"type":"extension","schema_version":"1.0","payload":{"name":"tool_progress","data":{…}}}
```

---

## 主题系统

设计 token 全部来自 `@meso/ui/tokens.css` 中的 CSS 变量。

**公开稳定 token**（纳入 SemVer，Breaking 须 major bump）：

```css
--color-bg / --color-bg-elevated / --color-bg-white / --color-bg-sidebar
--color-text / --color-text-secondary / --color-text-muted
--color-accent / --color-accent-dark
--color-border / --color-border-light
--color-error / --color-warning / --color-success / --color-info
--color-code-bg / --color-code-text
--sidebar-w / --sidebar-w-collapsed / --session-col-w
```

主题切换：`data-theme="dark"` 属性挂在 `<html>` 上，`localStorage` 键名 `meso-theme`。

FOUC 防护脚本（放在 `<head>` 内 `tokens.css` 加载之前）：

```html
<script>
(function(){
  var t = localStorage.getItem('meso-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
</script>
```

---

## CSS 类名稳定性

平台 CSS 使用 `meso-` 前缀，分为两类：

| 类型 | 范例 | 保证 |
|------|------|------|
| **公开稳定**（可在应用 CSS 中引用） | `.meso-layout` `.meso-bubble` `.meso-artifact` `.meso-stages` `.meso-think-block` | 纳入 SemVer，变更须 CHANGELOG |
| **内部实现**（不保证跨版本稳定） | `.meso-layout__sidebar-toggle-icon` `.meso-artifact__tab-strip--scroll` | 可随时调整，不属于公开 API |

---

## 输入区（Composer）

**平台不提供 Composer 组件**——输入区由应用自行实现。

原因：工具栏按钮（附件、知识库选择、Tools 开关）因应用而异，固定实现反而成为障碍。平台提供 CSS token（`--color-border`、`--color-bg-white`、`--color-accent` 等）供应用在自绘输入区时保持视觉一致。

详见 [接入指南 §Composer](docs/integration-guide.md#输入区composer约定)。

---

## 文档

| 文档 | 内容 |
|------|------|
| [SSE 协议规范](docs/streaming-protocol.md) | 单一事实来源：事件类型、信封格式、扩展机制、迁移指南 |
| [接入指南](docs/integration-guide.md) | 从安装到首轮流式对话的完整步骤，含鉴权/CORS 说明 |
| [扩展事件指南](docs/extension-guide.md) | 第三方扩展事件开发、时序约定、历史消息边界说明 |
| [流式对话设计](docs/streaming-design.md) | 状态机、各事件前端处理细节、Artifact fence 约定 |
| [架构总览](docs/architecture.md) | 系统分层、前端模块划分（后端章节仅供参考） |
| [UI 规范](docs/ui-spec.md) | 布局、配色、字体、动画规范 |
| [应用插件系统](docs/app-plugin-system.md) | App Manifest 结构、Tools、Knowledge、Skill |
| [升级迁移](packages/meso-ui/CHANGELOG.md) | Breaking Changes 对照表 |

---

## 版本管理

遵循 [SemVer](https://semver.org/)：
- **Patch**：bug fix，不影响 API / 协议 / CSS token
- **Minor**：新增功能，向后兼容
- **Major**：Breaking Changes（API 字段、SSE 协议、CSS 稳定类名、主题变量）

协议层 Breaking 须先更新 `docs/streaming-protocol.md` 和契约测试 fixture，再发 `@meso/ui`。
