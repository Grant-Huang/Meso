# 接入指南

本文描述第三方应用如何在 **1–2 天内**接入 Meso 平台，跑通首轮流式对话。

---

## 前置条件

- 前端使用 React 18+
- 后端能发送 SSE 事件流（任意技术栈）
- 后端按 [SSE 协议规范](./streaming-protocol.md) 格式发送事件

---

## 步骤 1：安装

```bash
npm install @meso.ai/ui @meso.ai/types
# 或
pnpm add @meso.ai/ui @meso.ai/types
```

`@meso.ai/types` 提供完整协议 TypeScript 类型；`@meso.ai/ui` 依赖它作为 peerDependency，两个包需同时安装。

---

## 步骤 2：引入 CSS

在应用入口（`main.tsx` / `_app.tsx`）导入设计 token 和组件样式：

```tsx
import '@meso.ai/ui/tokens.css'  // 设计 token（CSS 变量，亮/暗主题）— 必须
import '@meso.ai/ui/style.css'   // 所有组件样式 — 必须
```

不要写死内部路径 `node_modules/@meso.ai/ui/dist/style.css`，这不受 SemVer 保护。

**FOUC 防护**（亮/暗主题切换时避免闪烁）—— 放在 HTML `<head>` 最前、CSS 之前：

```html
<head>
  <script>
    (function() {
      var t = localStorage.getItem('meso-theme') || 'light';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
</head>
```

---

## 步骤 3：版本兼容性检查（推荐）

在 transport 边界加版本校验，确保后端协议与 SDK 版本匹配：

```tsx
import { isCompatibleVersion } from '@meso.ai/ui'

// 每条 SSE 事件解析后调用（开销极低）
if (!isCompatibleVersion(event)) {
  console.warn('Meso protocol version mismatch, skipping event')
  return
}
```

开发 / 测试环境可改用严格模式，不兼容时直接抛出：

```tsx
import { assertCompatibleVersion } from '@meso.ai/ui'
assertCompatibleVersion(event)  // throws: "Meso protocol version mismatch: ..."
```

---

## 步骤 4：三栏布局

```tsx
import { ThreeColumnLayout } from '@meso.ai/ui'

function App() {
  return (
    <ThreeColumnLayout
      appName="My App"
      navItems={[
        {
          id: 'chat',
          icon: <MessageIcon />,
          label: '对话',
          onClick: () => setPage('chat'),
        },
      ]}
      sessionColumn={<SessionList />}  // 可选
    >
      {/* 主内容区 */}
    </ThreeColumnLayout>
  )
}
```

导航项、会话列、Logo、页脚均由应用提供，平台只提供布局壳。

---

## 步骤 5：接入 SSE 流

```tsx
import { useSSEStream, MessageList } from '@meso.ai/ui'
import type { Message } from '@meso.ai/ui'

function ChatPane() {
  const { state, start, abort, reset } = useSSEStream('https://your-api.com/stream')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    // 先追加用户消息
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(), role: 'user', content: input,
    }])
    // 发起流请求（鉴权 header 由应用注入，平台不假设任何鉴权方式）
    start({
      method: 'POST',
      body: { message: input, session_id: currentSessionId },
      headers: { Authorization: `Bearer ${token}` },
    })
    setInput('')
  }

  // 流结束后将本轮追加到历史
  useEffect(() => {
    if (state.status === 'done' && state.textContent) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant', content: state.textContent,
      }])
      reset()
    }
  }, [state.status])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <MessageList
          messages={messages}
          streaming={state.status !== 'idle' ? state : undefined}
          emptyState={<p>发送消息开始对话</p>}
        />
      </div>
      <div style={{ padding: 16 }}>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button onClick={handleSend} disabled={state.status === 'streaming'}>发送</button>
        <button onClick={abort}      disabled={state.status !== 'streaming'}>停止</button>
      </div>
    </div>
  )
}
```

---

## 步骤 6（可选）：Phase 进度桥接

后端发 `phase` 事件时，`ProcessTrace` 会自动渲染阶段条与详情。若需独立使用 `StageTimeline`，可用 `phaseRecordToStage` 转换：

```tsx
import { phaseRecordToStage } from '@meso.ai/ui'
import { StageTimeline } from '@meso.ai/ui'

const stages = state.phaseOrder
  .map(id => state.phases[id])
  .filter(Boolean)
  .map(phaseRecordToStage)
<StageTimeline stages={stages} compact />
```

---

## 步骤 7（可选）：工具集成

工具集成分四个环节：**定义工具 → 声明到 Manifest → 后端发 SSE 事件 → 前端接回调**。

### 7.1 定义工具（ToolDefinition）

在 `tools/` 目录下创建 JSON 描述文件（对应 `@meso.ai/types` 导出的 `ToolDefinition` 类型）：

```json
// tools/read-file.json
{
  "schema_version": "1.0",
  "id": "myapp.read_file",
  "name": "读取文件",
  "version": "1.0.0",
  "description": "读取指定路径的文件内容，返回文本",
  "provider": "local",
  "risk": "safe",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "文件路径" }
    },
    "required": ["path"]
  },
  "tags": ["file", "read"]
}
```

