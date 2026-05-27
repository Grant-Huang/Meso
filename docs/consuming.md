# 消费指南

本文面向在 Meso monorepo **外部**使用 `@meso.ai/ui` 和 `@meso.ai/types` 的应用开发者。

---

## 推荐：npm / pnpm 安装

```bash
npm install @meso.ai/ui @meso.ai/types
# 或
pnpm add @meso.ai/ui @meso.ai/types
```

```json
{
  "dependencies": {
    "@meso.ai/types": "^1.0.0",
    "@meso.ai/ui":    "^2.0.0",
    "react":          "^18.0.0",
    "react-dom":      "^18.0.0"
  }
}
```

- `package.json` 的 `exports` / `types` 全部指向正确根目录，无需任何 alias 或 tsconfig paths
- npm 和 pnpm 行为一致

### 引入样式

```tsx
// 设计 token（CSS 变量，亮/暗主题）— 必须
import '@meso.ai/ui/tokens.css'

// 组件样式 — 必须
import '@meso.ai/ui/style.css'
```

不要写死 `node_modules/@meso.ai/ui/dist/style.css`，这是内部路径，不受 SemVer 保护。

---

## 备选：Release tarball

每个版本的 GitHub Release 都附带预构建 tarball，适合无法访问 npm registry 的环境：

```json
{
  "dependencies": {
    "@meso.ai/types": "https://github.com/Grant-Huang/Meso/releases/download/v1.0.0/meso.ai-types-1.0.0.tgz",
    "@meso.ai/ui":    "https://github.com/Grant-Huang/Meso/releases/download/v2.0.0/meso.ai-ui-2.0.0.tgz"
  }
}
```

tarball 根目录即包根，安装行为与 npm 包一致。

---

## Monorepo 内（file: 路径）

仅适用于与 Meso 同仓库或通过 `file:` 相对路径引用的项目：

```bash
# dist 必须先存在
pnpm --filter @meso.ai/types run build
pnpm --filter @meso.ai/ui run build
```

```json
{
  "dependencies": {
    "@meso.ai/types": "file:../meso/packages/meso-types",
    "@meso.ai/ui":    "file:../meso/packages/meso-ui"
  }
}
```

每次拉取新版 Meso 后，重新执行 build 刷新 dist。

---

## 不推荐：`github:#path:` 安装

```jsonc
// ❌ 不推荐
"@meso.ai/ui": "github:Grant-Huang/Meso#path:packages/meso-ui"
```

**问题**：
- pnpm 将 symlink 指向 monorepo 根而非 `packages/meso-ui`，`exports` / `types` 解析失败
- Next.js、Vite 等构建工具无法找到正确入口，需手动加 webpack alias 绕过
- 不同 pnpm 版本行为不一致

---

## 常见故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| `Cannot find module '@meso.ai/ui'` | dist 未构建 | `pnpm --filter @meso.ai/ui run build` |
| `Module '"@meso.ai/ui"' has no exported member` | 类型版本不一致 | 确认两个包版本配套，重新 install |
| CSS 样式全部缺失 | 未 import style.css | 在入口加 `import '@meso.ai/ui/style.css'` |
| 设计 token 不生效（颜色异常） | 未 import tokens.css | 在入口加 `import '@meso.ai/ui/tokens.css'` |
| Next.js 解析到 monorepo 根 | 使用了 `#path:` 安装 | 改用 npm 包或 tarball |
| `.pnpm/.../ENOENT` | node_modules 缓存损坏 | `rm -rf node_modules && pnpm install` |
| 亮/暗主题切换闪烁（FOUC） | 未加主题初始化脚本 | 见[接入指南 步骤 2](./integration-guide.md#步骤-2引入-css) |
