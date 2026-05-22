# UI 规范

## 一、布局规范

### 三栏结构

```
┌──────────┬───────────────┬─────────────────────────────────────┐
│  左栏     │    中栏        │              右栏                    │
│ 导航栏   │  会话历史      │           主工作区                   │
│ 145px    │  260px        │         flex: 1                     │
│ (折叠52px)│  (可隐藏)     │                                     │
└──────────┴───────────────┴─────────────────────────────────────┘
```

**左栏**（AppSidebar）
- 展开宽度：`145px`，折叠宽度：`52px`（CSS token：`--sidebar-w` / `--sidebar-w-collapsed`）
- 过渡动画：`width 0.25s cubic-bezier(.4,0,.2,1)`
- 内容：顶部品牌 logo + ≡ 折叠按钮 + App 导航项 + 底部用户头像
- 折叠时：隐藏文字标签，仅显示图标，图标居中

**中栏**（SessionColumn / ListColumn）
- 固定宽度：`260px`（CSS token：`--session-col-w`）
- 内容：当前 App 的会话历史列表，或设置页的分组列表

**右栏**（AppMain）
- 分屏模式（有 Artifact 时）：左 60% Chat + 右 40% Artifact，中间分隔条可拖动
- 纯聊天模式：全宽，内容最大宽度 `820px` 居中
- 设置页：内容居中，最大宽度 `520px`

### 分屏拖动

- 分隔条宽度：`5px`，hover 时高亮为 `var(--splitter-hover)`，cursor: `col-resize`
- 拖动范围：左侧最小 `40%`，最大 `80%`
- 拖动时禁用 `user-select`，松开后恢复
- 记忆分割比例到 `localStorage`

---

## 二、配色系统

### 主色板

所有颜色必须使用 CSS 自定义属性（来自 `meso-tokens.css`），禁止硬编码颜色值。

| Token | 值（Light） | 用途 |
|-------|------------|------|
| `--color-bg` | `#dde2db` | 页面背景、聊天区底色 |
| `--color-bg-elevated` | `#e8ece6` | 顶栏、Artifact 面板背景 |
| `--color-bg-white` | `#eef0ec` | 会话栏、输入框背景 |
| `--color-bg-sidebar` | `#d5dad2` | 左侧导航栏背景 |
| `--color-text` | `#1c2620` | 主文字 |
| `--color-text-secondary` | `rgba(28,38,32,0.65)` | 次要文字 |
| `--color-text-muted` | `rgba(28,38,32,0.42)` | 辅助文字、时间戳 |
| `--color-accent` | `#3d6b52` | 强调色（激活状态、链接） |
| `--color-accent-dark` | `#2a5240` | 深强调色（正向操作） |
| `--color-border` | `#b0baa8` | 边框 |
| `--color-border-light` | `rgba(28,38,32,0.10)` | 轻边框、分隔线 |

### 状态色

| Token | 用途 |
|-------|------|
| `--color-error` | 错误 |
| `--color-warning` | 警告 |
| `--color-success` | 成功 |
| `--color-info` | 信息 |

### 交互状态色

| Token | 用途 |
|-------|------|
| `--nav-hover-bg` | 导航项悬停背景 |
| `--nav-active-bg` | 导航项激活背景 |
| `--session-hover-bg` | 会话列表项悬停背景 |
| `--session-active-bg` | 会话列表项激活背景 |
| `--badge-bg` | 徽标背景 |

### 激活态规范

```css
/* 列表项激活态：绿色左边框 + 浅绿背景 */
border-left: 2px solid var(--color-accent);
background: var(--nav-active-bg);
color: var(--color-accent);
```

---

## 三、字体规范

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| 场景 | font-size | font-weight | line-height |
|------|-----------|-------------|-------------|
| 页面主体 | 14px | 400 | 1.6 |
| 聊天气泡 | 14px | 400 | 1.6 |
| Markdown 正文 | 14-15px | 400 | 1.65-1.7 |
| 小标签/时间 | 11-12px | 400 | 1.35 |
| 侧栏导航项 | 13px | 400/500(激活) | 1.4 |
| 页面标题 | 15px | 650 | — |
| Welcome 标题 | 24px | 650 | — |

---

## 四、圆角规范

| 元素 | border-radius |
|------|---------------|
| 卡片/面板 | `10px` |
| 按钮 | `6-8px` |
| 输入框 | `6px` |
| 导航项 | `5-6px` |
| 会话列表项 | `6px` |
| 聊天气泡（用户） | `14px 14px 4px 14px` |
| 代码块 | `8px` |
| 弹出菜单 | `10-12px` |
| Logo/头像 | `7-8px` |

---

## 五、流式渲染状态规范

流式对话是平台的交互主干，UI 需要完整反映每一个流式阶段。

### 5.1 整体时序

