# Meso · LLM Platform

基于流式对话的 AI 应用基础框架。提供统一的 UI 规范、流式对话核心、可插拔的应用能力（知识库 / Tools / 提示词），以及分层记忆系统。

## 核心理念

**流式对话是 Meso 的灵魂，不是一个功能。**

用户的每一次发送，都会触发一次完整的流式推进过程：记忆召回、知识检索、阶段进度、Think 过程、正文输出、Artifact 生成 —— 这一切都作为 SSE 事件流在单次对话中自然涌现，而不是分散在独立的 API 调用里。

```
用户发送
  │
  ├─ stage: 召回记忆 →  stage: 检索知识 →  stage: 分析中
  │
  ├─ think: 推理过程（可折叠）
  │
  ├─ text:  正文逐字输出 ···
  │
  ├─ artifact: 代码 / 图表 / HTML 边流边渲染到右侧面板
  │
  └─ done
```

所有上层能力（记忆系统、知识库、插件工具）都是这条流的**输入准备**或**输出解析**，流式对话是贯穿平台的主干。

## 定位

```
Meso (llm-platform)   ← 本 repo：平台层（流式对话核心 + UI框架 + 记忆 + 插件机制）
      ↑
各业务应用             ← 基于平台构建，只需提供 App Manifest
（DocReview / 工业协作 / 其他应用 / ...）
```

**平台层不包含业务逻辑。** 每个应用通过 App Manifest 声明自己需要的知识库、工具、提示词，平台负责将它们注入流式对话。

## 文档

| 文档 | 内容 |
|------|------|
| [流式对话设计](docs/streaming-design.md) | SSE 协议、流式渲染状态机、事件类型详解 |
| [架构总览](docs/architecture.md) | 系统分层、模块划分、数据流 |
| [UI 规范](docs/ui-spec.md) | 布局、配色、字体、流式渲染状态、组件规范 |
| [记忆系统](docs/memory-system.md) | 短期/长期记忆设计、Obsidian 集成 |
| [应用插件系统](docs/app-plugin-system.md) | App Manifest、知识库、Tools、Skill |

## 技术栈

- **前端**: React 18 + TypeScript + Ant Design 5 + Vite
- **后端**: Python 3.12 + FastAPI + SQLite
- **流式**: Server-Sent Events (SSE)
- **记忆**: 本地 `~/.llm-platform/` + Obsidian Vault（文件读写）
