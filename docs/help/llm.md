# 模型配置

Meso 不绑定特定 LLM Provider。后端通过环境变量配置模型连接，前端对此透明。

---

## Provider 与 Instance

### Provider（提供商）

LLM API 的接入方式，目前支持两类：

| Provider | 说明 | 配置方式 |
|---------|------|---------|
| `openai_compatible` | OpenAI 兼容 API（包含 Azure OpenAI、本地 Ollama、国产模型等） | `LLM_BASE_URL` + `LLM_API_KEY` |
| `mock` | 本地 mock，固定返回预设文本 | 无需配置，适合纯前端开发 |

### Instance（模型实例）

在同一 Provider 下，可以配置多个模型实例用于不同场景：

```
openai_compatible
├── gpt-4o           # 高质量回复
├── gpt-4o-mini      # 快速 / 低成本
└── claude-3-haiku   # 通过 OpenAI 兼容代理
```

App Manifest 可以为不同应用指定不同实例：

```json
{
  "app_id": "quick-chat",
  "llm_instance": "gpt-4o-mini",
  "system_prompt": "你是一个简短的对话助手。"
}
```

---

## 环境变量配置

```bash
# Provider 类型
LLM_PROVIDER=openai_compatible    # openai_compatible | mock

# OpenAI 兼容 API
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o

# 或者使用本地 Ollama
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=llama3.2
```

### 国产模型（OpenAI 兼容格式）

大多数国产模型提供 OpenAI 兼容接口，直接配置 base URL 即可：

| 模型 | `LLM_BASE_URL` | 备注 |
|------|----------------|------|
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 阿里云灵积 |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | 智谱 AI |
| 月之暗面 Moonshot | `https://api.moonshot.cn/v1` | Kimi |
| DeepSeek | `https://api.deepseek.com` | 支持 DeepSeek-R1 思考模型 |
| 百川 | `https://api.baichuan-ai.com/v1` | 百川智能 |

### Mock Provider

适合纯前端开发，无需后端 API 密钥：

```bash
LLM_PROVIDER=mock
```

Mock Provider 会：
- 按固定延迟发送预设 SSE 事件流
- 模拟 `think`、`text`、`artifact`、`stage` 等所有事件类型
- 不消耗 API 额度

---

## 流式输出参数

控制 LLM 流式响应行为的关键参数：

```python
# 推荐配置（FastAPI 后端示例）
response = await client.chat.completions.create(
    model=LLM_MODEL,
    messages=messages,
    stream=True,           # 必须启用流式
    temperature=0.7,
    max_tokens=4096,
    stream_options={"include_usage": True}  # 用于统计 token 消耗
)
```

### Think（推理）模型支持

部分模型原生支持推理过程输出（如 DeepSeek-R1、Claude 扩展思考）：

```python
# DeepSeek-R1 示例：分离 reasoning_content 和 content
async for chunk in response:
    delta = chunk.choices[0].delta
    if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
        yield sse_event("think", { "delta": delta.reasoning_content })
    if delta.content:
        yield sse_event("text", { "delta": delta.content })
```

对于不原生支持推理输出的模型，可以使用 CoT（Chain of Thought）Prompt 模拟，解析 `<think>...</think>` 标签路由到 `think` 事件。

---

## 平台数据目录

Meso 后端的本地数据存储路径：

```bash
PLATFORM_DATA_DIR=~/.llm-platform    # 默认：用户主目录下
PLATFORM_APPS_DIR=./apps             # App Manifest 目录
PLATFORM_HOST=127.0.0.1             # 后端监听地址
PLATFORM_PORT=8765                   # 后端监听端口
```

目录结构：

```
~/.llm-platform/
├── db/
│   └── meso.db          # SQLite 数据库（会话、消息、知识库）
├── memory/
│   ├── short_term/      # 短期记忆快照（.md 文件）
│   └── long_term/       # 长期记忆（Obsidian vault 格式）
└── embeddings/
    └── cache/           # Embedding 向量缓存
```

---

## 多 Provider 切换（高级）

如需在同一后端实例中支持多个 Provider（如 OpenAI 主力 + 本地 Ollama 备用），在后端实现 Provider 工厂：

```python
def get_provider(app_manifest: AppManifest) -> LLMProvider:
    instance = app_manifest.llm_instance or os.getenv("LLM_MODEL")
    if instance.startswith("ollama:"):
        return OpenAICompatibleProvider(base_url="http://localhost:11434/v1", ...)
    elif instance.startswith("deepseek:"):
        return OpenAICompatibleProvider(base_url="https://api.deepseek.com", ...)
    else:
        return OpenAICompatibleProvider(base_url=os.getenv("LLM_BASE_URL"), ...)
```

平台（`@meso.ai/ui`）对 Provider 实现完全透明，只关心 SSE 事件流。
