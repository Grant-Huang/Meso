# 文档生成器（Doc Generator）

Meso Doc Generator 是一个独立的 Python 工具，实现**数据与样式分离**的文档生成架构：

- **LLM 1** 把原始需求转换为标准化 JSON 内容
- **LLM 2** 读取 JSON Schema 生成 Jinja2 渲染模板
- **渲染引擎** 把内容与模板合并输出 HTML 文档

工具通过 FastAPI 暴露 SSE 接口，与 Meso 前端**松耦合接入**——每个步骤的中间产物均以标准 `artifact` 事件流式推送，前端直接用 `ArtifactPanel` 渲染，无需额外 UI 改造。

---

## 工具目录结构

```
tools/doc-generator/
├── meso_docgen/
│   ├── __init__.py
│   ├── models.py       # Pydantic 内容 Schema
│   ├── renderer.py     # Jinja2 渲染引擎
│   └── server.py       # FastAPI SSE 服务
├── examples/
│   └── report_example.py   # 独立运行示例
└── requirements.txt
```

---

## 快速开始

### 1. 安装依赖

```bash
cd tools/doc-generator
pip install -r requirements.txt
```

### 2. 运行独立示例（无需 LLM）

```bash
python examples/report_example.py
# 输出：examples/output/report.html
```

### 3. 启动 SSE 服务

```bash
# 配置 LLM（任何 OpenAI 兼容接口）
export LLM_BASE_URL=https://api.openai.com/v1
export LLM_API_KEY=sk-...
export LLM_MODEL=gpt-4o-mini

uvicorn meso_docgen.server:app --reload --port 8001
```

### 4. 发送请求

```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "生成一份2026年Q2市场分析报告，包含营收、留存率等核心指标"}'
```

---

## SSE 事件流

一次 `/generate` 请求会按顺序推送以下 Meso 协议事件：

```
stage: 分析需求 (active)
think: delta...          ← LLM 1 推理过程
stage: 分析需求 (done)
artifact: json           ← 结构化内容 JSON
stage: 生成模板 (active)
think: delta...          ← LLM 2 推理过程
stage: 生成模板 (done)
artifact: jinja2         ← Jinja2 渲染模板
stage: 渲染文档 (active)
stage: 渲染文档 (done)
artifact: html preview   ← 最终文档（iframe 预览）
text: delta...           ← 完成提示
done
```

Meso 前端的 `useSSEStream` + `MessageList` 开箱即用，`ArtifactPanel` 会自动处理：
- `lang: "json"` → 语法高亮代码块
- `lang: "jinja2"` → 语法高亮代码块
- `lang: "html preview"` → 沙箱 iframe 预览

---

## 接入 Meso 前端

前端无需任何修改，直接把 `useSSEStream` 指向文档生成器的地址即可：

```tsx
import { useSSEStream, MessageList } from '@meso/ui'

const { state, start } = useSSEStream('http://localhost:8001/generate')

// 用户提交
start({
  method: 'POST',
  body: { message: userInput },
})

// 渲染
<MessageList
  messages={completedMessages}
  streaming={state.status !== 'idle' ? state : undefined}
/>
```

生成完成后，`state.artifacts['final-document'].content` 即为最终 HTML 字符串，可直接用于下载或持久化。

---

## 数据模型（Pydantic Schema）

LLM 1 的输出经过 Pydantic 校验，确保结构完整：

```python
class DocumentContent(BaseModel):
    title: str
    subtitle: str | None = None
    author: str | None = None
    date: str | None = None
    doc_type: str = "report"   # report | invoice | brief | memo
    summary: str | None = None
    sections: list[DocumentSection] = []

class DocumentSection(BaseModel):
    heading: str
    content: str = ""
    items: list[str] = []                 # 无序列表
    metrics: list[MetricItem] = []        # 指标卡片
    key_values: list[KeyValueItem] = []   # 键值表格
    subsections: list[DocumentSection] = []

class MetricItem(BaseModel):
    name: str
    value: str
    status: str = "neutral"   # up | down | neutral
```

---

## 直接使用渲染引擎

无需启动服务，直接调用 Python API：

```python
from meso_docgen import DocumentContent, render_from_model

doc = DocumentContent(
    title="产品发布简报",
    doc_type="brief",
    summary="版本 2.1 正式发布，新增工作流自动化和批量导出功能。",
    sections=[...]
)

html = render_from_model(doc)
open("output.html", "w").write(html)
```

使用自定义 Jinja2 模板（由 LLM 2 生成）：

```python
from meso_docgen import render

template = """
<div class="doc-header">
  <div class="doc-title">{{ title }}</div>
</div>
{% for section in sections %}
<div class="section">
  <div class="section-heading">{{ section.heading }}</div>
  <div class="section-content">{{ section.content }}</div>
</div>
{% endfor %}
<div class="doc-footer">由 Meso Doc Generator 生成</div>
"""

html = render(doc.model_dump(), template)
```

---

## 扩展：支持更多输出格式

当前版本支持 HTML（通过 Jinja2）。后续格式路线图：

| 格式 | 工具 | 状态 |
|------|------|------|
| HTML | Jinja2 | ✅ 已支持 |
| PDF  | WeasyPrint / Puppeteer | 计划中 |
| Docx | python-docx / Docxtemplater | 计划中 |

PDF 生成可在渲染 HTML 后追加一步：

```python
# 计划中
from weasyprint import HTML
HTML(string=html_content).write_pdf("output.pdf")
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LLM_BASE_URL` | `https://api.openai.com/v1` | OpenAI 兼容接口地址 |
| `LLM_API_KEY` | `sk-placeholder` | API 密钥 |
| `LLM_MODEL` | `gpt-4o-mini` | 模型名称 |

支持所有 OpenAI 兼容提供商：OpenAI、Azure、Ollama、DeepSeek、Qwen、GLM 等（参见 [LLM 配置](./llm.md)）。
