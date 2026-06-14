# 生产部署清单

## SSE / 代理

- [ ] 禁用 CDN/反向代理缓冲：`X-Accel-Buffering: no`（nginx）
- [ ] Cloudflare：关闭 response buffering 或使用支持 streaming 的 plan
- [ ] Vercel Edge：确认 Route Handler 使用 `ReadableStream`，勿 await 完整 body

## 超时

- [ ] 前端 `useSSEStream` 配置 `watchdogMs`（默认 120s）
- [ ] 后端 LLM 调用设置独立超时，断开时通过 `@meso_sse_handler` 停止生成

## 鉴权

- [ ] `useSSEStream.start({ headers: { Authorization: 'Bearer ...' } })`
- [ ] token 刷新在 app 层包装，刷新后重新 `start()`
- [ ] 401/403 走 `onError` 回调，勿静默重试

## 并发与限流

- [ ] `useSSEStream` 内置 `inFlight` 防双发；勿绕过 hook 直接 fetch
- [ ] 后端限制每 session 同时 1 条活跃流
- [ ] 工具确认队列：同一 `tool_call_id` 只接受一次 confirm

## 监控

- [ ] `StreamCallbacks.onToolCall` / `onToolResult` 记录时延
- [ ] `onError` 记录 `errorCode`（`WATCHDOG_TIMEOUT`、`UPSTREAM_TIMEOUT` 等）
- [ ] 后端记录 disconnect 事件（`request.is_disconnected()`）

## 国际化

- [ ] 用 `MesoLocaleProvider` 包裹应用根节点
- [ ] 覆盖 `labels` prop 接入 i18n 系统