```
发送中        阶段进度推进         Think 流式          正文流式           完成
──────   ──────────────────   ──────────────   ────────────────   ──────
发送按钮      stage 事件驱动       think 事件           text 事件         done 事件
变为停止       进度条动画           折叠块展开+逐字       逐字追加+光标      光标消失
              ↓ ↓ ↓              累积内容              闪烁              操作栏出现
```

### 5.2 Streaming Cursor（打字光标）

- 正文流式输出时，末尾显示闪烁光标：`▋`
- 动画：`opacity 0.6s ease-in-out infinite alternate`
- 颜色：`var(--color-accent)`
- `done` 事件后光标立即消失，操作栏（复制/点赞/踩）淡入

### 5.3 Think Block 生命周期

```
think 事件到达（done: false）
    → Think block 展开，标题"思考中…"，内容逐字流式追加
    → 背景 rgba(82,124,94,0.06)，左边框 2px solid var(--color-border)

think 事件到达（done: true）
    → 标题变为"已思考（展开查看）"
    → 自动折叠（高度动画 300ms ease）
    → 用户可手动点击展开/折叠
```

### 5.4 Artifact 增量渲染

- `artifact` 事件（`done: false`）到达时：
  - 若 ArtifactPane 不可见，自动触发分屏（动画 `200ms ease`）
  - Artifact Tab 创建，标题显示语言类型（如 `JavaScript`）
  - 代码区域逐行追加，代码高亮实时生效
- `artifact` 事件（`done: true`）：
  - 代码高亮重新渲染（完整版本）
  - 若类型为 `html preview`，iframe 载入渲染结果
  - 若类型为 `mermaid`，触发 mermaid.js 渲染

### 5.5 Stage 进度时序

```
stage: {name: "召回记忆",  state: "active"}  → 旋转点 + 绿色文字
stage: {name: "召回记忆",  state: "done"}    → 绿实心点 + 次要色文字
stage: {name: "检索知识",  state: "active"}  → 同上
stage: {name: "检索知识",  state: "done"}
stage: {name: "生成回复",  state: "active"}  → 此后 text 事件开始到达
```

Stage 区域在 `done` 事件后 `1500ms` 自动折叠收起，不永久占据空间。

### 5.6 流式错误处理

`error` 事件到达时：
- 停止光标动画
- 已输出内容保留
- 末尾追加错误提示块：背景 `rgba(192,57,43,0.08)`，文字 `var(--color-error)`
- 提供"重试"按钮

---

## 六、关键组件规范

### Composer（输入框）

```
┌──────────────────────────────────────────────────────┐
│  TextArea（无边框，背景白，font-size: 15px）           │
├──────────────────────────────────────────────────────┤
│  [知识库] [Tools▾]  ···  [附件] [发送 ↵]             │
└──────────────────────────────────────────────────────┘
```
- 整体容器：`border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-white)`
- 最大宽度：`900px`，底部固定定位（`position: fixed`）
- 底部安全区：`env(safe-area-inset-bottom)`

### 聊天气泡

**用户消息**
- 右对齐，最大宽度 `75%`
- 背景 `var(--color-bg-white)`，边框 `1px solid var(--color-border)`，圆角 `14px 14px 4px 14px`

**AI 回复**
- 左对齐，最大宽度 `90%`，背景透明
- Markdown 渲染，代码高亮
- Think block 可折叠（默认折叠）
- hover 时显示操作栏（复制 / 点赞 / 踩）

### Artifact 面板

```
┌─────────────────────────────────────┐
│ [tab1] [tab2] [tab3]         [⊞ 新] │
├─────────────────────────────────────┤
│                                     │
│   ArtifactRenderer                  │
│   （按类型渲染内容）                  │
│                                     │
├─────────────────────────────────────┤
│ [复制] [下载] [存入记忆] [全屏]       │
└─────────────────────────────────────┘
```

- 背景 `var(--color-bg-elevated)`，左边框 `1px solid var(--color-border)`
- 代码类型：highlight.js，行号显示
- HTML 类型：沙箱 `<iframe sandbox="allow-scripts">`
- Mermaid 类型：mermaid.js 渲染为 SVG

### 阶段进度条（Stage）

```
● 召回记忆 [done]  ← done：绿点
● 检索知识 [done]
~ 分析中...        ← active：旋转点 + 文字
○ 生成结果          ← pending：空心灰点
```

时间轴样式：左侧 `1px` 竖线 + 节点圆点。

---

## 七、图标规范

所有图标必须使用 **Lucide 风格内联 SVG**，禁止使用 emoji 或图片图标。

```
viewBox: 0 0 24 24
stroke: currentColor
stroke-width: 1.5–1.8px（导航项用 1.6，正文内嵌用 1.5）
stroke-linecap: round
stroke-linejoin: round
fill: none
常用尺寸: 14px、16px、18px（对应 width/height 属性）
```

---

## 八、交互模式规范（禁止自行发挥）

此节规定所有 UI 的具体交互方式。**实现时必须参照此节，遇到规范未覆盖的场景先确认，不得自行发明。**

### 8.1 侧边栏折叠/展开

