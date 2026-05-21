# Meso — 流式 LLM 对话 UI 平台

Meso 是一个**前端平台层**，专为构建流式 LLM 对话应用设计。它提供三件事：

- **SSE 事件协议 v1.0**：版本化、可机器验证的流式通信契约
- **`@meso/ui` React 组件库**：开箱即用的流式对话 UI 组件
- **`@meso/types` 纯运行时**：状态机 / 解析器，零 React 依赖

平台**不包含**：业务后端、鉴权、会话持久化、Tools 执行引擎、知识库检索。这些由你的应用实现。

---

## 平台边界

```
你的应用          后端 API / 业务逻辑 / 鉴权 / 数据库
    ↕ SSE 协议 v1.0（docs/streaming-protocol.md 定义）
@meso/ui          ThreeColumnLayout / MessageList / ArtifactPanel / …
@meso/types       parseSSELine / applyEvent / createInitialStreamState
tokens.css        CSS 变量（亮色 / 暗色双主题）
```

---

## 包结构

| 包 / 路径 | 用途 | React 依赖 |
|-----------|------|-----------|
| `@meso/ui` | 全部 React 组件 + Hook + 类型 | ✅ 需要 |
| `@meso/ui/runtime` | 同 @meso/types，便捷路径 | ❌ 无需 |
| `@meso/types` | 协议类型 + 纯运行时函数 | ❌ 无需 |
| `@meso/ui/tokens.css` | CSS 设计 token | — |

`@meso/types` 可在 Node.js、测试环境、边缘函数中直接使用，无需浏览器。

---

## 一次完整对话轮次

用户发送消息后，后端按此顺序发出 SSE 事件，平台实时渲染对应 UI：

```
→ stage    {"name":"召回记忆","state":"active"}   StageTimeline 旋转动画出现
→ stage    {"name":"召回记忆","state":"done"}     打对号
→ memory   {"snippets":[…]}                      Memory 芯片显示
→ stage    {"name":"生成回复","state":"active"}
→ think    {"delta":"用户想要…","done":false}     ThinkBlock 展开，逐字流入
→ think    {"delta":"","done":true}              1.5s 后自动折叠
→ text     {"delta":"以下是"}                    ChatBubble 出现，光标闪烁
→ text     {"delta":"代码示例："}
→ artifact {"id":"a1","lang":"python","delta":"def hello():","done":false}
                                                 ArtifactPanel 从右侧滑入
→ artifact {"id":"a1","delta":"","done":true}
→ done     {}                                    光标消失，状态变 done
```

每个事件对应 UI 中明确的动画和状态变化——"等待感"被彻底消除。

---

## 接入时间估算

| 阶段 | 预计时间 |
|------|---------|
| 安装 + 布局 + 接入 SSE 流 | 0.5 天 |
| 扩展事件 / 自定义 Composer | 0.5 天 |
| 主题定制 / 细节打磨 | 0.5 天 |

---

## 自测验收清单

接入完成后，确认以下行为均正常：

- [ ] 发送消息后**立即**出现 StageTimeline（不是等 LLM 回复后才出现）
- [ ] ThinkBlock 在推理时展开，收到 `done:true` 后 1.5s 自动折叠
- [ ] 正文逐字流入，末尾显示闪烁光标 ▋
- [ ] Artifact 面板在首个 artifact 事件到达时从右侧滑入
- [ ] 收到 `done` 事件后光标消失，状态回到可再次发送
- [ ] 点击「停止」后中止流式，状态回到 idle
- [ ] 窄屏（≤900px）会话列隐藏，极窄屏（≤600px）侧栏自动折叠
- [ ] 明/暗主题切换无 FOUC 闪烁
- [ ] 第三方扩展事件通过 `renderExtension` 渲染，无需改平台代码
