# 布局规范

Meso 采用固定的三栏结构，所有尺寸通过 CSS 变量控制。

---

## 三栏尺寸

| 区域 | 默认值 | CSS 变量 | 折叠/隐藏条件 |
|------|--------|----------|-------------|
| 左侧导航栏（展开）| 145px | `--sidebar-w` | 手动折叠 |
| 左侧导航栏（折叠）| 52px | `--sidebar-w-collapsed` | — |
| 会话列表栏 | 260px | `--session-col-w` | ≤900px 自动隐藏 |
| 顶栏高度 | 52px | — | — |
| 主内容区 | flex: 1 | — | — |

---

## 区域布局示意

```
┌──────────────────────────────────────────────────────────────┐
│ 52px  顶栏（应用侧自定义，或留空）                               │
├──────────┬────────────────┬──────────────────────────────────┤
│ 145px    │ 260px          │ flex:1                           │
│          │                │                                  │
│ 应用图标 │ 会话列表        │  主内容区                         │
│ 导航项   │  搜索框         │  （聊天区 / Artifact 面板）        │
│   ...    │  会话 item      │                                  │
│          │   ...           │                                  │
│ [footer] │                │                                  │
└──────────┴────────────────┴──────────────────────────────────┘
```

---

## 响应式断点

| 屏宽 | 行为 |
|------|------|
| > 900px | 三栏全显 |
| ≤ 900px | 会话列表栏隐藏（主内容区扩展） |
| ≤ 600px | 侧栏自动折叠到 52px |

---

## 侧栏折叠动画

```css
.meso-layout__sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  transition: width 0.2s ease, min-width 0.2s ease;
  overflow: hidden;
}
.meso-layout__sidebar--collapsed {
  width: var(--sidebar-w-collapsed);
  min-width: var(--sidebar-w-collapsed);
}
```

折叠时：导航文字 `opacity → 0`（100ms）；图标居中；展开时 `tooltip` 提示导航项名称。

---

## 圆角规范

| 元素 | 圆角 |
|------|------|
| 导航项、会话项、按钮 | 6px |
| 输入框、搜索框、小卡片 | 8px |
| 消息气泡、普通卡片 | 10px |
| Artifact 面板、大容器 | 12px |
| Tooltip | 6px |

---

## 会话列（SessionColumn）推荐结构

平台提供 `sessionColumn` 插槽，内容由应用实现。推荐模式：

```tsx
function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string>()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 搜索 */}
      <div style={{ padding: '10px 10px 6px' }}>
        <input
          placeholder="搜索会话…"
          style={{
            width: '100%', padding: '6px 10px',
            background: 'var(--color-bg-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, fontSize: 13,
            color: 'var(--color-text)',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* 新建按钮 */}
      <div style={{ padding: '4px 10px 8px' }}>
        <button
          onClick={createNewSession}
          style={{
            width: '100%', padding: '7px 12px',
            background: 'var(--color-accent)', color: '#fff',
            border: 'none', borderRadius: 6,
            fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          + 新对话
        </button>
      </div>

      {/* 会话列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
        {sessions.map(s => (
          <SessionItem
            key={s.id}
            session={s}
            active={s.id === activeId}
            onClick={() => setActiveId(s.id)}
          />
        ))}
      </div>
    </div>
  )
}

function SessionItem({ session, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '8px 10px',
        background: active ? 'var(--nav-active-bg)' : 'transparent',
        border: 'none', borderRadius: 6, cursor: 'pointer',
        textAlign: 'left', color: active ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
        fontSize: 13, fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 2,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span style={{ fontWeight: active ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.title || '新对话'}
      </span>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
        {session.lastTime}
      </span>
    </button>
  )
}
```

---

## footerSlot：侧栏底部区域

典型用途：用户头像 + 设置按钮。

