# 架构总览

## 一、系统分层

**流式对话是平台的主干。** 记忆系统、能力系统（Soul/Skill/Tools/MCP）都是流式对话的前置配置或运行时组件，而不是独立并行的功能模块。每次用户发送，都沿着这条主干流动一遍。

```
┌─────────────────────────────────────────────────────────────┐
│                        业务应用层                            │
│   App Manifest（知识库 + Tools + Skill + Soul + 提示词模板） │
├─────────────────────────────────────────────────────────────┤
│                       平台服务层                             │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │               流式对话 Core（主干）                   │   │
│   │   SSE 生成器 / 事件协议 / 多轮状态机 / 上下文管理     │   │
│   └──────┬──────────┬──────────┬──────────┬─────────────┘   │
│          │          │          │          │                  │
│   ┌──────┴──────┐ ┌─┴───────┐ ┌┴────────┐ ┌┴────────────┐  │
│   │  记忆系统    │ │ Soul/   │ │  Tools  │ │  MCP 集成    │  │
│   │  Memory     │ │ Skill   │ │  引擎   │ │  (工具/资源  │  │
│   └─────────────┘ └─────────┘ └─────────┘ │  /提示词)   │  │
│                                            └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                        UI 框架层                             │
│   三栏布局 / 流式渲染状态机 / Artifact面板 / 能力组件         │
├─────────────────────────────────────────────────────────────┤
│                      基础设施层                              │
│   LLM Provider 抽象 / SQLite / SSE / 文件系统               │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、前端模块划分

### 2.1 布局框架

```
AppLayout
├── AppSidebar          # 左栏：图标菜单（可折叠 126px ↔ 48px）
├── SessionColumn       # 中栏：会话历史（260px，可隐藏）
└── AppMain             # 右栏：主工作区
    ├── PageHeader      # 顶部标题栏
    ├── ChatPane        # 流式对话区（纯模式：全宽；分屏模式：60%）
    ├── SplitDivider    # 可拖动分隔条（分屏模式）
    └── ArtifactPane    # Artifact 展示区（分屏模式：40%）
```

### 2.2 流式对话组件树

```
ChatPane
├── MessageList         # 消息列表（滚动区）
│   ├── ChatBubble      # 用户/助手消息气泡（Markdown 渲染）
│   ├── ThinkBlock      # 流式推理过程，done 后自动折叠
│   ├── StageTimeline   # 阶段进度条（stage 事件驱动）
│   ├── SoulIndicator   # Soul 头像 chip（soul 事件驱动）
│   ├── SkillIndicator  # Skill 徽章（skill_active 事件驱动）
│   ├── ToolCallBlock   # 工具调用卡片（tool_call/result 事件）
│   ├── ResourceReadBlock # MCP 资源读取卡片（resource_read/content 事件）
│   ├── ArtifactPanel   # 代码/图表/HTML 内容面板
│   └── ConfirmGate     # 危险工具确认门（risk=destructive）
└── Composer            # 输入区
    ├── ComposerTextarea
    └── ComposerToolbar # 工具栏（知识库选择 / 技能选择 / 发送）
```

### 2.3 UI 组件库（@meso.ai/ui）

所有组件均从 `@meso.ai/ui` 导出：

| 组件 | 说明 | 驱动事件 |
|------|------|----------|
| `ThreeColumnLayout` | 三栏布局框架 | — |
| `ChatBubble` | 用户/助手气泡 | `text` |
| `ThinkBlock` | 推理过程块，支持流式+折叠 | `think` |
| `StreamingCursor` | 流式光标动画 | — |
| `StageTimeline` | 阶段进度条 | `stage` |
| `ArtifactPanel` | 代码/HTML/图表面板 | `artifact` |
| `SoulIndicator` | Soul 头像 + 特质标签 | `soul` |
| `SkillIndicator` | Skill 徽章 + 焦点 | `skill_active` |
| `ToolCallBlock` | 工具卡片（风险+确认） | `tool_call`, `tool_result` |
| `ResourceReadBlock` | MCP 资源读取卡片 | `resource_read`, `resource_content` |
| `ConfirmGate` | 独立确认对话框 | — |
| `MessageList` | 组合所有流式组件的列表 | 所有事件 |

### 2.4 Artifact 面板

```
ArtifactPane
├── ArtifactTabs        # 多 Artifact 标签（一次对话可产出多个）
└── ArtifactRenderer    # 按类型渲染：
    ├── CodeArtifact    # 代码高亮（highlight.js）
    ├── HtmlArtifact    # HTML 实时预览（沙箱 iframe）
    ├── MermaidArtifact # Mermaid 图表渲染
    ├── MarkdownArtifact# Markdown 预览
    └── TableArtifact   # 表格数据
