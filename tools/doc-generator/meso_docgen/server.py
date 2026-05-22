"""
Meso Doc Generator — FastAPI SSE server.

Exposes POST /generate which streams Meso protocol v1.0 events:
  stage → think → artifact (JSON) → artifact (template) → artifact (html preview) → done

Environment variables:
  LLM_BASE_URL   OpenAI-compatible base URL  (default: https://api.openai.com/v1)
  LLM_API_KEY    API key
  LLM_MODEL      Model name                   (default: gpt-4o-mini)

Run:
  uvicorn meso_docgen.server:app --reload --port 8001
"""

import json
import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel as PydanticModel
from openai import AsyncOpenAI

from .models import DocumentContent, DOCUMENT_SCHEMA_HINT
from .renderer import render, CONTENT_TEMPLATE

app = FastAPI(title="Meso Doc Generator", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROTOCOL_VERSION = "1.0"


def sse(event_type: str, payload: dict) -> str:
    data = json.dumps(
        {"type": event_type, "schema_version": PROTOCOL_VERSION, "payload": payload},
        ensure_ascii=False,
    )
    return f"data: {data}\n\n"


class GenerateRequest(PydanticModel):
    message: str


LLM1_SYSTEM = f"""你是一个文档内容分析专家。根据用户的描述，生成一份标准化的文档内容 JSON。

严格按照以下 Schema 输出，只输出合法的 JSON，不要有 markdown 代码块标记，不要有任何多余文字：

{DOCUMENT_SCHEMA_HINT}"""

LLM2_SYSTEM = """你是一个 Jinja2 模板专家。根据给定的文档 JSON 内容，生成适合渲染该内容的 Jinja2 HTML 模板。

要求：
- 只输出模板的 body 内容（不含 <!DOCTYPE>、<html>、<head>、<body> 标签）
- 使用 Jinja2 语法（{{ variable }}、{% for %}、{% if %}）
- 可用的 CSS 类：
    .doc-header / .doc-title / .doc-subtitle / .doc-meta
    .doc-summary
    .section / .section-heading / .section-content
    .metrics-grid / .metric-card（支持 .up .down .neutral）/ .metric-name / .metric-value
    ul.item-list
    table.kv-table
    .doc-footer
- 变量直接来自文档 JSON 的字段
- 只输出 Jinja2 模板，不要有 markdown 代码块标记"""


def _make_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=os.getenv("LLM_API_KEY", "sk-placeholder"),
        base_url=os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"),
    )


async def _llm(client: AsyncOpenAI, system: str, user: str) -> str:
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    resp = await client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.3,
    )
    return resp.choices[0].message.content or ""


async def _generate(message: str):
    client = _make_client()

    # ── Stage 1: Analyze request ──────────────────────────────────────────────
    yield sse("stage", {"name": "分析需求", "state": "active"})
    yield sse("think", {"delta": "正在理解文档需求，提取关键信息并映射到结构化 Schema…\n", "done": False})

    try:
        content_json_str = await _llm(client, LLM1_SYSTEM, message)
        # Strip markdown fences if LLM wraps output anyway
        content_json_str = content_json_str.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        content_dict = json.loads(content_json_str)
        doc = DocumentContent(**content_dict)
    except Exception as exc:
        yield sse("think", {"delta": "", "done": True})
        yield sse("error", {"message": f"内容结构化失败：{exc}"})
        return

    yield sse("think", {"delta": f"识别到文档类型：{doc.doc_type}，共 {len(doc.sections)} 个章节。\n", "done": True})
    yield sse("stage", {"name": "分析需求", "state": "done"})

    # Emit structured content as JSON artifact
    formatted = json.dumps(content_dict, ensure_ascii=False, indent=2)
    yield sse("artifact", {"id": "structured-content", "lang": "json", "delta": formatted, "done": True})

    await asyncio.sleep(0.05)

    # ── Stage 2: Generate template ────────────────────────────────────────────
    yield sse("stage", {"name": "生成模板", "state": "active"})
    yield sse("think", {"delta": "根据 JSON Schema 结构生成 Jinja2 渲染模板…\n", "done": False})

    try:
        template_str = await _llm(client, LLM2_SYSTEM, f"文档内容：\n{formatted}")
        template_str = template_str.strip().removeprefix("```html").removeprefix("```jinja2").removeprefix("```").removesuffix("```").strip()
    except Exception as exc:
        # Fall back to built-in template
        template_str = CONTENT_TEMPLATE
        yield sse("think", {"delta": f"模板生成失败（{exc}），使用内置模板。\n", "done": True})
    else:
        yield sse("think", {"delta": "Jinja2 模板生成完成。\n", "done": True})

    yield sse("stage", {"name": "生成模板", "state": "done"})
    yield sse("artifact", {"id": "jinja-template", "lang": "jinja2", "delta": template_str, "done": True})

    await asyncio.sleep(0.05)

    # ── Stage 3: Render document ──────────────────────────────────────────────
    yield sse("stage", {"name": "渲染文档", "state": "active"})

    try:
        final_html = render(content_dict, template_str)
    except Exception:
        final_html = render(content_dict, None)  # fall back to built-in

    yield sse("stage", {"name": "渲染文档", "state": "done"})
    yield sse("artifact", {"id": "final-document", "lang": "html preview", "delta": final_html, "done": True})

    section_count = len(doc.sections)
    yield sse("text", {"delta": f"文档《**{doc.title}**》已生成完成，共 {section_count} 个章节。"})
    yield sse("done", {})


@app.post("/generate")
async def generate(req: GenerateRequest):
    return StreamingResponse(
        _generate(req.message),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "meso-doc-generator", "version": "1.0.0"}
