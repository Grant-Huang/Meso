from jinja2 import Environment, BaseLoader
from .models import DocumentContent

# HTML shell: provides CSS tokens and base layout
BASE_SHELL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ title }}</title>
  <style>
    :root {
      --color-text: #1a1a1a;
      --color-text-secondary: #4b5563;
      --color-text-muted: #9ca3af;
      --color-bg: #ffffff;
      --color-border: #e5e7eb;
      --color-accent: #527c5e;
      --color-accent-dark: #3d6b52;
      --color-accent-light: #f0f4f1;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-text);
      background: var(--color-bg);
      padding: 40px 48px;
      max-width: 900px;
      margin: 0 auto;
    }
    /* Header */
    .doc-header {
      border-bottom: 2px solid var(--color-accent);
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .doc-title {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-accent-dark);
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .doc-subtitle {
      font-size: 15px;
      color: var(--color-text-secondary);
      margin-bottom: 10px;
    }
    .doc-meta {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: var(--color-text-muted);
    }
    /* Summary block */
    .doc-summary {
      background: var(--color-accent-light);
      border-left: 3px solid var(--color-accent);
      padding: 14px 18px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 32px;
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.65;
    }
    /* Sections */
    .section { margin-bottom: 32px; }
    .section-heading {
      font-size: 16px;
      font-weight: 650;
      color: var(--color-text);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
    }
    .section-content {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }
    /* Metrics grid */
    .metrics-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
    }
    .metric-card {
      flex: 1;
      min-width: 130px;
      background: #f9fafb;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 14px 16px;
      border-top: 2px solid var(--color-border);
    }
    .metric-card.up   { border-top-color: #22c55e; }
    .metric-card.down { border-top-color: #ef4444; }
    .metric-name  { font-size: 12px; color: var(--color-text-muted); margin-bottom: 6px; }
    .metric-value { font-size: 22px; font-weight: 700; color: var(--color-text); }
    .metric-card.up   .metric-value { color: #16a34a; }
    .metric-card.down .metric-value { color: #dc2626; }
    /* List */
    ul.item-list { padding-left: 18px; margin-top: 8px; }
    ul.item-list li { margin-bottom: 6px; color: var(--color-text-secondary); }
    /* Key-value table */
    table.kv-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    table.kv-table td { padding: 9px 12px; border: 1px solid var(--color-border); }
    table.kv-table td:first-child {
      font-weight: 600;
      width: 32%;
      background: #f9fafb;
      color: var(--color-text);
    }
    table.kv-table td:last-child { color: var(--color-text-secondary); }
    /* Subsection */
    .subsection { margin-left: 0; margin-top: 20px; }
    .subsection .section-heading { font-size: 14px; color: var(--color-text-secondary); }
    /* Footer */
    .doc-footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border);
      font-size: 12px;
      color: var(--color-text-muted);
      text-align: center;
    }
  </style>
</head>
<body>
"""

# Default body template — renders DocumentContent.model_dump()
CONTENT_TEMPLATE = """
<div class="doc-header">
  <div class="doc-title">{{ title }}</div>
  {% if subtitle %}<div class="doc-subtitle">{{ subtitle }}</div>{% endif %}
  <div class="doc-meta">
    {% if author %}<span>作者：{{ author }}</span>{% endif %}
    {% if date %}<span>日期：{{ date }}</span>{% endif %}
    <span>类型：{{ doc_type }}</span>
  </div>
</div>

{% if summary %}
<div class="doc-summary">{{ summary }}</div>
{% endif %}

{% for section in sections %}
<div class="section">
  <div class="section-heading">{{ section.heading }}</div>

  {% if section.content %}
  <div class="section-content">{{ section.content }}</div>
  {% endif %}

  {% if section.metrics %}
  <div class="metrics-grid">
    {% for m in section.metrics %}
    <div class="metric-card {{ m.status }}">
      <div class="metric-name">{{ m.name }}</div>
      <div class="metric-value">{{ m.value }}</div>
    </div>
    {% endfor %}
  </div>
  {% endif %}

  {% if section.items %}
  <ul class="item-list">
    {% for item in section.items %}
    <li>{{ item }}</li>
    {% endfor %}
  </ul>
  {% endif %}

  {% if section.key_values %}
  <table class="kv-table">
    {% for kv in section.key_values %}
    <tr><td>{{ kv.key }}</td><td>{{ kv.value }}</td></tr>
    {% endfor %}
  </table>
  {% endif %}

  {% for sub in section.subsections %}
  <div class="subsection">
    <div class="section-heading">{{ sub.heading }}</div>
    {% if sub.content %}<div class="section-content">{{ sub.content }}</div>{% endif %}
    {% if sub.items %}
    <ul class="item-list">{% for item in sub.items %}<li>{{ item }}</li>{% endfor %}</ul>
    {% endif %}
    {% if sub.key_values %}
    <table class="kv-table">
      {% for kv in sub.key_values %}<tr><td>{{ kv.key }}</td><td>{{ kv.value }}</td></tr>{% endfor %}
    </table>
    {% endif %}
  </div>
  {% endfor %}
</div>
{% endfor %}

<div class="doc-footer">由 Meso Doc Generator 生成</div>
</body>
</html>
"""


def render(content: dict, template_str: str | None = None) -> str:
    """Render a document from content dict and optional Jinja2 template string.

    If template_str is None, the built-in CONTENT_TEMPLATE is used.
    If template_str starts with '<!DOCTYPE', it's treated as a full HTML template.
    Otherwise, it's wrapped in BASE_SHELL as a body-only template.
    """
    env = Environment(loader=BaseLoader(), autoescape=False)

    if template_str is None:
        full_template = BASE_SHELL + CONTENT_TEMPLATE
    elif template_str.lstrip().startswith("<!DOCTYPE") or template_str.lstrip().startswith("<html"):
        full_template = template_str
    else:
        full_template = BASE_SHELL + template_str

    template = env.from_string(full_template)
    return template.render(**content)


def render_from_model(doc: DocumentContent, template_str: str | None = None) -> str:
    return render(doc.model_dump(), template_str)
