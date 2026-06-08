# Meso — CLAUDE.md

Meso 是一个流式优先的 LLM UI 平台，核心是 SSE 协议 + React 组件库 + 状态机运行时。本文件是 Claude Code 工作时的行为规范和技术地图。

---

## 仓库结构

```
Meso/
├── packages/
│   ├── meso-types/          # @meso.ai/types — SSE 协议类型 + 零依赖运行时
│   └── meso-ui/             # @meso.ai/ui — React 组件库 + useSSEStream hook
├── demo/                    # @meso/demo — 开发用演示 app（Vite + React）
├── docs/                    # 平台文档（架构、协议、消费指南等）
├── brand/                   # 品牌资产（SVG mark、wordmark、banner、token）
├── .claude/hooks/           # Claude Code 会话钩子（session-start.sh）
├── vercel.json              # Vercel 部署配置（强制 pnpm）
└── pnpm-workspace.yaml      # pnpm 工作区声明
```

**包管理器：pnpm（仅此一个）。** 永远不要用 `npm install` 或 `yarn`——仓库根有 `yarn.lock` 是历史遗留，请忽略它。

---

## 常用命令

```bash
# 全量安装（含构建 prepare 脚本）
pnpm install

# 只构建指定包
pnpm --filter @meso.ai/types run build
pnpm --filter @meso.ai/ui    run build

# 运行测试
pnpm --filter @meso.ai/types run test
pnpm --filter @meso.ai/ui    run test

# 启动演示 app
pnpm --filter @meso/demo run dev

# 类型检查
pnpm --filter @meso.ai/ui run type-check
```

修改 `meso-types` 后必须先 build 它，再 build `meso-ui`，否则 TypeScript 找不到最新类型。

---

## 核心架构

### 分层关系

```
业务应用  →  @meso.ai/ui（组件 + hook）  →  @meso.ai/types（协议 + 运行时）
```

`@meso.ai/types` 零依赖，可在 Node.js / 浏览器 / Edge 任意环境运行。`@meso.ai/ui` 依赖 React ≥ 18，peerDep 声明 `@meso.ai/types`。

### SSE 协议

每个事件的标准信封：
```
data: {"type":"<event_type>","schema_version":"1.0","payload":{...}}\n\n
```

事件类型（`packages/meso-types/src/protocol.ts` 是唯一权威）：

| 事件 | 触发时机 |
|------|----------|
| `stage` | 流水线阶段变化（active/done/error） |
| `think` | 增量推理文本，`done:true` 触发自动折叠 |
| `text` | 增量响应文本 |
| `artifact` | 代码/图表/HTML 块，同一 `id` 的多次事件追加 |
| `tool_call` | 工具调用发起 |
| `tool_result` | 工具调用结果（含 error） |
| `memory` | 召回的记忆片段（覆盖前一次） |
| `memory_saved` | 记忆已保存通知 |
| `resource_read` | MCP 资源读取发起 |
| `resource_content` | MCP 资源内容 |
| `soul` | 激活的 Soul/人格 |
| `skill_active` | 激活的 Skill/工作模式 |
| `workflow_node` | DAG 工作流节点状态 |
| `capabilities` | 本次会话可用能力清单 |
| `extension` | 业务自定义事件（透传给 `renderExtension`） |
| `error` | 协议级错误 |
| `done` | 流结束 |

### 状态机

`StreamState`（`packages/meso-types/src/streamState.ts`）是唯一状态源，由 `applyEvent()` 纯函数驱动：

```ts
// 纯函数：state + event → nextState
applyEvent(state: StreamState, raw: string): StreamState
```

`useSSEStream` hook 封装 fetch + 解析 + applyEvent，返回 `{ state, start, reset, send }`。

---

## 组件库

所有组件从 `@meso.ai/ui` 导出，样式从 `@meso.ai/ui/style.css` 和 `@meso.ai/ui/tokens.css` 导出。

