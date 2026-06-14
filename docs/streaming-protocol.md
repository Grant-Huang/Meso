# Meso SSE Streaming Protocol — v1.0

**This document is the single source of truth** for the Meso SSE event protocol.
`useSSEStream`, `applyEvent`, `parseSSELine`, and all third-party backend implementations
must conform to this spec. When in doubt, the contract tests in
`packages/meso-types/src/__fixtures__/` are the machine-verifiable ground truth.

---

## 1. Wire Format

Every SSE event is a single `data:` line followed by a blank line:

```
data: <JSON>\n\n
```

The JSON payload must conform to the standard envelope (§2).

The OpenAI-compatible `[DONE]` sentinel is also accepted:
```
data: [DONE]\n\n
```
`parseSSELine` normalizes `[DONE]` to a `DoneEvent`.

---

## 2. Standard Envelope

```json
{
  "type": "<event_type>",
  "schema_version": "1.0",
  "payload": { ... }
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | string | ✅ | One of the standard event types (§3) or `"extension"` (§4) |
| `schema_version` | `"1.0"` | ✅ | Used for versioned parsing; parser tolerates absence during migration |
| `payload` | object | ✅ | Event-specific fields; never null |

---

## 3. Standard Events

### `capabilities` — Session capability discovery

Sent **once at stream start** to announce all tools, skills, resources, and MCP servers
available in this session. Frontends use this to render skill selectors, tool toggles,
and MCP server panels without hardcoding any app-specific knowledge.

```json
{
  "type": "capabilities",
  "schema_version": "1.0",
  "payload": {
    "tools": [
      { "name": "read_file", "provider": "builtin", "risk": "safe" },
      { "name": "write_file", "provider": "local", "risk": "write" },
      { "name": "web_search", "provider": "mcp", "server": "brave-search", "risk": "safe" }
    ],
    "skills": [
      { "id": "code-review", "name": "代码审查", "provider": "local",
        "focus_points": [{"id": "security", "name": "安全漏洞"}] }
    ],
    "resources": [
      { "uri": "file:///docs/api.md", "name": "API 文档", "server": "fs-server" }
    ],
    "mcp_servers": [
      { "name": "brave-search", "version": "1.2.0",
        "capabilities": ["tools"] },
      { "name": "fs-server", "version": "0.9.1",
        "capabilities": ["resources"] }
    ]
  }
}
```

**CapabilityProvider** values:

| Value | Meaning |
|-------|---------|
| `"builtin"` | Platform built-in (search_knowledge, save_memory, …) |
| `"local"` | App-defined function in the same process |
| `"mcp"` | Served by an MCP (Model Context Protocol) server |
| `"api"` | External REST/gRPC endpoint |

**ToolSpec** fields:

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Tool identifier |
| `description` | string? | Human-readable description |
| `provider` | CapabilityProvider | Who provides this tool |
| `server` | string? | MCP server name when provider = `"mcp"` |
| `risk` | `"safe"` \| `"write"` \| `"destructive"` | UI risk badge and confirm-gate trigger |
| `input_schema` | object? | JSON Schema for input parameters |

**SkillSpec** fields: `id`, `name`, `description?`, `provider?`, `server?`, `focus_points?`

**ResourceSpec** fields: `uri`, `name?`, `description?`, `server?`, `mime_type?`

**MCPServerSpec** fields: `name`, `version?`, `capabilities` (array of `"tools"` | `"resources"` | `"prompts"` | `"sampling"`)

---

### `soul` — Active persona notification

Sent **once at stream start** to announce the active soul (identity/persona). The frontend
renders an avatar chip and can display soul traits. Soul is WHO the assistant is — it is
stable within a session and does not switch.

```json
{
  "type": "soul",
  "schema_version": "1.0",
  "payload": {
    "id": "assistant-v2",
    "name": "Aria",
    "version": "2.1.0",
    "avatar": "https://example.com/aria.png",
    "traits": ["严谨", "好奇", "简洁"]
  }
}
```

| Payload field | Type | Notes |
|---------------|------|-------|
| `id` | string | Stable soul definition identifier |
| `name` | string | Display name shown in UI |
| `version` | string | Semver — bumped when personality changes |
| `avatar` | string? | Avatar URL or data URI |
| `traits` | string[]? | Trait tags for UI display |

---

### `skill_active` — Operational mode activation

Sent when the backend selects or switches the active skill (operational mode). Skill is
HOW the assistant operates — it can switch within a session. Distinct from Soul.

MCP Prompts map directly to this event: the backend calls `get_prompt`, injects the result
into the system prompt, then emits `skill_active` to notify the frontend.

```json
{
  "type": "skill_active",
  "schema_version": "1.0",
  "payload": {
    "id": "code-review",
    "name": "代码审查",
    "version": "1.0",
    "provider": "mcp",
    "server": "review-server",
    "focus": ["security", "performance"],
    "description": "检查安全漏洞和性能问题"
  }
}
```

| Payload field | Type | Notes |
|---------------|------|-------|
| `id` | string | Skill identifier |
| `name` | string | Display name |
| `version` | string? | Skill definition version |
| `provider` | CapabilityProvider? | Who provides the skill |
| `server` | string? | MCP server name when provider = `"mcp"` |
| `focus` | string[]? | Active focus_point ids for this invocation |
| `description` | string? | Short description for UI display |

---

### `phase` — Pipeline progress

```json
{
  "type": "phase",
  "schema_version": "1.0",
  "payload": {
    "id": "recall",
    "name": "召回记忆",
    "state": "running"
  }
}
```

| Payload field | Type | Values |
|---------------|------|--------|
| `id` | string | Stable phase identifier (e.g. `"recall"`, `"search"`, `"generate"`) |
| `name` | string | Human-readable phase label |
| `state` | enum | `"pending"` \| `"running"` \| `"done"` \| `"error"` |
| `body` | string? | Optional JSON string with structured phase output |
| `pinned_think` | string? | Frozen think snapshot when `state` becomes `"done"` |
| `started_at` | number? | Milliseconds timestamp |
| `ended_at` | number? | Milliseconds timestamp |

**Dedup rule**: multiple `phase` events with the same `id` upsert in place; the last
state wins. UI orders by first-seen (`phaseOrder`).

---

### `memory` — Memory recall results

```json
{
  "type": "memory",
  "schema_version": "1.0",
  "payload": {
    "snippets": [
      { "category": "preference", "content": "偏好简洁回答" },
      { "category": "project",    "content": "使用 PostgreSQL 15" }
    ]
  }
}
```

Replaces all previous `memorySnippets` in state — not incremental.
Typically sent once, before generation begins.

---

### `memory_saved` — Memory write confirmation

Sent after the backend successfully persists a memory entry during the session.
The frontend renders a "已记忆" chip to confirm write completion.

```json
{
  "type": "memory_saved",
  "schema_version": "1.0",
  "payload": {
    "id": "mem_abc123",
    "category": "decision",
    "preview": "决定使用 B-tree 索引而非 Hash 索引"
  }
}
```

| Payload field | Type | Notes |
|---------------|------|-------|
| `id` | string | Unique id of the saved memory entry |
| `category` | string | Memory category (preference, fact, decision, …) |
| `preview` | string | Short excerpt for display (≤ 80 chars) |

Multiple `memory_saved` events accumulate in `memorySaved[]` — never replace.

---

### `tool_call` — Tool invocation started

Emitted when the LLM decides to call a tool, **before** execution begins.
The frontend renders a tool card with a spinner and optional confirm gate.

```json
{
  "type": "tool_call",
  "schema_version": "1.0",
  "payload": {
    "id": "tc_001",
    "name": "web_search",
    "args": { "query": "Meso streaming protocol" },
    "risk": "safe",
    "provider": "mcp",
    "server": "brave-search",
    "annotations": {
      "idempotent": true,
      "open_world": true
    }
  }
}
```

| Payload field | Type | Notes |
|---------------|------|-------|
| `id` | string | Unique id scoping this invocation within the response |
| `name` | string | Tool name |
| `args` | object | Tool input arguments |
| `risk` | ToolRisk? | `"safe"` \| `"write"` \| `"destructive"` — triggers confirm gate when not safe |
| `provider` | CapabilityProvider? | Omit for platform built-ins |
| `server` | string? | MCP server name when provider = `"mcp"` |
| `annotations.idempotent` | boolean? | Safe to retry (MCP: idempotentHint) |
| `annotations.open_world` | boolean? | Makes external network calls (MCP: openWorldHint); renders 🌐 |

**Risk → UI behavior**:
- `"safe"` — spinner only, auto-proceeds
- `"write"` — yellow risk badge, auto-proceeds
- `"destructive"` — red risk badge; frontend renders confirm gate, emits `awaiting_confirm` status

---

### `tool_result` — Tool execution completed

```json
{
  "type": "tool_result",
  "schema_version": "1.0",
  "payload": {
    "tool_call_id": "tc_001",
    "output": "Found 3 results: ...",
    "duration_ms": 842
  }
}
```

On failure:
```json
{
  "type": "tool_result",
  "schema_version": "1.0",
  "payload": {
    "tool_call_id": "tc_001",
    "output": "",
    "error": "Connection timeout after 30s",
    "duration_ms": 30012
  }
}
```

| Payload field | Type | Notes |
|---------------|------|-------|
| `tool_call_id` | string | Matches the `id` from the corresponding `tool_call` event |
| `output` | string | Serialized output (stringified JSON, plain text, etc.) |
| `error` | string? | Present only on failure |
| `duration_ms` | number? | Execution duration |

---

### `resource_read` — MCP resource read requested

Emitted when the backend requests an MCP resource. Renders a resource card with spinner.
Resources are distinct from tools: identified by URI, read-only, return structured content.

```json
{
  "type": "resource_read",
  "schema_version": "1.0",
  "payload": {
    "id": "rr_001",
    "uri": "file:///docs/api.md",
    "name": "API 文档",
    "server": "fs-server"
  }
}
```

| Payload field | Type | Notes |
|---------------|------|-------|
| `id` | string | Unique id for correlation with `resource_content` |
| `uri` | string | MCP resource URI |
| `name` | string? | Human-readable resource name |
| `server` | string? | MCP server that serves this resource |

---

### `resource_content` — MCP resource content arrived

```json
{
  "type": "resource_content",
  "schema_version": "1.0",
  "payload": {
    "resource_read_id": "rr_001",
    "contents": [
      { "type": "text", "text": "# API Reference\n\n..." }
    ],
    "duration_ms": 23
  }
}
```

On failure:
```json
{
  "type": "resource_content",
  "schema_version": "1.0",
  "payload": {
    "resource_read_id": "rr_001",
    "contents": [],
    "error": "Resource not found",
    "duration_ms": 5
  }
}
```

**ResourceContentItem** types:

| `type` | Fields | Notes |
|--------|--------|-------|
| `"text"` | `text: string` | Plain text content |
| `"image"` | `data: string`, `mime_type?: string` | Base64-encoded image |
| `"blob"` | `data: string`, `mime_type?: string` | Base64-encoded binary |

---

### `think` — Reasoning text (incremental)

```json
{ "type": "think", "schema_version": "1.0", "payload": { "delta": "用户的问题是", "done": false } }
{ "type": "think", "schema_version": "1.0", "payload": { "delta": "…所以应该", "done": false } }
{ "type": "think", "schema_version": "1.0", "payload": { "delta": "", "done": true } }
```

`delta` is appended to `thinkContent`. `done: true` triggers ThinkBlock auto-collapse.

---

### `text` — Response text (incremental)

```json
{ "type": "text", "schema_version": "1.0", "payload": { "delta": "根据你的需求" } }
```

`delta` is appended to `textContent`.

---

### `artifact` — Code / HTML / Chart (incremental, multi-artifact)

```json
{ "type": "artifact", "schema_version": "1.0", "payload": { "id": "a1", "lang": "python", "delta": "def ", "done": false } }
{ "type": "artifact", "schema_version": "1.0", "payload": { "id": "a1", "lang": "python", "delta": "hello(): pass", "done": true } }
```

| Payload field | Type | Notes |
|---------------|------|-------|
| `id` | string | Identifies the artifact; multiple artifacts per response use distinct ids |
| `lang` | string | Well-known values: `"html preview"`, `"mermaid"`, `"python"`, `"typescript"`, … |
| `delta` | string | Appended to this artifact's content |
| `done` | boolean | `true` on the final chunk; triggers final render / syntax highlight |

Multiple artifacts are rendered in first-seen order (`artifactOrder`).

---

### `done` — Stream ended successfully

```json
{ "type": "done", "schema_version": "1.0", "payload": {} }
```

Mutually exclusive with `error`. After `done`, no further events should be sent.

---

### `error` — Unrecoverable error

```json
{
  "type": "error",
  "schema_version": "1.0",
  "payload": { "message": "上游服务超时", "code": "UPSTREAM_TIMEOUT" }
}
```

| Payload field | Required | Notes |
|---------------|----------|-------|
| `message` | ✅ | Human-readable error message |
| `code` | ❌ | Machine-readable code (e.g. `"RATE_LIMIT"`, `"UPSTREAM_TIMEOUT"`) |

Mutually exclusive with `done`.

---

## 4. Workflow Node Events

`workflow_node` provides **developer-facing, fine-grained observability** for DAG and
workflow execution. It is the per-step signal that backend orchestrators emit through
the existing SSE exit — Meso observes and renders it; the execution engine stays in
the backend.

### Division of responsibility

| Signal | Event | Audience | Granularity examples |
|--------|-------|----------|----------------------|
| Coarse pipeline | `phase` | **Users** | "召回记忆", "搜索网络", "生成回复" |
| Fine steps | `workflow_node` | **Developers** | `intent_router`, `web_search`, `fetch_batch_3` |

The two signals are independent. A backend may emit both, either, or neither.

### Wire format

```json
{
  "type": "workflow_node",
  "schema_version": "1.0",
  "payload": {
    "run_id":     "run-abc123",
    "node_id":    "n_web_search",
    "parent_id":  "n_router",
    "name":       "web_search",
    "state":      "done",
    "started_at": 1700000000000,
    "duration_ms": 312,
    "metadata": {
      "url":   "https://example.com",
      "chars": 4200
    }
  }
}
```

| Payload field | Required | Notes |
|---------------|----------|-------|
| `run_id` | ✅ | Groups all nodes in the same workflow execution |
| `node_id` | ✅ | Unique within the run |
| `parent_id` | ❌ | Parent node id; null or absent = root node |
| `name` | ✅ | Developer-readable node name (e.g. `"web_search"`) |
| `state` | ✅ | `"active"` \| `"done"` \| `"error"` \| `"skipped"` |
| `started_at` | ❌ | Unix ms timestamp when the node started |
| `duration_ms` | ❌ | Wall-clock duration (present on `done`/`error`) |
| `metadata` | ❌ | Arbitrary domain-specific data (input/output summaries, URLs, …) |

### State machine

```
active ──► done
active ──► error
active ──► skipped   (conditional branch bypassed this node)
```

The same `node_id` may arrive multiple times (`active` → `done`). Each event
**upserts** the node; `nodeOrder` does not duplicate.

### State machine behavior

- `workflowRunOrder` accumulates `run_id` values in first-seen order
- `workflowRuns[run_id].nodeOrder` accumulates `node_id` values in first-seen order
- `workflowRuns[run_id].nodes[node_id]` holds the latest state for that node
- A single stream may contain multiple runs (e.g. parallel sub-graphs)

### Rendering

```tsx
import { WorkflowTimeline } from '@meso.ai/ui'

