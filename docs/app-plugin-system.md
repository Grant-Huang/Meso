# 应用插件系统

## 一、核心概念

**一个"应用"= 一个 App Manifest**

平台本身不包含业务逻辑。每个应用通过一个 `manifest.json` 文件声明：
- 使用哪个 **Soul**（身份人格，WHO）
- 用什么 **Skill**（操作模式，HOW）
- 挂载哪些**知识库**（Knowledge）
- 可以调用哪些**工具**（Tools）
- 连接哪些 **MCP 服务器**（工具/资源/提示词）
- 特有的 **UI 扩展**（如额外菜单项、自定义 Artifact 类型）

```
apps/
├── chat-assistant/           # 通用对话助手
│   └── manifest.json
├── doc-reviewer/             # 文档审查
│   ├── manifest.json
│   ├── souls/
│   │   └── reviewer.json     # Soul 定义
│   ├── skills/
│   │   └── review-domain.md  # Skill 提示词模板
│   └── knowledge/
│       └── (indexed docs)
└── code-assistant/           # 代码助手
    └── manifest.json
```

---

## 二、Soul vs Skill 的区别

这两个概念容易混淆，需要明确区分：

| 维度 | Soul | Skill |
|------|------|-------|
| **语义** | WHO——这个助手是谁 | HOW——这个助手此刻如何运作 |
| **稳定性** | 会话内固定，通常对应一个 App | 可以在会话中切换 |
| **内容** | 名字、头像、性格特质 | 操作模式、任务焦点、提示词注入 |
| **SSE 事件** | `soul` | `skill_active` |
| **UI 表现** | 头像 chip + 特质标签 | 技能徽章 + 焦点标签 |
| **MCP 映射** | — | MCP Prompts → `skill_active` |

**示例**：一个"代码审查"App 可能：
- Soul: "Aria"（严谨、好奇、简洁的代码专家人格）
- Skill: "安全审查"或"性能审查"（根据用户选择的焦点切换）

---

## 三、App Manifest 格式

`apps/{app_id}/manifest.json`

```json
{
  "schema_version": "1.0",
  "id": "doc-reviewer",
  "name": "文档审查",
  "description": "基于知识库和审查规则的文档智能审查",
  "icon": "FileSearchOutlined",
  "version": "1.0.0",

  "ui": {
    "artifact_types": ["markdown", "table"],
    "composer_placeholder": "描述要审查的问题，或上传文档后直接发送...",
    "session_col_visible": true,
    "split_mode_default": true
  },

  "soul": {
    "id": "reviewer-soul",
    "name": "文档专家",
    "version": "1.0.0",
    "traits": ["严谨", "细致", "客观"]
  },

  "skill": {
    "id": "doc-review",
    "name": "文档审查",
    "system_prompt_file": "skills/review-domain.md",
    "focus_points": [
      {
        "id": "completeness",
        "name": "完整性检查",
        "prompt": "检查文档是否覆盖所有必要章节..."
      },
      {
        "id": "consistency",
        "name": "一致性检查",
        "prompt": "检查文档内部表述是否一致..."
      }
    ]
  },

  "knowledge": {
    "enabled": true,
    "index_dirs": [],
    "chunk_strategy": "structured",
    "chunk_size": 800
  },

  "tools": [
    "read_file",
    "search_knowledge",
    "extract_findings"
  ],

  "mcp": {
    "servers": [
      {
        "name": "fs-server",
        "transport": "stdio",
        "command": "npx @modelcontextprotocol/server-filesystem /docs",
        "capabilities": ["resources"]
      },
      {
        "name": "brave-search",
        "transport": "stdio",
        "command": "npx @modelcontextprotocol/server-brave-search",
        "capabilities": ["tools"],
        "env": { "BRAVE_API_KEY": "${BRAVE_API_KEY}" }
      }
    ]
  },

  "memory": {
    "recall_categories": ["preference", "fact", "project"],
    "auto_save_category": "fact"
  }
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 必填 | 唯一标识，用于路由和数据隔离 |
| `name` | 必填 | 显示名称（侧栏菜单） |
| `icon` | — | Ant Design 图标名 |
| `ui.split_mode_default` | — | 默认是否开启 60/40 分屏 |
| `ui.artifact_types` | — | 此 App 可能产出的 Artifact 类型 |
| `soul` | — | Soul 定义（内联）或引用文件 |
| `skill.system_prompt_file` | — | 相对于 manifest.json 的路径 |
| `skill.focus_points` | — | 可选的焦点列表（用户在 Composer 选择） |
| `knowledge.index_dirs` | — | 相对路径列表，平台会索引这些目录 |
| `tools` | — | 引用 platform tools registry 中的 tool id |
| `mcp.servers` | — | MCP 服务器列表，平台负责连接和代理 |
| `memory.recall_categories` | — | 召回时过滤的记忆类别 |

---

## 四、Soul（人格定义）

Soul 定义可以内联在 manifest 中，也可以引用独立文件：

`apps/doc-reviewer/souls/reviewer.json`

```json
{
  "id": "reviewer-soul",
  "name": "文档专家",
  "version": "1.0.0",
  "avatar": "/assets/reviewer-avatar.png",
  "traits": ["严谨", "细致", "客观"],
  "system_prompt_prefix": "你是一位专业的文档审查专家，以严谨和客观著称。"
}
```

后端在每次流式响应开始时发送 `soul` 事件，前端渲染头像 chip。

---

## 五、Skill（提示词模板）

Skill 文件为 Markdown 格式，支持模板变量：

`apps/doc-reviewer/skills/review-domain.md`

```markdown
# 文档审查助手

