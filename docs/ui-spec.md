# UI 规范

## 一、布局规范

### 三栏结构

```
┌──────────┬───────────────┬─────────────────────────────────────┐
│  左栏     │    中栏        │              右栏                    │
│ 图标菜单  │  会话历史      │           主工作区                   │
│ 126px    │  260px        │         flex: 1                     │
│ (折叠48px)│  (可隐藏)     │                                     │
└──────────┴───────────────┴─────────────────────────────────────┘
```

**左栏**（AppSidebar）
- 展开宽度：`126px`，折叠宽度：`48px`
- 过渡动画：`0.2s ease`
- 内容：App 图标导航 + 新建会话按钮 + 用户信息（底部）
- 折叠时：隐藏文字标签，仅显示图标，图标居中

**中栏**（SessionColumn）
- 固定宽度：`260px`
- 内容：当前 App 的会话历史列表，支持搜索、分组（今天/昨天/更早）
- 可通过 AppSidebar 切换 App 时切换对应会话列表

**右栏**（AppMain）
- 分屏模式（有 Artifact 时）：左 60% Chat + 右 40% Artifact，中间分隔条可拖动
- 纯聊天模式：全宽，内容最大宽度 `820px` 居中

### 分屏拖动

- 分隔条宽度：`4px`，hover 时高亮为 `#9cb8a8`，cursor: `col-resize`
- 拖动范围：左侧最小 `40%`，最大 `80%`
- 拖动时禁用 `user-select`，松开后恢复
- 记忆分割比例到 `localStorage`

---

## 二、配色系统

### 主色板

| Token | 值 | 用途 |
|-------|----|------|
| `--color-bg` | `#ecefe9` | 页面背景、侧栏背景 |
| `--color-bg-elevated` | `#f4f6f2` | 内容卡片背景 |
| `--color-bg-white` | `#ffffff` | 输入框、气泡白底 |
| `--color-bg-sidebar` | `#f7f7f3` | 会话历史栏背景 |
| `--color-text` | `#2f3a32` | 主文字 |
| `--color-text-secondary` | `rgba(47,58,50,0.6)` | 次要文字 |
| `--color-text-muted` | `rgba(47,58,50,0.4)` | 辅助文字、时间戳 |
| `--color-accent` | `#527c5e` | 强调色（激活状态、链接） |
| `--color-accent-dark` | `#2f7d4a` | 深强调色（正向操作） |
| `--color-border` | `#d9dfd7` | 边框 |
| `--color-border-light` | `rgba(47,58,50,0.1)` | 轻边框、分隔线 |

### 状态色

| Token | 值 | 用途 |
|-------|----|------|
| `--color-error` | `#c0392b` | 错误 |
| `--color-warning` | `#b45309` | 警告 |
| `--color-success` | `#2f7d4a` | 成功 |
| `--color-info` | `#527c5e` | 信息 |

### 会话激活样式

```css
/* 激活态：绿色左边框 + 浅绿背景 */
border-left: 2px solid #527c5e;
background: rgba(82, 124, 94, 0.12);
```

---

## 三、字体规范

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| 场景 | font-size | font-weight | line-height |
|------|-----------|-------------|-------------|
| 页面主体 | 15px | 400 | 1.6 |
| 聊天气泡 | 14px | 400 | 1.6 |
| Markdown 正文 | 14-15px | 400 | 1.65-1.7 |
| 小标签/时间 | 11-12px | 400 | 1.35 |
| 侧栏会话标题 | 13px | 400/600(激活) | 1.4 |
| 页面标题 | 15px | 650 | — |
| Welcome 标题 | 24px | 650 | — |

---

## 四、圆角规范

| 元素 | border-radius |
|------|---------------|
| 卡片/面板 | `10px` |
| 按钮 | `8px` |
| 输入框 | `8px` |
| 会话列表项 | `6px` |
| 聊天气泡（用户） | `14px 14px 4px 14px` |
| 代码块 | `8px` |
| 弹出菜单 | `12px` |

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
- 颜色：`--color-accent`
- `done` 事件后光标立即消失，操作栏（复制/点赞/踩）淡入

### 5.3 Think Block 生命周期

```
think 事件到达（done: false）
    → Think block 展开，标题"思考中…"，内容逐字流式追加
    → 背景 rgba(82,124,94,0.06)，左边框 2px solid --color-border

think 事件到达（done: true）
    → 标题变为"已思考（展开查看）"
    → 自动折叠（高度动画 300ms ease）
    → 用户可手动点击展开/折叠
```

折叠后样式：
```css
background: rgba(82,124,94,0.04);
border-left: 2px solid --color-border-light;
color: --color-text-muted;
font-size: 13px;
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
- 末尾追加错误提示块：背景 `rgba(192,57,43,0.08)`，文字 `--color-error`
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
- 整体容器：`border: 1px solid #e0e0d8; border-radius: 10px; background: #fff`
- 最大宽度：`900px`，底部固定定位（`position: fixed`）
- 底部安全区：`env(safe-area-inset-bottom)`

### 聊天气泡

**用户消息**
- 右对齐，最大宽度 `75%`
- 背景 `#fff`，边框 `1px solid #d9dfd7`，圆角 `14px 14px 4px 14px`

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

- 背景 `#f4f6f2`，左边框 `1px solid #d9dfd7`
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

## 六、Ant Design 定制

全局 ConfigProvider 覆盖 token：

```typescript
const theme = {
  token: {
    colorPrimary: '#527c5e',
    colorBgBase: '#ecefe9',
    borderRadius: 8,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: { borderRadius: 8 },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
  },
}
```

---

## 七、响应式断点

平台面向桌面端设计，最小支持宽度 `900px`。

| 宽度 | 行为 |
|------|------|
| `≥ 1200px` | 标准三栏 |
| `900px - 1200px` | 侧栏自动折叠为 48px |
| `< 900px` | 不做特殊处理（平台定位桌面） |
