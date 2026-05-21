# 应用插件

Meso 通过 App Manifest 支持多应用模式。

> **实现状态**：App Manifest 是**设计规范**，`manifest.json` 格式和字段语义已定义，前端加载与切换逻辑当前由应用自行实现。平台提供的接入点是：扩展事件（工具调用进度）+ 记忆事件（跨应用记忆）+ CSS token（视觉一致性）。

---

## 什么是"应用"

一个 App = 一种对话人格 + 工具集 + 知识库的组合，通过左侧导航图标切换：

| 应用 | 系统提示方向 | 工具 | 知识库 |
|------|-------------|------|--------|
| 通用对话 | 通用 AI 助手 | — | — |
| 文档审查 | 专业合同分析 | `search_knowledge`, `extract_entities` | legal-templates |
| 代码助手 | 资深工程师 | `run_code`, `search_docs` | engineering-guidelines |
| 数据分析 | 数据科学家 | `query_database`, `plot_chart` | — |

---

## App Manifest 格式

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
    "system_prompt": "你是一个专业的合同审查助手，关注法律风险。",
    "focus_points": [
      {"id": "liability", "name": "责任条款"}
    ]
  },

  "tools": ["search_knowledge", "extract_entities"],

  "knowledge": {
    "enabled": true,
    "index_dirs": ["legal-templates", "company-policies"]
  },

  "memory": {
    "recall_categories": ["preference", "project"],
    "recall_top_k": 5
  }
}
```

---

## 各字段的职责归属

| 字段 | 谁读取 / 执行 | 说明 |
|------|-------------|------|
| `id`, `name`, `icon` | 前端（应用侧）| 展示应用名和图标 |
| `ui.*` | 前端（应用侧）| 控制 Composer placeholder、布局模式等 |
| `skill.system_prompt` | **后端** | 注入到 LLM 请求；前端不读取 |
| `tools[]` | **后端执行**，前端展示 | 后端负责工具调用；前端可在 Composer 展示工具开关 |
| `knowledge.*` | **后端** | 知识库检索逻辑由后端实现 |
| `memory.*` | **后端** | 记忆召回由后端实现；结果通过 `memory` SSE 事件推送前端 |

---

## 前端如何接入 Manifest

应用自行加载 Manifest，使用 `ui.*` 字段控制界面行为：

```typescript
// 加载 Manifest
async function loadApp(appId: string) {
  const manifest = await fetch(`/api/apps/${appId}/manifest`).then(r => r.json())

  setCurrentApp({
    id:                  manifest.id,
    name:                manifest.name,
    composerPlaceholder: manifest.ui?.composer_placeholder ?? '输入消息…',
    splitMode:           manifest.ui?.split_mode_default ?? false,
    sessionColVisible:   manifest.ui?.session_col_visible ?? true,
  })
}

// 在 ThreeColumnLayout 中使用
<ThreeColumnLayout
  appName={currentApp.name}
  navItems={navItems}
  sessionColumn={currentApp.sessionColVisible ? <SessionList /> : null}
>
  <ChatPage composerPlaceholder={currentApp.composerPlaceholder} />
</ThreeColumnLayout>
```

---

## 工具调用：扩展事件

工具执行进度通过扩展事件推送到前端，不需要修改平台代码：

```json
{"type":"extension","schema_version":"1.0","payload":{
  "name": "tool_progress",
  "data": {"tool":"search_knowledge","status":"running","query":"保密条款"}
}}
```

```tsx
<MessageList
  messages={messages}
  streaming={state}
  renderExtension={event => {
    if (event.payload.name === 'tool_progress') {
      const d = event.payload.data as { tool: string; status: string; query?: string }
      return (
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', padding: '4px 0' }}>
          {d.status === 'running' ? `⟳ 正在查询：${d.query}` : `✓ 查询完成`}
        </div>
      )
    }
  }}
/>
```

详见 [扩展事件](#extension)。

---

## 应用切换流程

```
用户点击导航图标
  │
  ├─ 前端（应用侧）做：
  │   fetch('/api/apps/:id/manifest')
  │   更新 composer_placeholder
  │   更新 split_mode、session_col_visible
  │   更新顶栏 appName
  │   恢复或创建新会话
  │
  └─ 后端做（下次请求时）：
      根据 appId 选择对应 system_prompt
      加载对应知识库索引
      使用对应工具集
      记忆召回使用对应 recall_categories
```

---

## 最小 Manifest

所有可选字段均可省略，快速上手：

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
