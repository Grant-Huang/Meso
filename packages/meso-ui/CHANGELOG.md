# Changelog

All notable changes to `@meso/ui` will be documented here.
Follows [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [0.2.0] - 2026-05-19

### Breaking Changes

- `useSSEStream`: `start()` parameter changed from `(body?: Record<string, unknown>)` to `(options?: StreamOptions)`.
  Migrate: `start({ query })` → `start({ body: { query } })` or `start({ method: 'POST', body: { query }, headers: { Authorization: 'Bearer sk-...' } })`

### Added

- `useSSEStream`: rewritten with `fetch` + `ReadableStream`
  - ✅ Supports POST requests with JSON body
  - ✅ Supports custom HTTP headers (Authorization, etc.)
  - ✅ New `abort()` return value — stops an in-flight stream gracefully
  - ✅ New `StreamOptions` type exported from package
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