```

Artifact 的识别：LLM 输出中约定特定 fence 标记，流式解析时实时路由到 ArtifactPane。

````
支持的 fence 标记示例：
```html preview     → HtmlArtifact
```mermaid          → MermaidArtifact  
```artifact:table   → TableArtifact
```

### 2.5 应用切换

```
AppSidebar
└── AppNav             # 图标列表，每个图标对应一个注册的 App
    └── onClick → AppContext.switchApp(appId)
                    ↓
              加载对应 App Manifest
              重置 ComposerToolbar 的工具集
              切换会话列表（按 appId 过滤）
```

---

## 三、能力系统（Soul / Skill / Tools / MCP）

Meso 的能力模型基于三个维度：**提供方 × 类型 × 生命周期**。

### 3.1 能力提供方（CapabilityProvider）

| 值 | 含义 |
|----|------|
| `builtin` | 平台内置（search_knowledge, save_memory, …） |
| `local` | App 定义的同进程函数 |
| `mcp` | MCP（Model Context Protocol）服务器提供 |
| `api` | 外部 REST/gRPC 端点 |

### 3.2 能力类型

| 类型 | 协议事件 | 语义 |
|------|----------|------|
| **Soul** | `soul` | WHO——身份/人格，会话内稳定 |
| **Skill** | `skill_active` | HOW——运作模式，可切换；MCP Prompts 映射到此 |
| **Tool** | `tool_call` + `tool_result` | DO——执行有结果的外部操作 |
| **Resource** | `resource_read` + `resource_content` | READ——读取 MCP 文档/资源（只读，URI 寻址） |

### 3.3 MCP 能力映射

```
MCP Tools     → tool_call / tool_result  （执行操作）
MCP Resources → resource_read / resource_content  （读取文档）
MCP Prompts   → skill_active  （注入提示词后发信号）
MCP Sampling  → 后端处理，不透传到前端
```

### 3.4 能力发现

`capabilities` 事件在流式开始时发送一次，宣告本次会话所有可用能力：

```json
{
  "type": "capabilities",
  "payload": {
    "tools": [...],
    "skills": [...],
    "resources": [...],
    "mcp_servers": [...]
  }
}
```

---

## 四、SSE 事件协议（见规范文档）

> **规范性文档**：完整协议定义见 [`docs/streaming-protocol.md`](./streaming-protocol.md)，本节为概览。

所有流式事件格式统一为：

```
data: {"type": "<event_type>", "schema_version": "1.0", "payload": {...}}\n\n
```

完整事件类型（16 种）：

| event_type | payload | 说明 |
|------------|---------|------|
| `capabilities` | `{ tools, skills, resources, mcp_servers }` | 会话能力发现 |
| `soul` | `{ id, name, version, avatar?, traits? }` | 激活 Soul 人格 |
| `skill_active` | `{ id, name, provider?, server?, focus? }` | 激活 Skill 模式 |
| `stage` | `{ name, state }` | 阶段进度 |
| `memory` | `{ snippets: [{category, content}] }` | 记忆召回结果 |
| `memory_saved` | `{ id, category, preview }` | 记忆写入确认 |
| `tool_call` | `{ id, name, args, risk?, provider?, server?, annotations? }` | 工具调用开始 |
| `tool_result` | `{ tool_call_id, output, error?, duration_ms? }` | 工具执行完成 |
| `resource_read` | `{ id, uri, name?, server? }` | MCP 资源读取请求 |
| `resource_content` | `{ resource_read_id, contents, error?, duration_ms? }` | MCP 资源内容 |
| `think` | `{ delta, done? }` | 推理文本增量 |
| `text` | `{ delta }` | 普通文本增量 |
| `artifact` | `{ id, lang, delta, done? }` | Artifact 内容增量 |
| `done` | `{}` | 流正常结束 |
| `error` | `{ message, code? }` | 不可恢复错误 |
| `extension` | `{ name, version?, data }` | 自定义域事件 |

---

## 五、后端模块划分（参考实现，非规范）

> ⚠️ **Non-normative / Demo only**
> §5 至 §7 描述的是一种参考后端实现，不属于 `@meso.ai/ui` 平台契约。
> 第三方可使用任意后端技术栈（Node.js、Go、Java 等），
> 只需遵守 [`docs/streaming-protocol.md`](./streaming-protocol.md) 定义的 SSE 事件协议。

### 5.1 目录结构（目标）

```
backend/
├── main.py                  # FastAPI 入口，路由注册
├── routers/
│   ├── chat.py              # 流式对话 API
│   ├── sessions.py          # 会话 CRUD
│   ├── memory.py            # 记忆读写 API
│   ├── extraction.py        # 内容提取 API
│   └── apps.py              # App Manifest 注册/查询
├── core/
│   ├── streaming.py         # SSE 生成器工具函数
│   ├── llm_provider.py      # LLM Provider 抽象（openai_compatible / mock）
│   ├── conversation_fsm.py  # 多轮对话状态机
│   ├── prompt_builder.py    # 系统提示词构建（注入记忆 + 知识 + tools）
│   └── context_builder.py   # 滚动上下文窗口管理
├── capabilities/
│   ├── soul.py              # Soul 定义加载
│   ├── skill.py             # Skill（提示词模板）加载
│   ├── tools_registry.py    # Tools 注册与执行
│   └── mcp_client.py        # MCP 服务器连接与能力代理
├── memory/
│   ├── short_term.py        # 本地 .md 快照读写
│   ├── long_term.py         # Obsidian vault 文件读写
│   └── recall.py            # 混合召回（关键词 + 向量）
├── plugins/
│   ├── manifest.py          # App Manifest 解析与校验
│   └── knowledge.py         # 知识库索引与检索
├── extraction/
│   ├── detector.py          # 从流式输出中识别可提取内容
│   └── router.py            # 提取内容路由（存记忆 / 传功能模块）
└── db/
    ├── schema.py             # SQLite 建表
    └── queries.py            # 常用查询封装
