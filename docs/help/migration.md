# 升级迁移

本页记录每个 Breaking Change 版本的字段对照表和迁移步骤。

---

## v2.1.0 → v2.1.1（patch）

仅 bug fix，无 API 变更，直接升级即可：

```bash
npm install @meso.ai/ui@2.1.1 @meso.ai/types@1.2.1
```

---

## v2.0.x → v2.1.0（minor，向后兼容）

新增功能，**现有代码无需改动**。本节列出可选接入的新能力。

### 新增：`phase` 事件 + per-phase think 流（@meso.ai/types）

`StreamState` 新增 `phases: Record<string, PhaseRecord>` 和 `phaseOrder: string[]`。
现有使用 `stages` 的代码完全不受影响；`phases` 默认为空对象。

```typescript
// 新字段（原有字段不变）
interface StreamState {
  // ...原有字段...
  phases:     Record<string, PhaseRecord>   // NEW
  phaseOrder: string[]                      // NEW
}

interface PhaseRecord {
  id:           string
  name:         string
  state:        'pending' | 'running' | 'done' | 'error'
  thinkContent: string
  pinnedThink?: string
  body?:        string
  startedAt?:   number
  endedAt?:     number
}
```

按需接入：

```tsx
// 渲染 phases（可选，不接入则忽略）
{state.phaseOrder.map(id => {
  const phase = state.phases[id]
  return (
    <div key={id}>
      <span>{phase.name}</span>
      {phase.thinkContent && (
        <ThinkBlock
          content={phase.thinkContent}
          streaming={phase.state === 'running'}
          pinnedContent={phase.pinnedThink}
        />
      )}
    </div>
  )
})}
```

### 新增：`think.phase_id` 路由（@meso.ai/types）

`ThinkPayload` 新增可选字段 `phase_id?: string`。
无 `phase_id` 的 `think` 事件行为**与之前完全相同**，路由到 `thinkContent`。

### 新增：`tool_call.groupId` / `groupKind`（@meso.ai/types）

`ToolCallPayload` 新增 `groupId?: string` 和 `groupKind?: string`，同时提升到 `ToolCallState`：

```typescript
interface ToolCallState {
  call:       ToolCallPayload
  result?:    ToolResultPayload
  status:     ToolCallStatus
  groupId?:   string   // NEW
  groupKind?: string   // NEW
}
```

按 groupId 分组渲染（可选）：

```typescript
// 按 groupId 分组，未设置的 call 各自独立
const byGroup = state.toolCallOrder.reduce((acc, id) => {
  const key = state.toolCalls[id].groupId ?? id
  ;(acc[key] ??= []).push(id)
  return acc
}, {} as Record<string, string[]>)
```

### 新增：`StatusIcon` 组件（@meso.ai/ui）

```tsx
import { StatusIcon } from '@meso.ai/ui'
<StatusIcon status="running" size={16} />
```

状态：`running | done | error | pending | warning`。

### 新增：`LogLine` 组件（@meso.ai/ui）

```tsx
import { LogLine } from '@meso.ai/ui'
<LogLine status="done" primary="已检索 3 篇文档" outcome="用时 1.2s" detail="详细内容…" />
```

### 新增：`ThinkBlock.pinnedContent` + `ThinkBlock.turnStreaming`（@meso.ai/ui）

```tsx
// pinnedContent：done 后显示冻结快照，防止内容 flash
<ThinkBlock
  content={liveContent}
  streaming={isStreaming}
  pinnedContent={phase.pinnedThink}   // done 后显示此值
/>

// turnStreaming：轮次结束时重置用户折叠意图
<ThinkBlock
  content={state.thinkContent}
  streaming={!state.thinkDone}
  turnStreaming={state.status === 'streaming'}
/>
```

### 新增：`useFoldState` hook（@meso.ai/ui）

```tsx
import { useFoldState } from '@meso.ai/ui'

const { open, toggle, clearIntent } = useFoldState({
  system: isStreaming,       // 系统默认展开/折叠
  resetOnTurnStart: true,    // 新轮次开始时重置用户意图
})
```

### 新增：`useSSEStream` watchdog 超时（@meso.ai/ui）

```typescript
start({ watchdogMs: 60_000 })   // 60 秒无数据则超时
start({ watchdogMs: null })     // 禁用超时
// 默认 120_000 ms（120 秒）
```

超时时 `state.status = 'error'`，`onError` 收到 `code: 'WATCHDOG_TIMEOUT'`。

### 新增：`ProcessTrace.renderStageBody` + `renderToolCall` 插槽（@meso.ai/ui）

```tsx
<ProcessTrace
  stream={state}
  streaming={isStreaming}
  renderStageBody={(stage, streamStage) => {
    // 自定义 stage 下方内容；返回 null/undefined 使用默认
    if (streamStage.name === '检索') return <RetrievalDetail stage={streamStage} />
    return null
  }}
  renderToolCall={(tc) => {
    // 替换默认 ToolCallBlock；返回 null/undefined 使用默认
    if (tc.call.name === 'web_search') return <SearchCard tc={tc} />
    return null
  }}
/>
```

### 新增：设计 token（@meso.ai/ui）

`tokens.css` 新增 `--meso-fs-*` 字体尺寸 scale 和 `--meso-space-*` 间距 scale，均为 stable token：

```css
/* 字体 */
--meso-fs-caption: 12px   /* 角标、执行区 */
--meso-fs-body:    14px   /* 正文 */
--meso-fs-title:   15px   /* 卡片标题 */
--meso-fs-section: 18px   /* 页面区块标题 */

/* 间距（4px 基准）*/
--meso-space-1: 4px  --meso-space-2: 8px  --meso-space-3: 12px
--meso-space-4: 16px --meso-space-5: 20px --meso-space-6: 24px
--meso-indent:  16px
```

完整 token 文档见 [设计系统](#tokens)。

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

## 版本策略

遵循 [SemVer](https://semver.org/)：

| 变更类型 | 版本 bump |
|---------|----------|
| Bug fix，不影响 API / 协议 / CSS token | Patch（x.y.**z**）|
| 新增功能，向后兼容 | Minor（x.**y**.0）|
| Breaking：API 字段、SSE 协议、稳定 CSS 类名、稳定 token | Major（**x**.0.0）|

协议层 Breaking 变更须：
1. 先更新 `docs/streaming-protocol.md`（单一事实来源）
2. 更新契约测试 fixture
3. 发布新版 `@meso.ai/ui` / `@meso.ai/types`

完整变更历史见 [CHANGELOG.md](../packages/meso-ui/CHANGELOG.md)。