你是一个专业的文档审查专家。

## 审查原则
- 检查文档的完整性、一致性和准确性
- 发现问题时给出具体的位置和改进建议
- 使用 [HIGH] / [MEDIUM] / [LOW] 标注问题严重程度

{{#if focus_points}}
## 本次审查重点
{{#each focus_points}}
- **{{name}}**：{{prompt}}
{{/each}}
{{/if}}

{{#if knowledge_snippets}}
## 参考知识
{{knowledge_snippets}}
{{/if}}
```

模板变量由 `prompt_builder.py` 在运行时填充：

| 变量 | 来源 |
|------|------|
| `{{focus_points}}` | 用户在 Composer 选择的焦点 |
| `{{knowledge_snippets}}` | 知识库召回结果 |
| `{{memory_snippets}}` | 记忆系统召回结果 |
| `{{open_findings}}` | 本会话已发现的问题列表 |

Skill 提示词注入后，后端发送 `skill_active` SSE 事件，前端渲染技能徽章。

---

## 六、MCP 集成

MCP（Model Context Protocol）服务器在 App Manifest 中声明后，平台负责连接和代理。
三种 MCP 能力类型映射到不同的 SSE 事件：

| MCP 能力 | 平台事件 | 说明 |
|----------|----------|------|
| Tools | `tool_call` + `tool_result` | LLM 调用 MCP 工具 |
| Resources | `resource_read` + `resource_content` | 读取 MCP 资源（文档/数据） |
| Prompts | `skill_active` | MCP 提示词 → 注入 system prompt → 发技能信号 |
| Sampling | （后端处理，不透传前端）| LLM 采样请求由后端代理 |

所有可用能力在流式开始时通过 `capabilities` 事件一次性宣告，前端据此渲染能力面板。

---

## 七、知识库（Knowledge）

### 索引流程

```
App 启动 / 用户触发重建索引
    ↓
扫描 knowledge.index_dirs 下的文档
    ↓
文件类型识别：
  .md / .txt    → 直接读取
  .pdf / .docx  → 调用 markitdown 转换
    ↓
按 chunk_strategy 切片（blank / structured）
    ↓
（可选）调用 embedding 模型生成向量
    ↓
写入 SQLite knowledge_chunks 表
```

### 检索

用户发送消息时，从 `knowledge_chunks` 中检索：
- BM25 关键词匹配（始终启用）
- 向量相似度（仅配置了 embedding 时启用）
- 结果注入 system prompt 的 `{{knowledge_snippets}}`

---

## 八、Tools（工具）

### 平台内置 Tools

| Tool ID | 说明 | 风险 |
|---------|------|------|
| `read_file` | 读取指定路径的文件内容 | safe |
| `search_knowledge` | 在当前 App 的知识库中搜索 | safe |
| `save_memory` | 将指定内容写入记忆系统 | write |
| `extract_findings` | 从当前对话中提取结构化发现 | safe |
| `write_file` | 写入文件（需显式权限） | write |

### 自定义 Tools

App 可在 `apps/{app_id}/tools/` 目录下添加自定义 Tool：

```python
# apps/doc-reviewer/tools/export_docx.py

TOOL_SPEC = {
    "id": "export_docx",
    "name": "导出 Word 文档",
    "description": "将审查结果导出为 .docx 格式",
    "risk": "write",
    "parameters": {
        "findings": {"type": "array", "description": "发现的问题列表"},
        "output_path": {"type": "string", "description": "输出路径"}
    }
}

async def execute(findings: list, output_path: str) -> dict:
    # 实现导出逻辑
    ...
    return {"success": True, "path": output_path}
```

平台在启动时扫描并注册所有 App 的自定义 Tools。

---

## 九、App 切换行为

切换 App 时，平台执行：

1. 保存当前 App 的 Composer 状态（选中的知识库 / 焦点）
2. 加载新 App 的 manifest
3. 断开旧 App 的 MCP 服务器连接，建立新连接
4. 更新 Composer 工具栏（知识库按钮 / 焦点选择器是否显示）
5. 切换 SessionColumn 显示新 App 的会话历史
6. 若新 App `ui.split_mode_default: true` 且存在历史 Artifact，恢复分屏布局

会话数据按 `app_id` 隔离，各 App 互不干扰。
