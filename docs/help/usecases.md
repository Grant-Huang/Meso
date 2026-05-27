# 应用场景

Meso 的核心价值：让你专注后端 AI 能力，而不是重新造一遍流式 UI。以下是典型的落地场景，每个场景都只需要实现后端逻辑，前端直接使用 `@meso.ai/ui`。

---

## 场景一：通用对话助手

**最简实现**，后端只需 3 种事件：

```
POST /api/chat
  → text（流式输出正文）
  → done
```

**推荐加入**：
- `stage("思考中", active/done)` — 让用户感知延迟
- `think(delta, done)` — 展示 LLM 推理过程（Chain of Thought 模型）
- `memory(snippets)` — 显示召回的记忆片段

适合：客服机器人、个人助理、通用问答。

---

## 场景二：代码助手

**特色**：代码高亮 + 多 Artifact 面板，一次回复可产出多个代码文件。

```
→ text（解释说明）
→ artifact(id:"main.py", lang:"python", delta:..., done:true)
→ artifact(id:"test.py", lang:"python", delta:..., done:true)
→ done
```

前端自动渲染标签页切换：`ArtifactPanel` 按 `artifactOrder` 显示多个文件。

**推荐加入**：
- `extension("tool_progress", { tool:"search_knowledge", status:"running" })` — 检索相关代码库时展示进度
- `extension("confirm_gate", {...})` — 写入文件前请求用户确认

适合：AI 编程助手、代码审查、自动重构。

---

## 场景三：文档审查与生成

**特色**：输出结构化文档（Markdown / HTML 预览）。

```
→ stage("分析文档结构", active/done)
→ stage("生成审查报告", active/done)
→ artifact(id:"report", lang:"markdown", delta:..., done:true)
→ text（总结性说明）
→ done
```

支持的 Artifact 类型：
- ` ```markdown ` — Markdown 预览
- ` ```html preview ` — HTML 实时预览（沙箱 iframe）
- ` ```artifact:table ` — 表格数据

适合：合同审查、技术文档生成、报告撰写。

---

## 场景四：RAG 知识问答

**特色**：显式展示检索过程，增强用户信任。

```
→ stage("召回记忆", active)
→ memory({ snippets: [{ category:"fact", content:"..." }] })
→ stage("召回记忆", done)
→ stage("检索知识库", active)
→ extension("tool_progress", { tool:"search_knowledge", status:"running", query:"..." })
→ extension("tool_progress", { tool:"search_knowledge", status:"done", result_count:5 })
→ stage("检索知识库", done)
→ stage("生成回复", active)
→ text(delta...)
→ stage("生成回复", done)
→ done
```

App Manifest 配置：

```json
{
  "app_id": "qa-bot",
  "knowledge": [
    { "id": "product-docs", "source": "docs/", "type": "directory" }
  ],
  "tools": ["search_knowledge"],
  "system_prompt": "你是产品文档助手，只回答文档中有明确记载的问题。"
}
```

适合：企业知识库、产品文档助手、技术支持。

---

## 场景五：研究助手（多步推理）

**特色**：多轮工具调用 + 长思考过程。

```
→ think(delta...)   ← LLM 制定研究计划
→ think(done:true)
→ extension("tool_progress", { tool:"search_knowledge", query:"竞品分析" })
→ extension("tool_progress", { tool:"search_knowledge", status:"done" })
→ think(delta...)   ← 分析检索结果
→ think(done:true)
→ artifact(id:"analysis", lang:"markdown", delta:...)
→ done
```

后端实现要点：
- 使用支持多轮 Function Calling 的 LLM（GPT-4o、Claude 3.x）
- 每次工具调用后将结果注入上下文，重新请求 LLM
- `think` 事件在前端自动折叠，不干扰正文阅读

适合：竞品分析、市场调研、学术文献综述。

---

## 场景六：工作流自动化

**特色**：多步骤自动化，关键节点需用户确认。

```
→ stage("解析需求", active/done)
→ stage("生成执行计划", active/done)
→ text（展示计划）
→ extension("confirm_gate", { action:"execute_workflow", message:"即将执行以下操作，是否继续？" })

  ← 用户点击确认 →

→ stage("执行步骤 1/3", active/done)
→ extension("tool_progress", { tool:"write_file", status:"done", path:"output.md" })
→ stage("执行步骤 2/3", active/done)
→ ...
→ stage("完成", done)
→ done
```

设计原则：不可逆操作（写文件、发邮件、调用外部 API）前必须发 `confirm_gate`，由前端 `renderExtension` 渲染确认界面。

适合：CI/CD 自动化、报告定时生成、数据处理流水线。

---

## 场景七：多应用平台

**特色**：同一 Meso 前端承载多个 AI 应用，通过 `AppSidebar` 切换。

每个应用对应一个 App Manifest：

```json
[
  { "app_id": "code-assistant",  "label": "代码助手",   "tools": ["read_file","write_file"] },
  { "app_id": "doc-reviewer",    "label": "文档审查",   "knowledge": [{ "id":"docs" }] },
  { "app_id": "research-helper", "label": "研究助手",   "tools": ["search_knowledge"] }
]
```

前端配置：

```tsx
<ThreeColumnLayout
  appName="My Platform"
  navItems={apps.map(app => ({
    id: app.app_id,
    icon: <AppIcon />,
    label: app.label,
    onClick: () => switchApp(app.app_id)
  }))}
>
  ...
</ThreeColumnLayout>
```

切换应用时：重置会话列表、切换工具集、使用对应系统提示词。

---

## 选择正确的 Artifact 类型

| 内容类型 | Fence 标记 | 渲染方式 |
|---------|-----------|---------|
| 代码（任意语言）| ` ```python ` / ` ```js ` 等 | 语法高亮（highlight.js） |
| HTML 预览 | ` ```html preview ` | 沙箱 iframe 实时渲染 |
| Mermaid 图表 | ` ```mermaid ` | Mermaid.js 渲染 |
| Markdown 文档 | ` ```markdown ` | Markdown 预览 |
| 表格数据 | ` ```artifact:table ` | 表格组件 |

Artifact fence 由后端 LLM 在输出中生成，Meso 前端实时解析并路由到 ArtifactPanel。
