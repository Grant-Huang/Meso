# 记忆系统

记忆系统分两层：**平台 API**（已实现，属于 `@meso.ai/ui` 契约）和**后端设计建议**（非规范，由第三方自行实现）。

---

## 平台 API（已实现）

### memory SSE 事件

后端在 SSE 流中发送 `memory` 事件，告知前端本轮召回了哪些记忆片段：

```json
{"type":"memory","schema_version":"1.0","payload":{
  "snippets":[
    {"category":"preference","content":"偏好 TypeScript，arrow functions"},
    {"category":"project","content":"当前项目：Meso，React 18 + Vite"},
    {"category":"fact","content":"用户时区 UTC+8"}
  ]
}}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `snippets` | `MemorySnippet[]` | 整体替换（非增量）。一次对话通常发送一次，在生成正文前 |
| `category` | `string` | 分类标签。内容由后端决定，平台不约束 |
| `content` | `string` | 记忆文本，建议简洁（一句话）|

### Memory Chips UI

收到 `memory` 事件后，`MessageList` 在流式区域顶部自动渲染记忆芯片：

```
[preference] 偏好 TypeScript    [project] Meso · Vite    [fact] UTC+8
```

- 格式：`[category] content`
- 多个芯片横向排列，超出换行
- 平台不在历史消息中重现记忆芯片（只在当前流式轮次显示）

### 在代码中读取记忆数据

```typescript
// streaming.memorySnippets 是 MemorySnippet[] 数组
state.memorySnippets.forEach(s => {
  console.log(`[${s.category}] ${s.content}`)
})

// 流结束后，应用自行决定如何保存记忆信息
useEffect(() => {
  if (state.status === 'done') {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: state.textContent,
      metadata: {
        memoriesUsed: state.memorySnippets,  // 应用自行存储
      },
    }])
    reset()
  }
}, [state.status])
```

### 不需要记忆系统时

不发送 `memory` 事件即可。Memory Chips 区域不会出现，其余功能完全正常。

---

## 后端实现（非规范，参考建议）

以下是一种后端记忆系统的典型设计思路，**不属于平台契约**，实现方式完全由第三方自主决定。

### 整体流程

```
用户发送消息
     ↓
后端召回相关记忆（任意检索策略）
     ↓
发送 memory SSE 事件（片段 → 前端芯片 UI）
     ↓
将记忆注入 system prompt
     ↓
LLM 生成 → 流式输出
     ↓
对话结束后提取新记忆（可选）
```

### 记忆分层参考

| 层次 | 典型存储 | 内容 | 生命周期 |
|------|---------|------|---------|
| 短期记忆 | 内存 / Redis | 当前会话消息历史 + 摘要 | 会话级 |
| 长期记忆 | 向量数据库 / 文件 | 用户偏好、项目事实 | 跨会话持久 |

### 召回策略参考

| 方式 | 算法 | 适用场景 |
|------|------|---------|
| 关键词匹配 | BM25 | 精确事实查询 |
| 语义相似度 | 向量余弦 | 模糊意图理解 |
| 混合排序 | 加权融合 | 通用场景 |

### 推荐的 category 约定

平台不约束 `category` 的值，以下仅为建议：

| category | 含义 |
|---------|------|
| `preference` | 用户偏好（代码风格、语言习惯…）|
| `project` | 当前项目上下文 |
| `fact` | 用户告知的客观事实 |
| `instruction` | 用户给 AI 的长期指令 |

### App Manifest 记忆配置（参考）

如果你的后端支持 App Manifest，可用以下字段控制记忆行为（字段由后端解析，平台不读取）：

```json
{
  "memory": {
    "recallTopK": 5,
    "autoExtract": true,
    "recallCategories": ["preference", "project", "fact"],
    "autoSaveCategory": "fact"
  }
}
```