| 规则 | 说明 |
|------|------|
| **触发方式** | 侧边栏内 ≡（汉堡）按钮，作为第一个导航项（紧跟品牌 logo 下方） |
| **Logo** | 仅作品牌标识（M），**不可点击**，**不触发折叠** |
| **过渡** | `width 0.25s cubic-bezier(.4,0,.2,1)` |
| **折叠态（52px）** | 仅显示图标，居中；文字标签 `opacity:0; max-width:0` |
| **展开态（145px）** | 图标 + 文字标签；标签 `opacity:1; max-width:120px` |
| **持久化** | 可选保存到 `localStorage('meso-sidebar-expanded')` |

禁止：点击 logo 折叠、hover 自动展开、拖拽改变宽度、其他非标准触发方式。

### 8.2 导航项激活态

```css
.nav-item.active {
  background: var(--nav-active-bg);
  color: var(--color-accent);
  border-left: 2px solid var(--color-accent);  /* 列表项用，图标栏导航项不加左边框 */
}
```

- 图标栏中的导航项（`nav-rail` 内）：激活态不加左边框，仅背景+颜色变化
- 列表栏中的行项（`list-col` 内的模型行、会话行等）：激活态加 `border-left: 2px solid var(--color-accent)`

### 8.3 用户头像与账号菜单

| 规则 | 说明 |
|------|------|
| **位置** | 侧边栏底部，`border-top: 1px solid var(--color-border-light)` 分隔 |
| **触发** | 点击头像/用户行，弹出向上的浮动菜单 |
| **菜单内容（固定顺序）** | 用户名 + 邮箱（不可点击头部）/ 切换主题 / 关于 Meso / 分隔线 / 退出登录（danger 色） |
| **关闭** | 点击菜单外任意位置，用 `document.addEventListener('click', ...)` 实现 |
| **折叠态** | 仅显示头像圆圈，居中；展开后显示头像 + 姓名 |

禁止：把账号菜单放到顶栏、用 modal 弹窗展示账号信息。

### 8.4 表单交互

| 规则 | 说明 |
|------|------|
| **保存反馈** | 右下角 Toast，`2s` 自动消失，不用 `alert()` |
| **删除确认** | `confirm()` 系统对话框，或内联确认步骤；绝不用 `alert()` |
| **输入验证** | 内联 hint 文字（`.form-hint`），focus 时 accent 色边框；不用弹窗 |
| **API Key 字段** | `type="password"` + 眼睛切换按钮（密文/明文切换），右侧绝对定位 |
| **测试连接** | 内联显示结果（ok/err chip），不跳转页面 |
| **必填/可选** | 可选字段用小 badge 标注，不用星号 |

### 8.5 弹出层层级规范

| 层级 | z-index | 用途 |
|------|---------|------|
| 侧边栏 | 10 | 正常文档流 |
| 下拉/浮动菜单 | 100–200 | 用户菜单、select 浮层 |
| Modal 遮罩 | 1000 | 确认对话框（系统 confirm() 优先） |
| Toast | 999 | 右下角通知 |

### 8.6 动画规范

| 动画 | 参数 |
|------|------|
| 侧边栏折叠/展开 | `0.25s cubic-bezier(.4,0,.2,1)` |
| 列宽变化（中栏隐藏） | `0.25s cubic-bezier(.4,0,.2,1)` |
| 浮动菜单出现 | `display: block`（无动画，保持简洁） |
| Toast 出现/消失 | `opacity + translateY, 0.2s ease` |
| 标签文字展开 | `max-width + opacity, 0.25s / 0.2s` |
| 分隔条 hover | `background 0.15s` |

### 8.7 设置页面布局规范

设置页（`settings.html`）采用三栏布局，与主应用共享左侧导航栏设计：

```
[nav-rail 52/145px] | [list-col 260px] | [main-pane flex:1, content max-w 520px centered]
```

- 中栏分上下两个区域：**模型连接**（固定高度，不超过视口50%）+ **实例**（flex:1，可滚动）
- 点击模型行 → 右侧显示模型配置表单
- 点击实例行 → 右侧显示实例配置表单，模型下拉只列出已配置 API Key 的模型
- 右侧无选中时显示引导 splash（齿轮图标 + 说明文字）

---

## 九、Ant Design 定制

全局 ConfigProvider 覆盖 token：

```typescript
const theme = {
  token: {
    colorPrimary: '#3d6b52',
    colorBgBase: '#dde2db',
    borderRadius: 8,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: { borderRadius: 6 },
    Input: { borderRadius: 6 },
    Select: { borderRadius: 6 },
  },
}
```

---

## 十、响应式断点

平台面向桌面端设计，最小支持宽度 `900px`。

| 宽度 | 行为 |
|------|------|
| `≥ 1200px` | 标准三栏 |
| `900px - 1200px` | 侧栏自动折叠为 52px |
| `< 900px` | 不做特殊处理（平台定位桌面） |