### 布局

| 组件 | 说明 |
|------|------|
| `ThreeColumnLayout` | 三栏框架（侧边栏 + 会话列 + 主区），支持 `sidebarLogo`、`sidebarTitle`、artifact 面板 |
| `ArtifactPaneShell` | 独立的 artifact 展示容器（不依赖三栏布局时使用） |

### 对话渲染

| 组件 | 说明 |
|------|------|
| `MessageList` | 消息列表，接受 `messages` + `streaming` 状态；支持 `renderLiveTrace` 自定义执行区 |
| `ChatBubble` | 气泡，支持 Markdown 渲染（传 `renderMarkdown` prop） |
| `ThinkBlock` | 推理块，`collapseWhen="done"` 时自动折叠 |
| `StageTimeline` | 阶段进度条 |
| `ArtifactPanel` | 代码/HTML/Mermaid/Markdown/表格；`renderMermaid` 异步渲染 |
| `ProcessTrace` | 执行过程折叠摘要（think + stages + tools + workflow） |

### 能力组件

| 组件 | 说明 |
|------|------|
| `ToolCallBlock` | 工具调用卡片，`awaiting_confirm` 状态自动渲染 `ConfirmGate` |
| `ConfirmGate` | 危险操作确认门，内置 risk-level 文案 |
| `SoulIndicator` | Soul/人格 chip |
| `SkillIndicator` | Skill/工作模式徽章 |
| `ResourceReadBlock` | MCP 资源读取卡片 |
| `WorkflowTimeline` | DAG 工作流进度，支持并行分支（`parallel` 自动检测 `parent_id`） |

### 输入

| 组件 | 说明 |
|------|------|
| `ChatComposer` | 多行输入框 + 发送按钮 |
| `SidebarUserMenu` | 侧边栏底部用户菜单 |
| `StreamingCursor` | 流式光标动画 |

---

## 设计系统

CSS token 文件：`packages/meso-ui/src/tokens.css`（亮色 + 暗色）。所有组件使用 CSS 变量，不写死颜色。

关键 token：
- `--color-bg` / `--color-bg-sidebar` / `--color-bg-elevated`
- `--color-text` / `--color-text-secondary` / `--color-text-muted`
- `--color-accent` / `--color-accent-dark`（品牌绿）
- `--color-border` / `--color-border-light`

品牌资产在 `brand/stream/`：`mark.svg`、`wordmark.svg`、`banner.svg`（亮/暗）、`loading.svg`。

---

## 开发规范

### 修改组件时

1. 只改 `packages/meso-ui/src/` 下的源文件，不要手动修改 `dist/`
2. CSS 变量用 token，禁止 hardcode 颜色
3. 新增组件必须在 `packages/meso-ui/src/index.ts` 导出
4. TypeScript 严格模式，`unknown` 类型不能直接作为 JSX child——用 `!!x &&` 转 boolean 再渲染

### 修改协议时

`packages/meso-types/src/protocol.ts` 是权威，改它后同步更新：
- `streamState.ts`（状态字段）
- `applyEvent.ts`（状态机分支）
- `runtime.contract.test.ts`（协议契约测试）

### 测试

- `@meso.ai/types`：`src/__tests__/runtime.contract.test.ts`（61 个协议契约测试）
- `@meso.ai/ui`：`src/runtime/__tests__/` + `src/hooks/__tests__/`（18 个）
- 不写 UI 快照测试；行为测试写在 `applyEvent.test.ts`

### CI

`.github/workflows/ci.yml` 在每次 PR 时运行：
1. `pnpm install --frozen-lockfile`
2. Build + Test 两个包
3. Smoke test：打包 tarball → 装进临时 Vite 项目 → `vite build`

Smoke test 用 glob 查找 tarball（`meso.ai-types-*.tgz`），不要写死版本号。

---

## 常见陷阱