```

### 5.2 核心 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/chat/stream` | 流式对话（SSE），接受 appId + messages + context |
| GET  | `/api/v1/sessions` | 会话列表（支持 appId 过滤） |
| POST | `/api/v1/sessions` | 新建会话 |
| GET  | `/api/v1/sessions/{id}/messages` | 历史消息 |
| POST | `/api/v1/memory/recall` | 主动召回记忆 |
| POST | `/api/v1/memory/save` | 保存记忆片段 |
| GET  | `/api/v1/apps` | 已注册的 App 列表 |
| GET  | `/api/v1/apps/{appId}/manifest` | App Manifest 详情 |

### 5.3 流式对话数据流

```
POST /api/v1/chat/stream
    │
    ├─ 1. 解析 appId → 加载 App Manifest
    │
    ├─ 2. 发送 capabilities 事件（宣告本次会话可用能力）
    │
    ├─ 3. 发送 soul 事件（若配置了 Soul 定义）
    │
    ├─ 4. 若有活跃 Skill / MCP Prompt：
    │       get_prompt → 注入 system prompt → 发送 skill_active 事件
    │
    ├─ 5. 召回记忆（短期 .md + 长期 Obsidian）
    │       → stage("召回记忆") → memory(snippets)
    │
    ├─ 6. 检索知识库
    │       → stage("检索知识")
    │
    ├─ 7. 若需要 MCP 资源：
    │       resource_read → (MCP call) → resource_content
    │
    ├─ 8. 构建提示词 → 调用 LLM Provider，流式迭代 chunks
    │       ├─ 实时解析 Artifact fence → yield artifact_event
    │       ├─ 实时解析 Think block   → yield think_event
    │       ├─ LLM tool_use 决策      → yield tool_call_event → execute → yield tool_result_event
    │       └─ 普通文本               → yield text_event
    │
    ├─ 9. 完成后：保存消息到 SQLite
    │
    └─ 10. 异步：触发内容提取器，识别可存入记忆的内容
             → 若写入记忆 → yield memory_saved_event
```

---

## 六、数据库 Schema（SQLite）

```sql
-- 会话
CREATE TABLE sessions (
    id          TEXT PRIMARY KEY,
    app_id      TEXT NOT NULL,
    title       TEXT,
    created_at  INTEGER,
    updated_at  INTEGER
);

-- 消息
CREATE TABLE messages (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL,
    role        TEXT NOT NULL,   -- user | assistant | system
    content     TEXT NOT NULL,
    metadata    TEXT,            -- JSON: artifacts, stage_log, tool_calls, etc.
    created_at  INTEGER
);

-- 知识库片段
CREATE TABLE knowledge_chunks (
    id          TEXT PRIMARY KEY,
    app_id      TEXT NOT NULL,
    source_path TEXT,
    content     TEXT NOT NULL,
    embedding   BLOB,
    chunk_index INTEGER,
    created_at  INTEGER
);

-- 记忆条目（短期）
CREATE TABLE memory_items (
    id          TEXT PRIMARY KEY,
    app_id      TEXT,            -- NULL 表示全局
    category    TEXT,            -- preference | fact | project | feedback | decision
    content     TEXT NOT NULL,
    source      TEXT,            -- session_id / manual
    embedding   BLOB,
    created_at  INTEGER
);
```

---

## 七、环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LLM_PROVIDER` | `openai_compatible` | `openai_compatible` \| `mock` |
| `LLM_BASE_URL` | — | OpenAI 兼容 API 地址 |
| `LLM_API_KEY` | — | API 密钥 |
| `LLM_MODEL` | — | 模型名称 |
| `PLATFORM_DATA_DIR` | `~/.llm-platform` | 用户数据根目录 |
| `PLATFORM_APPS_DIR` | `./apps` | App Manifest 目录 |
| `PLATFORM_HOST` | `127.0.0.1` | 后端监听地址 |
| `PLATFORM_PORT` | `8765` | 后端监听端口 |