```tsx
function SidebarFooter() {
  const { theme, toggle } = useTheme()
  return (
    <div style={{
      padding: '10px 8px',
      borderTop: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {/* 用户头像 */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--color-accent)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>
        {user.name[0]}
      </div>

      {/* 用户名（折叠时隐藏，通过 CSS 控制） */}
      <span style={{
        fontSize: 13, color: 'var(--color-text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
      }}>
        {user.name}
      </span>

      {/* 主题切换 */}
      <button
        onClick={toggle}
        title={theme === 'dark' ? '切换亮色' : '切换暗色'}
        style={{
          width: 28, height: 28, border: 'none', borderRadius: 6,
          background: 'transparent', cursor: 'pointer',
          color: 'var(--color-text-muted)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {theme === 'dark' ? '☀' : '●'}
      </button>
    </div>
  )
}
```

---

## Composer（输入区）

> **平台约定（normative）**：Meso 不提供 Composer 组件，输入区由应用自行实现。原因：工具栏按钮（附件、知识库、工具开关）因应用而异，平台提供的固定实现反而会成为障碍。平台提供 CSS token 确保视觉一致。

### 基础 Composer

```tsx
function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
    // 重置高度
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  // 自动扩展高度
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div style={{
      padding: '10px 16px 12px',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-bg)',
      position: 'sticky', bottom: 0,
    }}>
      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        background: 'var(--color-bg-white)',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.15s',
      }}
        onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'}
        onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder="输入消息… (Enter 发送，Shift+Enter 换行)"
          rows={1}
          style={{
            width: '100%', resize: 'none',
            border: 'none', outline: 'none',
            padding: '10px 14px',
            background: 'transparent',
            color: 'var(--color-text)',
            fontFamily: 'inherit', fontSize: 14, lineHeight: 1.6,
            maxHeight: 200, overflowY: 'auto',
          }}
        />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '6px 10px', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 'auto' }}>
            {text.length > 0 && `${text.length} 字`}
          </span>
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            style={{
              background: disabled || !text.trim() ? 'var(--color-border)' : 'var(--color-accent)',
              color: '#fff', border: 'none', borderRadius: 6,
              padding: '5px 14px', fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.12s',
            }}
          >
            {disabled ? '生成中…' : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 带工具栏的 Composer

工具栏按钮由应用决定，平台不约束：

```tsx
function FullComposer({ onSend, onAttach, onToggleTools, toolsEnabled, disabled }) {
  const [text, setText] = useState('')

  return (
    <div style={{
      padding: '10px 16px 12px',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-bg)',
      position: 'sticky', bottom: 0,
    }}>
      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 10, background: 'var(--color-bg-white)',
      }}>
        {/* 工具栏（顶部）*/}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 10px 0',
          borderBottom: '1px solid var(--color-border-light)',
        }}>
          {/* 附件 */}
          <ToolbarButton onClick={onAttach} title="附件">
            <PaperclipIcon />
          </ToolbarButton>

          {/* 工具开关 */}
          <ToolbarButton
            onClick={onToggleTools}
            title="工具"
            active={toolsEnabled}
          >
            <WrenchIcon />
          </ToolbarButton>
        </div>

        {/* 输入区 */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (!disabled && text.trim()) { onSend(text); setText('') }
            }
          }}
          placeholder="输入消息…"
          rows={3}
          style={{
            width: '100%', resize: 'none', border: 'none', outline: 'none',
            padding: '10px 14px', background: 'transparent',
            color: 'var(--color-text)', fontFamily: 'inherit', fontSize: 14,
          }}
        />

        {/* 底部操作栏 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 10px', gap: 8 }}>
          <button onClick={() => { onSend(text); setText('') }} disabled={disabled}>
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

// 通用工具栏按钮
function ToolbarButton({ onClick, title, active, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28,
        background: active ? 'var(--nav-active-bg)' : 'transparent',
        border: 'none', borderRadius: 5, cursor: 'pointer',
        color: active ? 'var(--color-accent-dark)' : 'var(--color-text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      {children}
    </button>
  )
}
```

### 布局：Composer 贴底

将 Composer 放在主内容区底部，使用 flex 布局：

```tsx
<div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
  {/* 消息区（可滚动） */}
  <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
    <MessageList messages={messages} streaming={state} />
  </div>

  {/* Composer（固定在底部）*/}
  <Composer onSend={handleSend} disabled={state.status === 'streaming'} />
</div>
```

[布局演示](demo:02-layout.html)
