import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { streamSSE } from 'hono/streaming'

const app = new Hono()

function sseLine(type: string, payload: Record<string, unknown>): string {
  return `data: ${JSON.stringify({ type, schema_version: '1.0', payload })}\n\n`
}

app.post('/api/chat/stream', async (c) => {
  const body = await c.req.json<{ session_id?: string; message?: string }>()
  const message = body.message ?? ''

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ data: JSON.stringify({ type: 'phase', schema_version: '1.0', payload: { id: 'understand', name: '理解需求', state: 'running' } }) })
    await stream.writeSSE({ data: JSON.stringify({ type: 'text', schema_version: '1.0', payload: { delta: `收到：${message}` } }) })
    await stream.writeSSE({ data: JSON.stringify({ type: 'phase', schema_version: '1.0', payload: { id: 'understand', name: '理解需求', state: 'done' } }) })
    await stream.writeSSE({ data: JSON.stringify({ type: 'done', schema_version: '1.0', payload: {} }) })
  })
})

app.post('/api/tools/confirm', async (c) => {
  const body = await c.req.json()
  return c.json({ status: 'success', data: body })
})

const port = Number(process.env.PORT ?? 8787)
console.log(`Meso Hono SSE server on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