const runs = state.workflowRunOrder.map(id => state.workflowRuns[id])
<WorkflowTimeline runs={runs} />
```

`WorkflowTimeline` is a read-only component. It renders a tree using `nodeOrder`
(arrival order) and `parent_id` depth — no YAML or topology description needed.

---

## 5. Extension Events

Third-party backends use this channel for domain-specific events without forking
the platform runtime. Platform UI surfaces them via `MessageList.renderExtension`.

```json
{
  "type": "extension",
  "schema_version": "1.0",
  "payload": {
    "name": "citation",
    "version": "1.0",
    "data": { "source": "paper-42", "title": "Meso Protocol Overview" }
  }
}
```

| Payload field | Required | Notes |
|---------------|----------|-------|
| `name` | ✅ | Extension identifier (e.g. `"citation"`, `"entity_reference"`) |
| `version` | ❌ | Semver for the extension schema itself |
| `data` | ✅ | Arbitrary object; shape is defined by the extension, not the platform |

**State machine behavior**:
- `extensionLog` accumulates all extension events in arrival order (use for sequential rendering)
- `extensions[name]` accumulates per-name (use for lookup)

**Rendering**:
```tsx
<MessageList
  renderExtension={(event) => {
    if (event.payload.name === 'custom_progress') {
      return <CustomProgressCard data={event.payload.data} />
    }
  }}
