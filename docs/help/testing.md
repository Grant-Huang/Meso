# 测试与调试

本页描述如何对 SSE 后端输出做自动化验证，以及如何在 React 环境中测试流式组件。

---

## @meso.ai/types：在 Node.js 中验证 SSE 输出

无需浏览器，纯 Node.js 测试后端发出的 SSE 流是否符合协议：

```typescript
// backend.test.ts
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/types'
import { describe, it, expect } from 'vitest'

function replaySSE(raw: string) {
  return raw.trim().split('\n').reduce((state, line) => {
    const event = parseSSELine(line)
    return event ? applyEvent(state, event) : state
  }, { ...createInitialStreamState(), status: 'streaming' as const })
}

describe('SSE 协议合规测试', () => {
  it('正常对话流 — textContent 正确累积', () => {
    const raw = `
data: {"type":"text","schema_version":"1.0","payload":{"delta":"Hello"}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":", world"}}

data: {"type":"done","schema_version":"1.0","payload":{}}
    `
    const state = replaySSE(raw)
    expect(state.textContent).toBe('Hello, world')
    expect(state.status).toBe('done')
  })

  it('多 artifact 流 — artifactOrder 正确', () => {
    const raw = `
data: {"type":"artifact","schema_version":"1.0","payload":{"id":"a1","lang":"python","delta":"x=1","done":true}}

data: {"type":"artifact","schema_version":"1.0","payload":{"id":"a2","lang":"sql","delta":"SELECT 1","done":true}}

data: {"type":"done","schema_version":"1.0","payload":{}}
    `
    const state = replaySSE(raw)
    expect(state.artifactOrder).toEqual(['a1', 'a2'])
    expect(state.artifacts['a1'].lang).toBe('python')
    expect(state.artifacts['a2'].content).toBe('SELECT 1')
  })

  it('error 事件 — 状态变为 error', () => {
    const raw = `
data: {"type":"error","schema_version":"1.0","payload":{"message":"timeout","code":"UPSTREAM_TIMEOUT"}}
    `
    const state = replaySSE(raw)
    expect(state.status).toBe('error')
    expect(state.errorMessage).toBe('timeout')
  })

  it('扩展事件 — extensionLog 按顺序累积', () => {
    const raw = `
data: {"type":"extension","schema_version":"1.0","payload":{"name":"citation","data":{"source":"paper-42"}}}

data: {"type":"extension","schema_version":"1.0","payload":{"name":"citation","data":{"source":"paper-43"}}}

data: {"type":"done","schema_version":"1.0","payload":{}}
    `
    const state = replaySSE(raw)
    expect(state.extensionLog).toHaveLength(2)
    expect(state.extensions['citation']).toHaveLength(2)
    expect(state.extensions['citation'].at(-1)?.payload.data).toMatchObject({ source: 'paper-43' })
  })
})
```

---

## Fixture 文件：可重现的协议测试

把真实的 SSE 输出保存为 `.txt` fixture，配合 snapshot 做回归测试：

```
packages/meso-types/src/__fixtures__/
  basic-stream.txt          ← 真实 SSE 行（data: ... \n\n 格式）
  basic-stream.snapshot.json
  extension-stream.txt
  extension-stream.snapshot.json
  error-stream.txt
  error-stream.snapshot.json
```

**basic-stream.txt** 示例：

```
data: {"type":"phase","schema_version":"1.0","payload":{"id":"generate","name":"生成","state":"running"}}

data: {"type":"text","schema_version":"1.0","payload":{"delta":"Hello"}}

data: {"type":"done","schema_version":"1.0","payload":{}}
```

**契约测试**（对 fixture 做 snapshot 验证）：

```typescript
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/types'

function loadFixture(name: string) {
  const txt = readFileSync(join(__dirname, '__fixtures__', name + '.txt'), 'utf-8')
  return txt.trim().split('\n').reduce((state, line) => {
    const event = parseSSELine(line)
    return event ? applyEvent(state, event) : state
  }, { ...createInitialStreamState(), status: 'streaming' as const })
}

it('basic-stream snapshot', () => {
  expect(loadFixture('basic-stream')).toMatchSnapshot()
})
```

快照文件自动生成后放入版本控制，后续修改协议或 `applyEvent` 时，测试会捕获意外的行为变化。

---

## 在 React 测试中 mock useSSEStream

使用 `vi.mock`（Vitest）或 `jest.mock` 注入假状态：

```typescript
// __mocks__/@meso.ai/ui.ts
import type { StreamState } from '@meso.ai/ui'
import { createInitialStreamState } from '@meso.ai/types'

export const mockStreamState: StreamState = {
  ...createInitialStreamState(),
  status: 'done',
  textContent: 'Hello, I am an AI assistant.',
}

export const useSSEStream = vi.fn(() => ({
  state: mockStreamState,
  start: vi.fn(),
  abort: vi.fn(),
  reset: vi.fn(),
}))

// 其余组件从真实模块 re-export
export * from '../node_modules/@meso.ai/ui/dist/index.js'
```

在测试中控制状态：

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { useSSEStream } from '@meso.ai/ui'
import { ChatPage } from './ChatPage'

vi.mock('@meso.ai/ui')

describe('ChatPage', () => {
  it('发送按钮在 streaming 时禁用', () => {
    vi.mocked(useSSEStream).mockReturnValue({
      state: { ...createInitialStreamState(), status: 'streaming' },
      start: vi.fn(), abort: vi.fn(), reset: vi.fn(),
    })
    render(<ChatPage />)
    expect(screen.getByRole('button', { name: /发送|生成中/ })).toBeDisabled()
  })

  it('error 状态显示错误 UI', () => {
    vi.mocked(useSSEStream).mockReturnValue({
      state: {
        ...createInitialStreamState(),
        status: 'error',
        errorMessage: 'UPSTREAM_TIMEOUT',
      },
      start: vi.fn(), abort: vi.fn(), reset: vi.fn(),
    })
    render(<ChatPage />)
    expect(screen.getByText(/超时|UPSTREAM_TIMEOUT/)).toBeInTheDocument()
  })
})
```

---

## 后端调试：curl 验证 SSE 流

```bash
# 验证 SSE 流格式
curl -N -X POST https://your-backend/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message":"hello"}' | cat

# 输出应如下（每条 data: 后跟空行）：
# data: {"type":"stage","schema_version":"1.0","payload":{"name":"分析","state":"active"}}
#
# data: {"type":"text","schema_version":"1.0","payload":{"delta":"Hello"}}
#
# data: {"type":"done","schema_version":"1.0","payload":{}}
#
```

常见格式问题：

| 症状 | 可能原因 |
|------|---------|
| 所有内容一次性到达 | 后端未设置 `Cache-Control: no-cache` 或 Nginx 缓冲 |
| 平台无任何渲染 | 缺少 `Content-Type: text/event-stream` |
| 事件被忽略 | 缺少 `schema_version` 字段（解析器宽容，但建议显式填写）|
| stage 不显示 | `payload.name` 为空或 `payload.state` 拼写错误 |
| Artifact 不渲染 | `done:true` 未发送；或 `id` 在同一流中不一致 |

---

## CI 集成

在 CI 中跑协议合规测试，无需浏览器：

```yaml
# .github/workflows/test.yml
- name: Run contract tests
  run: |
    cd packages/meso-types
    npm test
```

测试运行在 Node.js 环境，零浏览器依赖，速度快，适合作为 PR 门控。
