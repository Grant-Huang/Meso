from __future__ import annotations
from typing import Any
from pydantic import BaseModel


class MetricItem(BaseModel):
    name: str
    value: str
    status: str = "neutral"  # up | down | neutral


class KeyValueItem(BaseModel):
    key: str
    value: str


class DocumentSection(BaseModel):
    heading: str
    content: str = ""
    items: list[str] = []
    metrics: list[MetricItem] = []
    key_values: list[KeyValueItem] = []
    subsections: list[DocumentSection] = []


DocumentSection.model_rebuild()


class DocumentContent(BaseModel):
    title: str
    subtitle: str | None = None
    author: str | None = None
    date: str | None = None
    doc_type: str = "report"  # report | invoice | brief | memo
    summary: str | None = None
    sections: list[DocumentSection] = []
    metadata: dict[str, Any] = {}


# JSON Schema hint for LLM 1 system prompt
DOCUMENT_SCHEMA_HINT = """{
  "title": "文档标题（必填）",
  "subtitle": "副标题（可选）",
  "author": "作者（可选）",
  "date": "日期，YYYY-MM-DD（可选）",
  "doc_type": "report | invoice | brief | memo",
  "summary": "文档摘要，1-2句话（可选）",
  "sections": [
    {
      "heading": "章节标题",
      "content": "章节正文内容",
      "items": ["列表项1", "列表项2"],
      "metrics": [
        {"name": "指标名", "value": "指标值", "status": "up|down|neutral"}
      ],
      "key_values": [
        {"key": "字段名", "value": "字段值"}
      ],
      "subsections": []
    }
  ],
  "metadata": {}
}"""