`risk` 枚举值的含义：

| risk | 前端行为 |
|------|---------|
| `"safe"` | 直接执行，不弹确认 |
| `"write"` | 显示操作提示，不强制确认 |
| `"destructive"` | 渲染确认门（ConfirmGate），用户点击后才执行 |

对于 HTTP 工具（`provider: "api"`），还需提供 `endpoint` 和可选的 `auth`：

```json
{
  "schema_version": "1.0",
  "id": "myorg.web_search",
  "name": "网页搜索",
  "version": "2.0.0",
  "description": "搜索互联网获取最新信息",
  "provider": "api",
  "risk": "safe",
  "endpoint": "http://localhost:8080/tools/web-search",
  "method": "POST",
  "auth": {
    "type": "bearer",
    "env": "${SEARCH_API_KEY}"
  },
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "limit": { "type": "integer", "default": 5 }
    },
    "required": ["query"]
  }
}
```

### 7.2 在 Manifest 中声明

`tools` 字段接受三种形式，可混用：

```json
{
  "tools": [
    "search_knowledge",        // ① 内置工具 ID（字符串）
    "./tools/read-file.json",  // ② 外部工具文件路径（./ 开头）
    {                          // ③ 内联 ToolDefinition 对象
      "schema_version": "1.0",
      "id": "myapp.summarize",
      "name": "生成摘要",
      "version": "1.0.0",
      "description": "对文本生成简短摘要",
      "provider": "local",
      "risk": "safe",
      "input_schema": {
        "type": "object",
        "properties": { "text": { "type": "string" } },
        "required": ["text"]
      }
    }
  ]
}
```

平台在启动时加载所有工具定义，合并后在 `capabilities` SSE 事件中一次性发给前端。

### 7.3 后端发送 SSE 事件

流式请求的完整工具事件序列：

```python
# Python / FastAPI 后端示例
import json

async def event_stream():
    def sse(t, p):
        return f'data: {json.dumps({"type":t,"schema_version":"1.0","payload":p})}\n\n'

    # ① 流式开始时声明可用工具（前端据此渲染工具面板）
    yield sse("capabilities", {"tools": [{
        "name": "read_file",
        "description": "读取文件内容",
        "provider": "local",
        "risk": "safe",
        "input_schema": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    }]})

    # ② LLM 决定调用工具 → 发 tool_call（前端渲染 ToolCallBlock）
    yield sse("tool_call", {
        "id": "tc-001",
        "name": "read_file",
        "args": {"path": "/docs/readme.md"},
        "risk": "safe",    # safe → 前端直接展示；destructive → 等待用户确认
        "provider": "local"
    })

    # ③ 执行工具，发送结果（前端更新 ToolCallBlock 状态）
    result = run_tool("read_file", {"path": "/docs/readme.md"})
    yield sse("tool_result", {
        "tool_call_id": "tc-001",
        "output": result,          # 序列化为字符串
        "duration_ms": 28
    })

    # ④ 继续生成回复
    yield sse("text", {"delta": "文件内容已读取。"})
    yield sse("done", {})
```

**危险工具的后端流程**（`risk: "destructive"`）：

1. 后端发 `tool_call`（带 `risk: "destructive"`）→ 暂停等待确认信号
2. 前端渲染确认门，用户点击"确认"→ 前端 `POST /api/tool/confirm`
3. 后端收到确认 → 执行工具 → 发 `tool_result` → 继续流式

```python
# 危险工具后端示例（需配合 POST /api/tool/confirm 接口）
async def event_stream(session_id: str):
    yield sse("tool_call", {
        "id": "tc-del",
        "name": "delete_file",
        "args": {"path": "/tmp/cache.db"},
        "risk": "destructive",
        "provider": "local"
    })

    # 阻塞等待用户确认（实现由应用自己选择：Redis pub/sub、asyncio.Event 等）
    confirmed = await wait_for_confirm(session_id, "tc-del", timeout=60)
    if not confirmed:
        yield sse("error", {"message": "用户已取消操作"})
        return

    yield sse("tool_result", {
        "tool_call_id": "tc-del",
        "output": "已删除 /tmp/cache.db（1.2 MB）",
        "duration_ms": 45
    })
    yield sse("done", {})
```

### 7.4 前端接入

```tsx
<MessageList
  messages={messages}
  streaming={state.status !== 'idle' ? state : undefined}
  onToolConfirm={(toolCallId) => {
    // risk="destructive" 工具用户点击确认后触发
    // 通知后端继续执行（后端解除等待，继续流式输出）
    fetch('/api/tool/confirm', {
      method: 'POST',
      body: JSON.stringify({ tool_call_id: toolCallId }),
    })
  }}
  onToolCancel={(toolCallId) => {
    // 用户取消：中止当前 SSE 流
    abort()
  }}
/>
```

