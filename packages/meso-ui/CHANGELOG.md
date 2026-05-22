# Changelog

All notable changes to `@meso/ui` will be documented here.
Follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [2.0.0] - 2026-05-20

### Breaking Changes — SSE Protocol (backend authors must update)

The SSE event format changed from flat JSON to a versioned envelope.
Every event now has the shape: `{"type":"…","schema_version":"1.0","payload":{…}}`

| Event | 0.x flat field | 1.0 payload field |
|-------|----------------|-------------------|
| `stage` | `label`, `status` | `payload.name`, `payload.state` |
| `memory` | `items: string[]` | `payload.snippets: [{category,content}]` |
| `think` | `delta`, `done` | `payload.delta`, `payload.done` |
| `text` | `delta` | `payload.delta` |
| `artifact` | `artifactType`, `language`, `delta`, `done` | `payload.id`, `payload.lang`, `payload.delta`, `payload.done` |
| `done` | `{}` | `payload: {}` |
| `error` | `message` | `payload.message`, `payload.code?` |

`schema_version` is required by the spec; the parser tolerates its absence
and treats missing as `"1.0"` during migration.

### Breaking Changes — StreamState shape (React consumers)

| Field (0.x) | Field (2.0) | Notes |
|-------------|-------------|-------|
| `memoryItems: string[]` | `memorySnippets: [{category,content}][]` | Richer structure |
| `artifact: {type,language,content} \| null` | `artifacts: Record<id, {id,lang,content,done}>` | Multi-artifact |
| — | `artifactOrder: string[]` | Insertion order for rendering |
| — | `extensions: Record<name, ExtensionEvent[]>` | Extension lookup by name |
| — | `extensionLog: ExtensionEvent[]` | Arrival-ordered extension log |

Stage items: `{label,status}` → `{name,state}` (aligns protocol with component props).

### Breaking Changes — Build output

`dist/index.js` now coexists with `dist/runtime.js` (React-free).
Import map updated; if you pin to specific dist paths, update them.

### Added

- **SSE Protocol v1.0**: single canonical spec at `docs/streaming-protocol.md`
  with `schema_version` and versioned payload envelope
- **Extension event mechanism**: `type: "extension"` with `payload.name` + `payload.data`
  — third-party backends use this without forking the platform runtime
- **`@meso/ui/runtime`** export — React-free pure functions for custom transports:
  - `parseSSELine(line)` — parses one SSE data line; handles `[DONE]`, bad JSON, comments
  - `applyEvent(state, event)` — pure state machine reducer
  - `createInitialStreamState()` — factory for initial StreamState
- **`MessageList.renderExtension` prop** — render slot for extension events (tool progress,
  confirm gates, business entity cards) without touching platform source
- **Multi-artifact support**: `artifacts: Record<id,…>` + `artifactOrder` allows a
  single response to contain multiple code/HTML/chart panels rendered in order
- **Contract tests**: fixture SSE streams (`src/__fixtures__/*.txt`) → `applyEvent` →
  snapshot comparison; third parties can use these fixtures to validate their backends
- **`PROTOCOL_VERSION`** constant exported from both `@meso/ui` and `@meso/ui/runtime`

### Fixed

- Memory snippets now carry `category` metadata (previously lost as plain strings)
- `applyEvent` test no longer duplicates the implementation — imports from runtime

## [0.2.0] - 2026-05-19

### Breaking Changes

- `useSSEStream`: `start()` parameter changed from `(body?: Record<string, unknown>)` to `(options?: StreamOptions)`.
  Migrate: `start({ query })` → `start({ body: { query } })` or `start({ method: 'POST', body: { query }, headers: { Authorization: 'Bearer sk-...' } })`

### Added

- `useSSEStream`: rewritten with `fetch` + `ReadableStream`
  - Supports POST requests with JSON body
  - Supports custom HTTP headers (Authorization, etc.)
  - New `abort()` return value — stops an in-flight stream gracefully
  - New `StreamOptions` type exported from package
- `ArtifactPanel`: new `onDownload` prop + built-in download button
  - Default behavior: triggers browser file download as `artifact.<ext>`
  - Override with `onDownload` callback for custom handling
- New `MessageList` component — renders a complete multi-turn conversation:
  - Accepts `messages: Message[]` for completed turns
  - Accepts `streaming?: StreamState` for live assistant response
  - Composes `StageTimeline`, `ThinkBlock`, memory chips, `ChatBubble`, `ArtifactPanel`
  - Auto-scrolls to bottom on new content
- Responsive CSS breakpoints in `ThreeColumnLayout`:
  - `≤900px`: session column hidden
  - `≤600px`: sidebar auto-collapsed
- Unit tests via Vitest covering all 7 SSE event type state transitions

### Fixed

- `dist/` committed to git enabling `npm install git+<repo>` without local build step

## [0.1.0] - 2026-05-01

### Added

- Initial release
- Components: `ThreeColumnLayout`, `ChatBubble`, `ThinkBlock`, `StreamingCursor`, `ArtifactPanel`, `StageTimeline`
- Hooks: `useSSEStream` (EventSource-based), `useTheme`
- CSS design token system (`meso-tokens.css`) with light (Plan A) and dark (Plan C) themes
