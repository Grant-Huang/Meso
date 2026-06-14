# 平台选型指南

## 何时使用 Meso

- 后端已能（或愿意）发 Meso v1.0 SSE 事件
- 需要多 tool / 多 phase / workflow 可观测性的流式 UI
- 希望协议与 UI 解耦，前后端可独立演进

## 何时不用 Meso

- 只需简单 chat bubble + markdown，无工具/workflow
- 后端使用 Vercel AI SDK 且不愿适配 SSE 协议
- 需要 Meso 目前不提供的：鉴权、session 存储、tool 执行引擎（需自建或接 `@meso.ai/client`）

## 与其他方案对比

| 方案 | 优势 | 劣势 |
|------|------|------|
| **Meso** | 协议标准化、多 tool UI 开箱、零供应商锁定 | 需自建 session/重连层 |
| **Vercel AI SDK useChat** | 与 Next.js 深度集成 | 协议私有、多 tool 可视化弱 |
| **自建** | 完全控制 | 重复实现状态机与组件 |

## 推荐接入路径

1. **演示级**：`useSSEStream` + `MessageList` + Vite mock（`demo/vite.config.ts`）
2. **生产级**：`@meso.ai/client` + `ProcessTrace` + FastAPI/Hono 后端
3. **渐进迁移**：先用 `extension` 兜底，逐步将领域事件升级为一等事件（见 extension-guide 决策树）

## 三层职责

| 层 | 包 | 职责 |
|----|-----|------|
| 协议 | `@meso.ai/types` | SSE 形状、`applyEvent` 状态机 |
| UI | `@meso.ai/ui` | 组件、`useSSEStream` |
| 会话 | `@meso.ai/client` | session、持久化、tool 确认、replay |