`tool_call` 的 `risk` 字段控制前端行为：
- `"safe"` / `"write"` → ToolCallBlock 立即显示执行状态，无需用户操作
- `"destructive"` → 自动弹出 ConfirmGate，流式暂停，等用户点击"确认执行"

> **交互 Demo**：在 Demo 应用中打开 **「工具集成」** 页面，可以看到安全工具自动执行、以及危险工具确认门的完整交互流程。

---

## 步骤 8（可选）：扩展事件

如果后端发送业务扩展事件（工具进度、自定义卡片等），通过 `renderExtension` 渲染：

```tsx
<MessageList
  messages={messages}
  streaming={state.status !== 'idle' ? state : undefined}
  renderExtension={(event) => {
    if (event.payload.name === 'citation') {
      return <CitationCard data={event.payload.data} />
    }
    return null
  }}
/>
```

详见 [扩展事件指南](./extension-guide.md)。

---

## 输入区（Composer）约定

> **平台立场**：Meso 不提供 Composer 组件。输入区由应用自行开发，平台提供 CSS token 支持视觉一致。

**原因**：输入区的工具栏按钮（附件、知识库、Tools 开关）因应用而异，平台提供固定实现反而成为障碍。

**推荐实现模式**：

```tsx
function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')
  return (
    <div style={{
      position: 'sticky', bottom: 0,
      background: 'var(--color-bg-white)',
      borderTop: '1px solid var(--color-border)',
      padding: 12,
    }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); onSend(text); setText('')
          }
        }}
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-white)' }}
      />
      <button
        onClick={() => { onSend(text); setText('') }}
        disabled={disabled}
        style={{ background: 'var(--color-accent)', color: '#fff' }}
      >
        发送
      </button>
    </div>
  )
}
```

---

## 与常见框架集成

### Next.js（App Router）

```tsx
// app/layout.tsx
import '@meso.ai/ui/tokens.css'
import '@meso.ai/ui/style.css'

// app/chat/page.tsx
'use client'  // useSSEStream 是 React Hook，须在 Client Component 中使用
import { useSSEStream, MessageList } from '@meso.ai/ui'
```

### Vite + React

```tsx
// src/main.tsx
import '@meso.ai/ui/tokens.css'
import '@meso.ai/ui/style.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
```

---

## 无 React 使用（Node.js / 测试 / 边缘函数）

```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/ui/runtime'

const lines = sseResponseText.split('\n')
const finalState = lines.reduce((state, line) => {
  const event = parseSSELine(line)
  return event ? applyEvent(state, event) : state
}, { ...createInitialStreamState(), status: 'streaming' as const })
```

用途：后端集成测试、验证 SSE 输出是否符合协议、边缘函数预处理。

---

## CORS 与鉴权说明

`useSSEStream` 使用 `fetch + ReadableStream`（非原生 `EventSource`）。第三方须自行处理：

- 后端返回 `Content-Type: text/event-stream`
- 后端设置正确的 CORS 响应头（`Access-Control-Allow-Origin`）
- Cookie 跨域场景通过 `start()` 的 `headers` 传 `Authorization`

---

## 验收检查列表

接入完成后按以下清单自检：

**基础流式**
- [ ] 发送消息后立即出现 StageTimeline 进度动画
- [ ] ThinkBlock 在推理时展开，`done: true` 后自动折叠
- [ ] 文字逐字流入，光标在末尾闪烁
- [ ] ArtifactPanel 在代码开始流入时弹出
- [ ] `done` 事件后光标消失，状态变为 `done`
- [ ] 点击「停止」后流式中止，状态回到 `idle`

**能力系统（如适用）**
- [ ] `soul` 事件后 SoulIndicator 显示头像 + 特质标签
- [ ] `skill_active` 事件后 SkillIndicator 显示技能名 + 焦点
- [ ] `memory` 事件后记忆 chip 正确显示
- [ ] `capabilities` 事件中 `tools` 数组正确声明（名称、风险、schema 完整）
- [ ] `tool_call` 事件后 ToolCallBlock 显示 spinner
- [ ] `tool_result` 事件后 ToolCallBlock 更新为 check / error
- [ ] `risk: "safe"` 工具直接执行，无确认门
- [ ] `risk: "destructive"` 工具触发确认门，点击确认后调用 `onToolConfirm`，`tool_result` 到达后确认门消失
- [ ] 工具执行失败（`tool_result` 含 `error` 字段）时 ToolCallBlock 显示错误状态
- [ ] `resource_read` 后 ResourceReadBlock 显示 URI + spinner
- [ ] `resource_content` 后 ResourceReadBlock 更新为内容可折叠展示
- [ ] `workflow_node` 事件后 WorkflowTimeline 节点状态正确更新

**布局与主题**
- [ ] 亮/暗主题切换后无 FOUC 闪烁
- [ ] 窄屏（≤ 900px）会话列隐藏，窄屏（≤ 600px）侧栏自动折叠
- [ ] `schema_version` 不匹配时 `isCompatibleVersion` 返回 false，事件被跳过
