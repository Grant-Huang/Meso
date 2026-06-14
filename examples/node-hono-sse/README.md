# Node Hono SSE Example

Runnable Node.js backend emitting Meso v1.0 SSE events.

```bash
cd examples/node-hono-sse
pnpm install
pnpm start
```

Proxy your frontend `useSSEStream('/api/chat/stream')` to `http://localhost:8787/api/chat/stream`.
