#!/usr/bin/env node
/**
 * create-meso-app — minimal scaffold for Meso consumer apps.
 *
 * Usage: node examples/create-meso-app/index.mjs my-app
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const name = process.argv[2]
if (!name) {
  console.error('Usage: node index.mjs <app-name>')
  process.exit(1)
}

const root = resolve(process.cwd(), name)
if (existsSync(root)) {
  console.error(`Directory already exists: ${root}`)
  process.exit(1)
}

mkdirSync(root, { recursive: true })
mkdirSync(join(root, 'src'))

const files = {
  'package.json': JSON.stringify({
    name,
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@meso.ai/client': '^0.1.0',
      '@meso.ai/types': '^1.2.1',
      '@meso.ai/ui': '^2.1.1',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.3.4',
      typescript: '^5.6.3',
      vite: '^5.4.11',
    },
  }, null, 2),
  'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
`,
  'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
  <head><meta charset="UTF-8"/><title>${name}</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
`,
  'src/main.tsx': `import { createRoot } from 'react-dom/client'
import { MesoLocaleProvider } from '@meso.ai/ui'
import { App } from './App'
import '@meso.ai/ui/tokens.css'
import '@meso.ai/ui/style.css'

createRoot(document.getElementById('root')!).render(
  <MesoLocaleProvider locale="zh-CN">
    <App />
  </MesoLocaleProvider>
)
`,
  'src/App.tsx': `import { useState } from 'react'
import { ThreeColumnLayout, MessageList, ChatComposer } from '@meso.ai/ui'
import { createMesoSession } from '@meso.ai/client'

const session = createMesoSession({
  sessionId: 'demo',
  streamUrl: '/api/chat/stream',
})

export function App() {
  const [, n] = useState(0)
  const refresh = () => n(v => v + 1)

  return (
    <ThreeColumnLayout
      center={
        <>
          <MessageList
            messages={session.messages}
            streaming={session.streaming}
            onToolConfirm={id => session.confirmToolCall(id, true).then(refresh)}
            onToolCancel={id => session.confirmToolCall(id, false).then(refresh)}
          />
          <ChatComposer onSend={text => session.sendMessage(text).then(refresh)} />
        </>
      }
    />
  )
}
`,
  'README.md': `# ${name}

Meso starter app. Start backend (see examples/node-hono-sse) then:

\`\`\`bash
pnpm install
pnpm dev
\`\`\`
`,
}

for (const [file, content] of Object.entries(files)) {
  writeFileSync(join(root, file), content)
}

console.log(`Created ${name} at ${root}`)
console.log('Next: cd', name, '&& pnpm install && pnpm dev')
