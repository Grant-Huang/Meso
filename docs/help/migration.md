# 升级迁移

本页记录每个 Breaking Change 版本的字段对照表和迁移步骤。

---

## v0.x → v2.0.0

这是一次**协议层 + 状态层双重重构**，引入了版本化信封和多 Artifact 支持。

### SSE 事件格式

v0.x 使用扁平 JSON，v1.0 引入版本化信封（`schema_version` + `payload` 包装）：

| v0.x 格式 | v1.0 格式 |
|-----------|-----------|
| `{"type":"stage","label":"召回","status":"active"}` | `{"type":"stage","schema_version":"1.0","payload":{"name":"召回","state":"active"}}` |
| `{"type":"memory","items":["偏好A","偏好B"]}` | `{"type":"memory","schema_version":"1.0","payload":{"snippets":[{"category":"pref","content":"偏好A"},…]}}` |
| `{"type":"think","delta":"…","done":false}` | `{"type":"think","schema_version":"1.0","payload":{"delta":"…","done":false}}` |
| `{"type":"text","delta":"…"}` | `{"type":"text","schema_version":"1.0","payload":{"delta":"…"}}` |
| `{"type":"artifact","artifactType":"code","language":"py","delta":"…","done":false}` | `{"type":"artifact","schema_version":"1.0","payload":{"id":"a1","lang":"py","delta":"…","done":false}}` |
| `{"type":"done"}` | `{"type":"done","schema_version":"1.0","payload":{}}` |
| `{"type":"error","message":"…"}` | `{"type":"error","schema_version":"1.0","payload":{"message":"…","code":"…"}}` |

**stage 字段重命名：**

| v0.x | v1.0 |
|------|------|
| `label` | `payload.name` |
| `status` | `payload.state` |

**memory 结构变化：**

| v0.x | v1.0 |
|------|------|
| `items: string[]` | `payload.snippets: [{category, content}][]` |

**artifact 字段重命名：**

| v0.x | v1.0 |
|------|------|
| `artifactType` | 由 `payload.lang` 推导（`"html preview"` / `"mermaid"` / 其他）|
| `language` | `payload.lang` |
| （无 id）| `payload.id`（必填，支持多 Artifact）|

### StreamState 字段

| v0.x 字段 | v2.0 字段 |
|-----------|-----------|
| `state.text` | `state.textContent` |
| `state.think` | `state.thinkContent` |
| `state.memories` / `memoryItems` | `state.memorySnippets` |
| `state.artifact` (单个) | `state.artifacts` (Record) + `state.artifactOrder` (string[]) |
| `state.stages[n].label` | `state.stages[n].name` |
| `state.stages[n].status` | `state.stages[n].state` |
| （不存在）| `state.extensions` + `state.extensionLog` |
| （不存在）| `state.thinkDone` |

### 迁移步骤

**后端迁移（推荐方式：一次性切换）：**

```python
# v0.x（旧）
yield f"data: {json.dumps({'type':'text','delta':chunk})}\n\n"

# v1.0（新）
yield f"data: {json.dumps({'type':'text','schema_version':'1.0','payload':{'delta':chunk}})}\n\n"
```

**前端迁移（StreamState 字段）：**

```typescript
// v0.x（旧）
<ChatBubble content={state.text} />
<ThinkBlock content={state.think} />
{state.memories.map(m => <Chip>{m}</Chip>)}
<ArtifactPanel content={state.artifact?.content} />
state.stages[n].label
state.stages[n].status

// v2.0（新）
<ChatBubble content={state.textContent} />
<ThinkBlock content={state.thinkContent} streaming={!state.thinkDone} />
{state.memorySnippets.map(s => <Chip>[{s.category}] {s.content}</Chip>)}
{state.artifactOrder.map(id => <ArtifactPanel content={state.artifacts[id].content} />)}
state.stages[n].name
state.stages[n].state
```

### parseSSELine 宽容模式

`parseSSELine` 对缺失 `schema_version` 宽容处理（视为 `"1.0"`），这意味着 v0.x 的后端在**不发 `payload` 包装**的情况下仍能被解析，但 `applyEvent` 会因为找不到 `payload.*` 字段而忽略大部分数据。**建议彻底迁移，不要依赖宽容模式。**

---

## v2.0.x → 未来版本

版本策略遵循 [SemVer](https://semver.org/)：

| 变更类型 | 版本 bump |
|---------|----------|
| Bug fix，不影响 API / 协议 / CSS token | Patch（2.0.x）|
| 新增功能，向后兼容 | Minor（2.x.0）|
| Breaking：API 字段、SSE 协议、稳定 CSS 类名、稳定 token | Major（x.0.0）|

协议层 Breaking 变更须：
1. 先更新 `docs/streaming-protocol.md`（单一事实来源）
2. 更新契约测试 fixture
3. 发布新版 `@meso.ai/ui` / `@meso.ai/types`

完整变更历史见 [CHANGELOG.md](../packages/meso-ui/CHANGELOG.md)。
