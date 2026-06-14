# create-meso-app

Scaffold a minimal Vite + React Meso consumer app.

```bash
node examples/create-meso-app/index.mjs my-meso-app
cd my-meso-app
pnpm install
pnpm dev
```

Proxies `/api` to `http://localhost:8787` — run [node-hono-sse](../node-hono-sse/) alongside.