| 问题 | 原因 | 解决 |
|------|------|------|
| `yarn install` 失败 / `workspace:*` 报错 | 有人用了 yarn，本项目只支持 pnpm | 用 `pnpm install` |
| `Cannot find module '@meso.ai/types'` | meso-types 未构建 | `pnpm --filter @meso.ai/types run build` |
| `Stage` import 报错 | `Stage` 类型在 `StageTimeline`，不在 `runtime` | `import type { Stage } from '../StageTimeline'` |
| Vercel 构建失败 | Vercel 检测到 yarn.lock 用了 yarn | `vercel.json` 已配置 pnpm，确保它在 PR 里 |
| `Type 'unknown' is not assignable to type 'ReactNode'` | metadata 字段类型是 `unknown` | 用 `!!node.metadata?.error &&` 转 boolean |

---

## 发布流程（npm OIDC Trusted Publishing）

发布触发方式：推送 `v*.*.*` tag，或在 GitHub Actions 页面手动触发 Release workflow。

### 版本 bump 步骤

```bash
# 修改两个包的 package.json 版本号（minor = 新功能，patch = bug fix）
# packages/meso-types/package.json  → version: "x.y.z"
# packages/meso-ui/package.json     → version: "x.y.z"

pnpm --filter @meso.ai/types run build
pnpm --filter @meso.ai/ui run build

git add packages/meso-types/package.json packages/meso-ui/package.json packages/*/dist
git commit -m "chore(release): bump @meso.ai/types@x.y.z and @meso.ai/ui@x.y.z"
git push origin main

git tag vx.y.z
git push origin vx.y.z   # 触发 Release workflow
```

### OIDC Trusted Publishing 配置要点

发包使用 npm OIDC Trusted Publishing（无 token），配置在 `.github/workflows/release.yml`。

**前提条件（缺任何一项都会失败）：**

| 条件 | 说明 |
|------|------|
| npm ≥ 11.5.1 | Node 22 自带 npm 10，**不支持** OIDC 握手；workflow 里加了 `npm install -g npm@latest` 解决 |
| `id-token: write` 权限 | job 级别声明，让 GitHub 签发 OIDC token |
| `registry-url` 但无 `NODE_AUTH_TOKEN` | setup-node 写入 `.npmrc` 让 npm 知道目标注册表；不设 token 才会走 OIDC |
| `package.json` 有 `repository.url` | npm 用它验证 provenance 来源；缺失报 422 |
| Trusted Publisher 仓库名大小写正确 | npmjs.com 配置里填 `Meso`（不是 `MESO`），大小写敏感 |
| 包在 npm 上已存在 | 全新包第一次发布须手动 `npm publish` 创建，之后才能走 OIDC |

**常见报错速查：**

| 报错 | 原因 | 解决 |
|------|------|------|
| `404 Not Found - PUT …` | npm 10 不做 OIDC 握手，或 Trusted Publisher 仓库名大小写错误 | 确认 npm ≥ 11.5.1；检查 npmjs.com Trusted Publisher 里 Repository 字段大小写 |
| `ENEEDAUTH` | 没有 `registry-url`，npm 找不到注册表配置 | 在 setup-node 加 `registry-url: https://registry.npmjs.org` |
| `422 … repository.url is ""` | `package.json` 缺 `repository` 字段 | 加 `"repository": { "type": "git", "url": "https://github.com/Grant-Huang/Meso.git" }` |
| `E403 Two-factor authentication required` | 用了 automation token，账号开启了 2FA | 换 OIDC Trusted Publishing 或带 bypass 2FA 的 granular token |

---

## 分支策略

- `main`：受保护，只通过 PR 合入
- 开发分支：`claude/review-meso-colors-ZM9Pl`（当前工作分支）
- PR 合并方式：squash merge
- 提交信息格式：`type(scope): description`，type 为 feat/fix/chore/ci/docs/refactor