/>
```

**When to use extension vs standard events**: Prefer standard events whenever the semantics
match. Use `extension` only for domain-specific events that have no standard equivalent
(e.g. a video generation progress indicator, a custom confirm dialog, a citation panel).

---

## 6. Complete Event Type Reference

| Type | When sent | Frontend effect |
|------|-----------|-----------------|
| `capabilities` | Once at stream start | Populates available tools/skills/resources in UI |
| `soul` | Once at stream start | Shows avatar chip with name and traits |
| `skill_active` | On skill selection/switch | Shows skill badge with provider and focus points |
| `phase` | Each pipeline phase transition | Updates ProcessTrace / StageTimeline |
| `memory` | After recall, before generation | Renders recalled memory chips |
| `memory_saved` | After backend persists a memory | Appends "已记忆" chip |
| `tool_call` | LLM decides to call a tool | Renders ToolCallBlock (spinner + risk badge) |
| `tool_result` | Tool execution completes | Updates ToolCallBlock (check/error + result) |
| `resource_read` | Backend requests MCP resource | Renders ResourceReadBlock (spinner) |
| `resource_content` | MCP resource content arrives | Updates ResourceReadBlock (check/error + content) |
| `think` | Reasoning token (incremental) | Appends to ThinkBlock |
| `text` | Response token (incremental) | Appends to ChatBubble |
| `artifact` | Code/chart/HTML token (incremental) | Appends to ArtifactPanel |
| `workflow_node` | DAG/workflow node status change | Updates WorkflowTimeline tree |
| `done` | Stream ended successfully | Finalizes state, removes streaming cursor |
| `error` | Unrecoverable error | Shows error state |
| `extension` | Domain-specific event | Passed to `renderExtension` callback |

---

## 7. Typical Event Sequences

### Basic session (no tools/MCP)

```
→ capabilities  { tools: [...], skills: [...] }
→ soul          { id: "assistant-v2", name: "Aria", traits: ["严谨"] }
→ skill_active  { id: "general", name: "通用助手" }
→ phase         { id: "recall", name: "召回记忆", state: "running" }
→ phase         { id: "recall", name: "召回记忆", state: "done" }
→ memory        { snippets: [{ category: "preference", content: "偏好简洁回答" }] }
→ phase         { id: "generate", name: "生成回复", state: "running" }
→ think         { delta: "用户想要…", done: false }
→ think         { delta: "", done: true }
→ text          { delta: "根据你的需求，" }
→ artifact      { id: "a1", lang: "python", delta: "def hello():\n", done: false }
→ artifact      { id: "a1", lang: "python", delta: "    print('hi')\n", done: true }
→ phase         { id: "generate", name: "生成回复", state: "done" }
→ memory_saved  { id: "mem_001", category: "fact", preview: "用户正在学习 Python" }
→ done          {}
```

### MCP session (with tools and resources)

```
→ capabilities  { tools: [{name:"web_search",provider:"mcp",server:"brave"}],
                  resources: [{uri:"file:///docs/api.md",server:"fs-server"}],
                  mcp_servers: [{name:"brave",capabilities:["tools"]},
                                {name:"fs-server",capabilities:["resources"]}] }
