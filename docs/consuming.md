# 消费 @meso.ai/ui 和 @meso/types

本文档面向在 Meso monorepo **外部**使用这两个包的应用开发者。

---

## 推荐：npm / pnpm 安装（正式方案）

```bash
npm install @meso.ai/ui @meso/types
# 或
pnpm add @meso.ai/ui @meso/types
```

```json
{
  "dependencies": {
    "@meso/types": "^1.0.0",
    "@meso.ai/ui":    "^2.0.0",
    "react":       "^18.0.0",
    "react-dom":   "^18.0.0"
  }
}
```

- `package.json` 的 `name` / `exports` / `types` 全部指向正确根目录
- 无需任何 webpack alias 或 tsconfig path 修改
- npm 和 pnpm 行为一致

### 引入样式

```tsx
// 设计 token（CSS 变量，亮/暗主题）— 必须
import '@meso.ai/ui/tokens.css'

// 组件样式 — 必须（包含 StageTimeline、ArtifactPanel 等所有内置样式）
import '@meso.ai/ui/style.css'
```

不要写死 `node_modules/@meso.ai/ui/dist/style.css`，这是内部路径，不受 SemVer 保护。

---

## 短期备选：Release tarball

每个版本的 GitHub Release 都附带预构建 tarball，适合无法访问 npm registry 的环境：

```json
{
  "dependencies": {
    "@meso/types": "https://github.com/Grant-Huang/Meso/releases/download/v1.0.0/meso-types-1.0.0.tgz",
    "@meso.ai/ui":    "https://github.com/Grant-Huang/Meso/releases/download/v2.0.0/meso-ui-2.0.0.tgz"
  }
}
```

tarball 根目录即包根，不会指向 monorepo 根，安装行为与 npm 包一致。

---

## 不推荐：`github:#path:` 安装

```jsonc
// ❌ 不推荐
"@meso.ai/ui": "github:Grant-Huang/Meso#path:packages/meso-ui"
```

**问题：**

- pnpm 将 symlink 指向 monorepo 根而非 `packages/meso-ui`，导致 `package.json` 的 `exports` / `types` 解析失败
- Next.js、Vite 等构建工具无法找到正确的入口，需要手动加 webpack alias 或 tsconfig paths 绕过
- 不同 pnpm 版本行为不一致；低版本可能完全不支持 `#path:`

若坚持使用 git path 安装（仅开发阶段），已验证的最低要求：
- pnpm ≥ 8.0
- 消费方 `package.json` 中同时声明两个包的 `#path:` 引用
- 在消费方根添加 webpack/rspack alias：`'@meso.ai/ui' → '.../node_modules/@meso.ai/ui/dist/index.js'`

---

## Monorepo 内（file: 路径）

仅适用于与 Meso 同仓库或通过 `file:` 相对路径引用的项目：

```bash
# 1. 先 build types，再 build ui（dist 必须存在）
pnpm --filter @meso/types run build
pnpm --filter @meso.ai/ui run build
```

```json
{
  "dependencies": {
    "@meso/types": "file:../meso/packages/meso-types",
    "@meso.ai/ui":    "file:../meso/packages/meso-ui"
  }
}
```

每次拉取新版 Meso 后，重新执行 build 命令刷新 dist。

---

## 常见故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| `Cannot find module '@meso.ai/ui'` | dist 未构建 | `pnpm --filter @meso.ai/ui run build` |
| `.pnpm/.../ENOENT` | node_modules 缓存损坏 | `rm -rf node_modules .next && pnpm install` |
| `Module '"@meso.ai/ui"' has no exported member` | 类型声明与运行时版本不一致 | 确认 `@meso/types` 与 `@meso.ai/ui` 版本配套，重新 install |
| CSS 样式缺失 | 未 import style.css | 在入口加 `import '@meso.ai/ui/style.css'` |
| Next.js 解析到 monorepo 根 | 使用了 `#path:` 安装 | 改用 npm 包或 tarball |
