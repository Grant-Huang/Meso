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
- `phase(id:"think", state:"running"/"done")` — 让用户感知延迟
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
- `tool_call` + `tool_status` + `tool_result` — 检索代码库时展示标准工具进度
- `tool_call`（`requires_confirm: true`）— 写入文件前由 `ConfirmGate` 请求用户确认

适合：AI 编程助手、代码审查、自动重构。

---

## 场景三：文档审查与生成

**特色**：输出结构化文档（Markdown / HTML 预览）。

```
→ phase(id:"analyze", name:"分析文档结构", running/done)
→ phase(id:"report", name:"生成审查报告", running/done)
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
→ phase(id:"recall", name:"召回记忆", running)
→ memory({ snippets: [{ category:"fact", content:"..." }] })
→ phase(id:"recall", name:"召回记忆", done)
→ phase(id:"search", name:"检索知识库", running)
→ tool_call(name:"search_knowledge", ...)
→ tool_status(status:"running")
→ tool_result(...)
→ phase(id:"search", name:"检索知识库", done)
→ phase(id:"generate", name:"生成回复", running)
→ text(delta...)
→ phase(id:"generate", name:"生成回复", done)
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
→ tool_call(name:"search_knowledge", ...)
→ tool_status(status:"running")
→ tool_result(...)
→ think(delta...)   ← 分析检索结果
→ think(done:true)
→ artifact(id:"analysis", lang:"markdown", delta:...)
→ done
```

后端实现要点：
- 使用支持多轮 Function Calling 的 LLM（GPT-4o、Claude 3.x）
- 每次工具调用后将结果注入上下文，重新请求 LLM

适合：竞品分析、文献综述、市场调研。

---

## 场景六：工作流自动化

**特色**：DAG 工作流节点可视化。

```
→ workflow_node(run_id:"wf-1", node_id:"fetch", state:"active")
→ workflow_node(run_id:"wf-1", node_id:"fetch", state:"done")
→ workflow_node(run_id:"wf-1", node_id:"transform", state:"active")
→ workflow_node(run_id:"wf-1", node_id:"transform", state:"done")
→ text（汇总结果）
→ done
```

`WorkflowTimeline` 自动渲染节点树，含并行分支。

适合：ETL 流水线、审批流、多 Agent 协作。

---

## 场景七：MCP 资源读取

**特色**：展示 MCP 资源读取过程。

```
→ resource_read(uri:"file:///config.json", ...)
→ resource_content(uri:"file:///config.json", content:...)
→ text（基于资源内容的回复）
→ done
```

`ResourceReadBlock` 在 `ProcessTrace` 内展示读取状态与内容摘要。

适合：IDE 插件、配置助手、文件分析。

---

## 设计原则

1. **标准事件优先**：工具进度用 `tool_call`/`tool_status`/`tool_result`，阶段进度用 `phase`
2. **不可逆操作需确认**：`tool_call` 设置 `requires_confirm: true`，前端 `ConfirmGate` 拦截
3. **扩展事件兜底**：仅用于 citation、实体引用等平台未覆盖的业务语义