→ soul          { id: "assistant-v2", name: "Aria" }
→ skill_active  { id: "research", name: "研究模式", provider: "mcp", server: "prompts-server" }
→ resource_read { id: "rr_001", uri: "file:///docs/api.md", server: "fs-server" }
→ resource_content { resource_read_id: "rr_001",
                     contents: [{ type: "text", text: "# API Reference..." }],
                     duration_ms: 18 }
→ tool_call     { id: "tc_001", name: "web_search",
                  args: { query: "latest SSE protocol" },
                  risk: "safe", provider: "mcp", server: "brave",
                  annotations: { open_world: true } }
→ tool_result   { tool_call_id: "tc_001", output: "Found 5 results...", duration_ms: 612 }
→ think         { delta: "Based on the docs and search results…", done: false }
→ think         { delta: "", done: true }
→ text          { delta: "Here is what I found:" }
→ done          {}
```

---

## 7. Error/Done Mutual Exclusion

- A stream MUST end with exactly one of `done` or `error`.
- After either event, the backend MUST close the SSE connection.
- The parser stops processing after the first `done` or `error`.

---

## 8. Migration from 0.x Flat Format

| 0.x flat event | 1.0 envelope equivalent |
|----------------|-------------------------|
| `{"type":"stage","label":"X","status":"active"}` | **Removed in types@2.0** — use `phase` with `state:"running"` |
| `{"type":"memory","items":["a","b"]}` | `{"type":"memory","schema_version":"1.0","payload":{"snippets":[{"category":"","content":"a"},…]}}` |
| `{"type":"think","delta":"x","done":false}` | `{"type":"think","schema_version":"1.0","payload":{"delta":"x","done":false}}` |
| `{"type":"text","delta":"x"}` | `{"type":"text","schema_version":"1.0","payload":{"delta":"x"}}` |
| `{"type":"artifact","artifactType":"code","language":"py","delta":"x","done":false}` | `{"type":"artifact","schema_version":"1.0","payload":{"id":"<unique>","lang":"py","delta":"x","done":false}}` |
| `{"type":"done"}` | `{"type":"done","schema_version":"1.0","payload":{}}` |
| `{"type":"error","message":"x"}` | `{"type":"error","schema_version":"1.0","payload":{"message":"x"}}` |

**`parseSSELine` tolerance**: if `schema_version` is absent, the parser treats the event
as protocol 1.0 and proceeds. This allows gradual backend migration without hard cutover.
However, the flat field names (`label`, `status`, `items`, `artifactType`) are no longer
recognized — backends must use the new payload field names.

---

## 9. Contract Tests

The canonical test fixtures live in:
```
packages/meso-types/src/__fixtures__/
  basic-stream.txt              ← basic happy-path SSE stream
  basic-stream.snapshot.json
  extension-stream.txt          ← stream with extension events
  extension-stream.snapshot.json
  error-stream.txt              ← stream terminated by error
  error-stream.snapshot.json
  tools-stream.txt              ← tool_call + tool_result lifecycle
  tools-stream.snapshot.json
  soul-stream.txt               ← soul + skill_active + memory_saved
  soul-stream.snapshot.json
  mcp-stream.txt                ← full MCP session: capabilities + soul + skill +
                                    resource_read/content + MCP tool_call
  mcp-stream.snapshot.json
```

Third-party backend authors can validate their output by replaying these fixtures through:
```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso.ai/ui/runtime'
```

No React required. The runtime package is also importable as `@meso.ai/ui/runtime` for
zero-React validation scripts.
