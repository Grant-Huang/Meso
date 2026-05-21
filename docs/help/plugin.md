# 应用插件

Meso 通过 App Manifest 支持多应用模式，每个应用有独立的提示词、工具集、知识库配置。

> **平台边界**：平台消费 Manifest 中的 `ui.*` 展示字段；`tools` 的执行逻辑、`knowledge` 的检索逻辑、`skill.system_prompt` 的注入由**第三方后端**实现，平台 UI 不执行任何业务逻辑。

---

## 什么是"应用"

一个 App = 一种对话人格 + 工具集 + 知识库的组合：

| 应用 | 系统提示方向 | 工具 | 知识库 |
|------|-------------|------|--------|
| 通用对话 | 通用 AI 助手 | — | — |
| 文档审查 | 专业文档分析师 | `search_knowledge`, `extract_entities` | legal-templates |
| 代码助手 | 资深工程师 | `run_code`, `search_docs` | engineering-guidelines |
| 数据分析 | 数据科学家 | `query_database`, `plot_chart` | — |

用户点击左侧导航图标切换应用，平台加载对应 Manifest 并更新 UI 配置。

---

## 平台消费 vs 应用实现

| Manifest 字段 | 谁处理 | 说明 |
|--------------|--------|------|
| `ui.composer_placeholder` | **平台**（通过 prop 传给 Composer）| 平台通知应用更新 placeholder |
| `ui.split_mode_default` | **平台** | 控制 ArtifactPanel 默认是否分屏 |
| `ui.session_col_visible` | **平台** | 控制会话列是否默认显示 |
| `skill.system_prompt` | **后端** | 注入到 LLM 请求，平台不读取 |
| `tools` | **后端执行**，平台展示名称 | 平台在 Composer 工具栏展示工具开关 |
| `knowledge` | **后端** | 检索逻辑由后端实现 |
| `memory` | **后端** | 召回逻辑由后端实现 |

---

## App Manifest 结构

```json
{
  "schema_version": "1.0",
  "id": "doc-review",
  "name": "文档审查",
  "icon": "file-search",

  "ui": {
    "composer_placeholder": "上传文档或输入审查要求…",
    "split_mode_default": true,
    "session_col_visible": true
  },

  "skill": {
    "system_prompt": "你是一个专业的合同审查助手，关注法律风险和合规性。",
    "focus_points": [
      {"id": "liability", "name": "责任条款", "prompt": "重点审查责任限制和赔偿条款"},
      {"id": "ip",        "name": "知识产权", "prompt": "关注知识产权归属和授权条款"}
    ]
  },

  "tools": ["search_knowledge", "extract_entities"],

  "knowledge": {
    "enabled": true,
    "index_dirs": ["legal-templates", "company-policies"],
    "chunk_strategy": "structured"
  },

  "memory": {
    "recall_categories": ["preference", "project"],
    "auto_save_category": "fact",
    "recall_top_k": 5
  }
}
```

---

## Manifest 字段说明

### 基础字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `schema_version` | `"1.0"` | Manifest 版本（与 SSE 协议版本独立）|
| `id` | string | URL-safe 唯一标识符，建议 kebab-case |
| `name` | string | 显示名称，用于 UI 标题 |
| `icon` | string | 内置图标集 ID，或 URL |

### `ui` — 展示配置（平台消费）

| 字段 | 类型 | 说明 |
|------|------|------|
| `composer_placeholder` | string | 输入框占位文字，由应用在 Composer 中使用 |
| `split_mode_default` | boolean | 是否默认开启聊天 + Artifact 分屏模式 |
| `session_col_visible` | boolean | 是否默认显示会话列表栏 |

### `tools` — 工具声明

只需在 Manifest 中声明工具 ID，平台在 Composer 工具栏展示开关，执行逻辑全在后端：

```json
"tools": ["search_knowledge", "extract_entities", "my_custom_tool"]
```

工具执行进度通过扩展事件推送前端（见 [扩展事件](#extension)）：

```json
{"type":"extension","schema_version":"1.0","payload":{
  "name":"tool_progress",
  "data":{"tool":"search_knowledge","status":"running","query":"保密条款"}
}}
```

---

## 应用切换：平台做什么 / 应用做什么

```
用户点击导航图标
  │
  ├─ 平台做：
  │   加载 manifest.json
  │   更新 ui.composer_placeholder（通过 callback 通知应用）
  │   更新 ui.split_mode_default（调整布局）
  │   更新 ui.session_col_visible（显示/隐藏会话列）
  │   更新顶栏/侧栏显示的 app.name
  │
  └─ 应用做：
      切换 session 上下文（加载对应 app 的历史会话）
      通知后端当前 appId（在下一次请求中携带）
      重新初始化知识库索引（如有）
      更新 system prompt（通过后端 API）
```

---

## 最小 Manifest（快速上手）

所有可选字段均可省略：

```json
{
  "schema_version": "1.0",
  "id": "my-app",
  "name": "我的应用",
  "icon": "chat",
  "skill": {
    "system_prompt": "你是一个 AI 助手。"
  }
}
```

---

## 前端接入 Manifest

```typescript
// 加载 Manifest 并传递 ui 配置给平台
async function loadApp(appId: string) {
  const manifest = await fetch(`/api/apps/${appId}/manifest`).then(r => r.json())

  setCurrentApp({
    id: manifest.id,
    name: manifest.name,
    composerPlaceholder: manifest.ui?.composer_placeholder ?? '输入消息…',
    splitMode: manifest.ui?.split_mode_default ?? false,
  })
}

// 在 Composer 中使用
<Composer
  placeholder={currentApp.composerPlaceholder}
  onSend={handleSend}
  disabled={state.status === 'streaming'}
/>
```

[应用插件演示](demo:09-plugin.html)
