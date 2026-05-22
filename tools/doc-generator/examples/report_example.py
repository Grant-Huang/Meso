"""
Standalone example: generate a market report HTML document
without the FastAPI server, using the Python API directly.

Run:
    cd tools/doc-generator
    pip install -r requirements.txt
    python examples/report_example.py

Output: examples/output/report.html
"""

import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from meso_docgen.models import (
    DocumentContent,
    DocumentSection,
    MetricItem,
    KeyValueItem,
)
from meso_docgen.renderer import render_from_model

# ── Step 1: Structured content (normally produced by LLM 1) ──────────────────

doc = DocumentContent(
    title="2026 年第二季度市场分析报告",
    subtitle="核心业务指标与增长策略",
    author="数据分析组",
    date="2026-04-01",
    doc_type="report",
    summary=(
        "本季度整体营收同比增长 23%，用户留存率有所下滑，"
        "建议重点关注用户激活环节的优化。"
    ),
    sections=[
        DocumentSection(
            heading="核心指标概览",
            content="以下为本季度关键业务数据汇总：",
            metrics=[
                MetricItem(name="核心营收", value="1,200 万", status="up"),
                MetricItem(name="用户留存率", value="68%", status="down"),
                MetricItem(name="新增用户", value="45,320", status="up"),
                MetricItem(name="月活用户", value="128,000", status="neutral"),
            ],
        ),
        DocumentSection(
            heading="业务亮点",
            content="本季度在以下方向取得显著进展：",
            items=[
                "企业客户签约数量同比增长 41%，大客户收入贡献提升至 58%",
                "AI 辅助功能上线，用户平均使用时长增加 18 分钟/天",
                "移动端 DAU 突破 8 万，环比增长 12%",
                "客服满意度评分达 4.7/5，创历史新高",
            ],
        ),
        DocumentSection(
            heading="风险与挑战",
            content="以下问题需要在下季度重点关注：",
            items=[
                "用户留存率下滑 4 个百分点，激活漏斗需要优化",
                "竞品在价格策略上持续施压，需差异化定位",
                "基础设施成本上升 15%，需评估云资源优化方案",
            ],
        ),
        DocumentSection(
            heading="下季度目标",
            key_values=[
                KeyValueItem(key="营收目标", value="1,500 万（同比 +25%）"),
                KeyValueItem(key="用户留存率目标", value="提升至 72%"),
                KeyValueItem(key="重点新功能", value="工作流自动化、批量导出"),
                KeyValueItem(key="重点市场", value="华南区、东南亚试点"),
            ],
        ),
    ],
)

# ── Step 2: Print the structured content (what LLM 1 outputs) ────────────────

print("=== LLM 1 Output (Structured Content JSON) ===")
print(json.dumps(doc.model_dump(), ensure_ascii=False, indent=2))
print()

# ── Step 3: Render using the default template (normally from LLM 2) ──────────

html_output = render_from_model(doc)

output_path = Path(__file__).parent / "output" / "report.html"
output_path.parent.mkdir(exist_ok=True)
output_path.write_text(html_output, encoding="utf-8")

print(f"=== Document Generated ===")
print(f"  File   : {output_path}")
print(f"  Sections: {len(doc.sections)}")
print(f"  Size   : {len(html_output):,} chars")
print(f"\nOpen in browser: file://{output_path.resolve()}")
