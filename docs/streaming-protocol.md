# Meso SSE Streaming Protocol — v1.0

**This document is the single source of truth** for the Meso SSE event protocol.
`useSSEStream`, `applyEvent`, `parseSSELine`, and all third-party backend implementations
must conform to this spec. When in doubt, the contract tests in
`packages/meso-ui/src/__fixtures__/` are the machine-verifiable ground truth.

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

### `stage` — Pipeline progress

```json
{
  "type": "stage",
  "schema_version": "1.0",
  "payload": {
    "name": "召回记忆",
    "state": "active"
  }
}
```

| Payload field | Type | Values |
|---------------|------|--------|
| `name` | string | Human-readable stage label (e.g. "召回记忆", "检索知识", "生成回复") |
| `state` | enum | `"active"` \| `"done"` \| `"error"` |

**Dedup rule**: multiple `stage` events with the same `name` upsert in place; the last
state wins. UI orders by first-seen.

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

## 4. Extension Events

Third-party backends use this channel for domain-specific events without forking
the platform runtime. Platform UI surfaces them via `MessageList.renderExtension`.

```json
{
  "type": "extension",
  "schema_version": "1.0",
  "payload": {
    "name": "tool_progress",
    "version": "1.0",
    "data": { "tool": "web_search", "status": "running", "query": "Meso platform" }
  }
}
```

| Payload field | Required | Notes |
|---------------|----------|-------|
| `name` | ✅ | Extension identifier (e.g. `"tool_progress"`, `"confirm_gate"`) |
| `version` | ❌ | Semver for the extension schema itself |
| `data` | ✅ | Arbitrary object; shape is defined by the extension, not the platform |

**State machine behavior**:
- `extensionLog` accumulates all extension events in arrival order (use for sequential rendering)
- `extensions[name]` accumulates per-name (use for lookup)

**Rendering**:
```tsx
<MessageList
  renderExtension={(event) => {
    if (event.payload.name === 'tool_progress') {
      return <ToolProgressCard data={event.payload.data} />
    }
    if (event.payload.name === 'confirm_gate') {
      return <ConfirmGate data={event.payload.data} onConfirm={handleConfirm} />
    }
  }}
/>
```

### Well-known extension names (non-exhaustive, community registry)

| Name | Description |
|------|-------------|
| `tool_progress` | Tool/function call start/done/error |
| `confirm_gate` | Request user confirmation before proceeding |

---

## 5. Typical Event Sequence

```
→ stage    {"name":"召回记忆","state":"active"}
→ stage    {"name":"召回记忆","state":"done"}
→ memory   {"snippets":[{"category":"preference","content":"偏好简洁"}]}
→ stage    {"name":"检索知识","state":"active"}
→ stage    {"name":"检索知识","state":"done"}
→ stage    {"name":"生成回复","state":"active"}
→ think    {"delta":"用户想要…","done":false}
→ think    {"delta":"","done":true}
→ text     {"delta":"根据你的需求，"}
→ artifact {"id":"a1","lang":"python","delta":"def hello():\n","done":false}
→ artifact {"id":"a1","lang":"python","delta":"    print('hi')\n","done":true}
→ text     {"delta":"以上代码实现了打招呼功能。"}
→ stage    {"name":"生成回复","state":"done"}
→ done     {}
```

---

## 6. Error/Done Mutual Exclusion

- A stream MUST end with exactly one of `done` or `error`.
- After either event, the backend MUST close the SSE connection.
- The parser stops processing after the first `done` or `error`.

---

## 7. Migration from 0.x Flat Format

| 0.x flat event | 1.0 envelope equivalent |
|----------------|-------------------------|
| `{"type":"stage","label":"X","status":"active"}` | `{"type":"stage","schema_version":"1.0","payload":{"name":"X","state":"active"}}` |
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

## 8. Contract Tests

The canonical test fixtures live in:
```
packages/meso-ui/src/__fixtures__/
  basic-stream.txt          ← full happy-path SSE stream
  basic-stream.snapshot.json
  extension-stream.txt      ← stream with extension events
  extension-stream.snapshot.json
  error-stream.txt          ← stream terminated by error
  error-stream.snapshot.json
```

Third-party backend authors can validate their output by replaying these fixtures through:
```typescript
import { parseSSELine, applyEvent, createInitialStreamState } from '@meso/ui/runtime'
```

No React required.
