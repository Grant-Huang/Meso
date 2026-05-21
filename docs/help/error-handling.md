# 错误处理

流式请求有多种失败模式，本页描述每种情况下应呈现的 UI 以及恢复模式。

---

## StreamState 的四种状态

```typescript
type Status = 'idle' | 'streaming' | 'done' | 'error'
```

| 状态 | 含义 | 建议 UI |
|------|------|---------|
| `idle` | 初始 / 重置后 | 发送按钮可用 |
| `streaming` | 流正在进行 | 显示光标 / 停止按钮；发送按钮禁用 |
| `done` | 正常结束 | 光标消失；可再次发送 |
| `error` | 异常终止 | 显示错误信息；提供重试入口 |

---

## error 事件：后端主动报错

后端在 SSE 流中发送 `error` 事件：

```json
{"type":"error","schema_version":"1.0","payload":{
  "message":"上游 LLM 服务超时，请稍后重试",
  "code":"UPSTREAM_TIMEOUT"
}}
```

前端读取：

```typescript
if (state.status === 'error') {
  console.log(state.errorMessage)  // "上游 LLM 服务超时，请稍后重试"
}
```

**推荐错误码（约定，非强制）：**

| `code` | 含义 |
|--------|------|
| `UPSTREAM_TIMEOUT` | 上游 LLM 超时 |
| `RATE_LIMITED` | 速率限制 |
| `CONTENT_FILTERED` | 内容审核拦截 |
| `CONTEXT_TOO_LONG` | 上下文超出模型限制 |
| `INSUFFICIENT_QUOTA` | 余额/配额不足 |

---

## 网络错误：fetch 失败

当 HTTP 请求本身失败（网络断开、CORS 错误、非 2xx 状态码），`useSSEStream` 也会将 `status` 设为 `'error'`，`errorMessage` 为网络错误描述。

---

## 错误 UI 模式

### 最小错误提示

```tsx
{state.status === 'error' && (
  <div style={{
    margin: '8px 0', padding: '10px 14px',
    background: 'rgba(184,50,50,0.08)',
    border: '1px solid var(--color-error)',
    borderRadius: 8, color: 'var(--color-error)',
    fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <span>⚠</span>
    <span>{state.errorMessage || '发生未知错误'}</span>
    <button
      onClick={() => reset()}
      style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--color-error)', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', color: 'var(--color-error)', fontSize: 12 }}
    >
      关闭
    </button>
  </div>
)}
```

### 带重试的错误提示

```tsx
function ChatArea() {
  const { state, start, abort, reset } = useSSEStream('/api/stream')
  const [lastRequest, setLastRequest] = useState<{ message: string } | null>(null)

  const handleSend = (message: string) => {
    setLastRequest({ message })
    start({ method: 'POST', body: { message } })
  }

  const handleRetry = () => {
    if (!lastRequest) return
    reset()
    start({ method: 'POST', body: lastRequest })
  }

  return (
    <div>
      <MessageList messages={messages} streaming={state} />

      {state.status === 'error' && (
        <div style={{
          padding: '12px 16px', margin: '8px',
          background: 'rgba(184,50,50,0.06)',
          border: '1px solid var(--color-error)',
          borderRadius: 10,
        }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 10, fontWeight: 500 }}>
            {friendlyError(state.errorMessage)}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRetry}
              style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
            >
              重试
            </button>
            <button
              onClick={reset}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function friendlyError(code?: string | null): string {
  const map: Record<string, string> = {
    UPSTREAM_TIMEOUT:    '上游服务响应超时，请稍后重试',
    RATE_LIMITED:        '请求过于频繁，请稍后再试',
    CONTENT_FILTERED:    '内容未通过审核，请修改后重试',
    CONTEXT_TOO_LONG:    '对话太长，请开始新对话',
    INSUFFICIENT_QUOTA:  '服务配额不足，请联系管理员',
  }
  return code && map[code] ? map[code] : (code || '发生未知错误，请重试')
}
```

---

## 用户主动中止（abort）

用户点击"停止"时调用 `abort()`：

```typescript
abort()
// → 状态变为 'idle'（不是 'error'）
// → AbortController 中断 fetch
// → 已收到的 textContent / artifacts 保留
```

中止后应用通常需要把已生成的部分内容保存到历史：

```typescript
const handleAbort = () => {
  abort()
  // 保留已生成的部分内容
  if (state.textContent) {
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: state.textContent + '…（已停止）',
      }
    ])
  }
  reset()
}
```

---

## 超时处理

`useSSEStream` 本身不内置超时，建议在后端设置。如需前端超时：

```typescript
function useChatWithTimeout(url: string, timeoutMs = 30000) {
  const { state, start, abort, reset } = useSSEStream(url)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const startWithTimeout = (options: StreamOptions) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (state.status === 'streaming') {
        abort()
        // 此处可触发应用级别的超时错误 UI
      }
    }, timeoutMs)
    start(options)
  }

  useEffect(() => {
    if (state.status !== 'streaming') clearTimeout(timerRef.current)
  }, [state.status])

  return { state, start: startWithTimeout, abort, reset }
}
```

---

## 状态机完整转换图

```
                  start()
    idle ─────────────────────────► streaming
     ▲                                  │
     │           abort()                │ done 事件
     │◄─────────────────────────────────┤
     │                                  │ error 事件
     │           reset()                ▼
     ├─────────────────────────────── error
     │           reset()
     └─────────────────────────────── done
```

从任意非 `idle` 状态调用 `reset()` 均可回到 `idle`。
