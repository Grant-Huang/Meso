# 记忆系统

> **平台边界说明**：本页分两部分。**§ 平台 API** 是规范性内容（`@meso/ui` 的契约）；**§ 参考实现** 是非规范性示例，仅供参考，第三方可使用任意存储方案。

---

## 平台 API（normative）

### memory SSE 事件

后端发送 `memory` 事件，通知前端本轮召回了哪些记忆片段：

```json
{"type":"memory","schema_version":"1.0","payload":{
  "snippets":[
    {"category":"preference","content":"偏好 TypeScript，arrow functions，2空格缩进"},
    {"category":"project","content":"当前项目：Meso，React 18 + Vite，monorepo"},
    {"category":"fact","content":"用户时区 UTC+8，工作日 10:00–19:00"}
  ]
}}
```

| 字段 | 说明 |
|------|------|
| `snippets` | 数组，整体替换（非增量）。一次对话通常发送一次，在生成正文前 |
| `category` | 分类标签，用于 UI 展示。内容由后端决定，平台不约束 |
| `content` | 记忆文本，建议简洁（一句话）|

### Memory Chips UI

收到 `memory` 事件后，`MessageList` 在流式区域顶部自动渲染记忆芯片：

```
┌────────────────────────────────────────────────────────┐
│  [preference] 偏好 TypeScript  [project] Meso · Vite   │
└────────────────────────────────────────────────────────┘
```

- 芯片格式：`[category] content`
- hover 时展示完整内容（content 过长时截断）
- 多个芯片横向排列，超出换行

### 读取 StreamState 中的记忆数据

```typescript
// 手动访问（不使用 MessageList 时）
state.memorySnippets.forEach(s => {
  console.log(`[${s.category}] ${s.content}`)
})

// 在流结束后保存到历史消息
useEffect(() => {
  if (state.status === 'done') {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: state.textContent,
      metadata: { memoriesUsed: state.memorySnippets },
    }])
    reset()
  }
}, [state.status])
```

---

## 参考实现（non-normative）

以下内容描述一种可行的后端记忆系统实现方式，**不属于平台契约**，仅供参考。

### 记忆分层架构

```
用户发送消息
     ↓
[ 短期记忆召回 ]  当前会话历史 + 摘要
[ 长期记忆召回 ]  跨会话持久化记忆
     ↓ 混合排序（BM25 关键词 + 向量语义）
Top-K 片段注入 system prompt
     ↓
发送 memory SSE 事件 → 前端显示 Memory 芯片
     ↓
LLM 生成 → 流式输出
```

### 短期记忆（会话内）

```json
{
  "id": "sess_abc123",
  "appId": "doc-review",
  "createdAt": "2024-01-15T10:00:00Z",
  "summary": "用户在审查一份劳动合同，重点关注第5条保密条款",
  "messages": [
    {"role": "user",      "content": "帮我看看第5条有没有问题"},
    {"role": "assistant", "content": "第5条保密义务范围较宽…"}
  ]
}
```

- 超过 N 轮后旧消息压缩为摘要
- 会话关闭后保留 30 天（可配置）

### 长期记忆（跨会话）

存储为 Markdown 文件，YAML frontmatter 携带元数据：

```markdown
---
category: preference
created: 2024-01-15
source: session_abc123
---

用户偏好 TypeScript，使用 arrow functions，不喜欢 class 语法。
缩进 2 个空格，文件使用 kebab-case 命名。
```

### 召回策略

| 方式 | 算法 | 参考权重 |
|------|------|---------|
| 关键词匹配 | BM25 | 40% |
| 语义相似度 | 向量余弦相似度 | 60% |

### App Manifest 记忆配置（应用侧）

```json
{
  "memory": {
    "recallTopK": 5,
    "autoExtract": true,
    "recallCategories": ["preference", "project", "fact"],
    "autoSaveCategory": "fact",
    "extractPrompt": "从对话中提取值得长期记住的用户偏好或项目事实，一句话。"
  }
}
```

| 字段 | 说明 |
|------|------|
| `recallTopK` | 每次召回最多返回多少条（默认 5）|
| `autoExtract` | 对话结束后是否自动提取新记忆 |
| `recallCategories` | 只召回指定分类 |
| `autoSaveCategory` | 自动提取的记忆归入此分类 |

---

## 不实现记忆系统时

如果你的后端暂时不需要记忆系统，只需不发送 `memory` 事件即可。Memory Chips 区域不会出现，其余功能完全正常。
