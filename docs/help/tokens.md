# 设计系统

所有视觉 token 来自 `@meso/ui/tokens.css`，双主题通过 `data-theme` 属性切换。

---

## 引入方式

```tsx
// main.tsx（Vite / Next.js / CRA）
import '@meso/ui/tokens.css'
```

```html
<!-- 或在 HTML 中直接引用 -->
<link rel="stylesheet" href="node_modules/@meso/ui/dist/tokens.css" />
```

> **FOUC 防护脚本**需放在 tokens.css 加载之前，详见 [快速接入 步骤二](#quickstart)。

---

## 主题切换

```typescript
// 使用 useTheme Hook（推荐）
const { theme, toggle } = useTheme()
// theme: 'light' | 'dark'
// toggle(): 切换主题 + 写入 localStorage（key: 'meso-theme'）

// 手动切换（不依赖 React）
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('meso-theme', next)
}
```

主题通过 `<html data-theme="dark">` 属性驱动。亮色主题为默认，无需 `data-theme` 属性。

---

## 公开稳定 Token（[stable]）

纳入 SemVer，Breaking 变更须 major 版本 bump + CHANGELOG 条目。

### 背景色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-bg` | #dde2db | #1a1e1b | 页面/区域背景 |
| `--color-bg-elevated` | #e8ece6 | #20271f | 卡片、面板、悬浮层 |
| `--color-bg-white` | #eef0ec | #252e26 | 输入框、消息气泡 |
| `--color-bg-sidebar` | #d5dad2 | #151918 | 侧栏、session 列 |

### 文字色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-text` | #1c2620 | #c8d5cb | 主文本 |
| `--color-text-secondary` | rgba(28,38,32,.65) | rgba(200,213,203,.65) | 次要文本、标签 |
| `--color-text-muted` | rgba(28,38,32,.42) | rgba(200,213,203,.42) | 占位符、弱化内容 |

### 强调色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-accent` | #3d6b52 | #5a9e70 | 主按钮、激活文字、高亮 |
| `--color-accent-dark` | #2a5240 | #74ba8a | hover 态、激活背景文字 |

### 边框

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-border` | #b0baa8 | #2c3830 | 分隔线、输入框边框 |
| `--color-border-light` | rgba(28,38,32,.10) | rgba(200,213,203,.10) | 轻度分割 |

### 代码块

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-code-bg` | #1a201c | #0e1210 | 代码块背景 |
| `--color-code-text` | #c8d5cb | #d5e0d8 | 代码文字 |

### 状态色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-error` | #b83232 | #e06060 | 错误 |
| `--color-warning` | #b45309 | #e0a030 | 警告 |
| `--color-success` | #2a7a4f | #5fbe85 | 成功 |
| `--color-info` | #3d6b52 | #5a9e70 | 信息（当前与 accent 同色）|

### 布局尺寸

| Token | 值 | 用途 |
|-------|-----|------|
| `--sidebar-w` | 145px | 侧栏展开宽度 |
| `--sidebar-w-collapsed` | 52px | 侧栏折叠宽度 |
| `--session-col-w` | 260px | 会话列宽度 |

---

## 内部 Token（[internal]）

不纳入 SemVer，可随时调整，**不建议在应用 CSS 中引用**：

```css
/* [internal] — 请勿在应用 CSS 中使用 */
--nav-hover-bg          /* 导航项 hover 背景 */
--nav-active-bg         /* 导航项激活背景 */
--session-hover-bg      /* 会话项 hover 背景 */
--session-active-bg     /* 会话项激活背景 */
--badge-bg              /* 徽章背景 */
--splitter-hover        /* 拖动分割线 hover 色 */
```

---

## 字体规范

平台使用系统字体栈，不引入外部字体：

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
```

| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 正文内容 | 14px | 400 | 1.75 |
| 消息气泡 | 14px | 400 | 1.75 |
| 次要文本、标签 | 13px | 400 | 1.5 |
| 小字/角标 | 12px | 400 | — |
| 标题 H1 | 26px | 700 | 1.2 |
| 标题 H2 | 18px | 650 | 1.3 |
| 标题 H3 | 15px | 600 | 1.4 |
| 导航项 | 13px | 400（激活时 600） | — |
| 代码块 | 12.5px | 400 | 1.65 |
| 代码字体 | `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace` | — | — |

---

## 动画时长规范

| 用途 | 时长 | 缓动 |
|------|------|------|
| 侧栏展开/折叠 | 200ms | ease |
| 导航项 hover | 120ms | — |
| 按钮 hover | 120ms | — |
| 输入框 focus border | 150ms | — |
| ThinkBlock 折叠 | 300ms | ease |
| 光标闪烁周期 | 1000ms | — |
| stage 完成后折叠延迟 | 1500ms | — |
| ThinkBlock 自动折叠延迟 | 1500ms | — |

---

## 在应用 CSS 中使用 Token

```css
/* my-component.module.css */
.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  padding: 16px;
}

.card:hover {
  border-color: var(--color-accent);
}

.primary-button {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  cursor: pointer;
  transition: background 0.12s;
}

.primary-button:hover {
  background: var(--color-accent-dark);
}

.primary-button:disabled {
  background: var(--color-border);
  cursor: not-allowed;
}
```

### 深色模式自适应组件

```css
/* 使用 token 后自动适配两种主题，无需媒体查询 */
.status-badge {
  background: rgba(42, 122, 79, 0.12);
  color: var(--color-success);
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 12px;
}

/* 深色主题下 rgba 颜色也自动通过 token 变化 */
[data-theme="dark"] .status-badge {
  /* token 已切换，无需额外规则 */
  background: rgba(95, 190, 133, 0.12);
}
```

### 覆盖 Token（应用级主题定制）

```css
/* 在应用入口的 CSS 中覆盖，优先级高于 tokens.css */
:root {
  --color-accent: #4a7ab5;       /* 改为蓝色强调色 */
  --color-accent-dark: #3a6aa5;
  --sidebar-w: 160px;            /* 加宽侧栏 */
}

[data-theme="dark"] {
  --color-accent: #6a9fd5;
  --color-accent-dark: #8ab5e0;
}
```

> 只有 `[stable]` token 有覆盖稳定性保证。覆盖 `[internal]` token 可能在升级后失效。

---

## CSS 类名稳定性

平台 CSS 使用 `meso-` 前缀，分两类：

| 类型 | 示例 | 保证 |
|------|------|------|
| **稳定**（可在应用 CSS 中引用）| `.meso-layout` `.meso-bubble` `.meso-artifact` `.meso-stages` `.meso-think-block` | 纳入 SemVer，变更须 CHANGELOG |
| **内部**（不保证跨版本稳定）| `.meso-layout__sidebar-toggle-icon` `.meso-artifact__tab-strip--scroll` | 可随时调整 |

[配色系统演示](demo:../color-palette.html)
