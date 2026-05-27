import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Scripted Meso Protocol v1.0 events for the mock stream endpoint.
// Each entry is [delay_ms, event_json_string].
const MOCK_SCRIPT: [number, string][] = [
  [100,  JSON.stringify({ type: 'stage', schema_version: '1.0', payload: { name: '召回记忆', state: 'active' } })],
  [300,  JSON.stringify({ type: 'memory', schema_version: '1.0', payload: { snippets: [
    { category: 'preference', content: '偏好 TypeScript，arrow functions' },
    { category: 'project', content: '当前项目：Meso，React 18 + Vite' },
  ] } })],
  [400,  JSON.stringify({ type: 'stage', schema_version: '1.0', payload: { name: '召回记忆', state: 'done' } })],
  [500,  JSON.stringify({ type: 'stage', schema_version: '1.0', payload: { name: '生成回复', state: 'active' } })],
  [600,  JSON.stringify({ type: 'think', schema_version: '1.0', payload: { delta: '用户询问 Meso 的核心特性…让我整理一下关键点。', done: false } })],
  [800,  JSON.stringify({ type: 'think', schema_version: '1.0', payload: { delta: '重点：SSE 协议、组件库、流式状态机。', done: true } })],
  [900,  JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: 'Meso 是一个' } })],
  [1000, JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: '流式优先的 LLM UI 平台，' } })],
  [1100, JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: '提供三大核心能力：\n\n' } })],
  [1200, JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: '1. **SSE 协议 v1.0** — 标准化流式事件格式\n' } })],
  [1300, JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: '2. **`@meso.ai/ui`** — React 组件库（MessageList、ThreeColumnLayout…）\n' } })],
  [1400, JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: '3. **`@meso.ai/types`** — 零依赖运行时（parseSSELine、applyEvent）\n\n' } })],
  [1500, JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: '以下是一段示例代码：' } })],
  [1600, JSON.stringify({ type: 'artifact', schema_version: '1.0', payload: {
    id: 'a1', lang: 'typescript',
    delta: 'import { useSSEStream, MessageList } from \'@meso.ai/ui\'\n\nfunction ChatPage() {\n  const { state, start, reset } = useSSEStream(\'/api/stream\')\n',
    done: false,
  } })],
  [1700, JSON.stringify({ type: 'artifact', schema_version: '1.0', payload: {
    id: 'a1', lang: 'typescript',
    delta: '  // state.textContent 实时更新\n  // state.thinkContent 显示思考过程\n  return <MessageList messages={[]} streaming={state} />\n}\n',
    done: true,
  } })],
  [1800, JSON.stringify({ type: 'stage', schema_version: '1.0', payload: { name: '生成回复', state: 'done' } })],
  [1900, JSON.stringify({ type: 'done', schema_version: '1.0', payload: {} })],
]

function serveMockStream(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  })

  for (const [delay, json] of MOCK_SCRIPT) {
    setTimeout(() => {
      if (!res.destroyed) res.write(`data: ${json}\n\n`)
    }, delay)
  }

  req.on('close', () => res.destroy())
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-sse',
      configureServer(server) {
        server.middlewares.use('/api/mock-stream', (req, res, next) => {
          if (req.method === 'POST' || req.method === 'GET') {
            serveMockStream(req, res)
          } else {
            next()
          }
        })
      },
    },
  ],
  resolve: {
    // Ensure path-dep packages resolve correctly
    dedupe: ['react', 'react-dom'],
  },
})
