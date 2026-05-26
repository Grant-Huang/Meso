# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [@meso/ui] 2.0.2 · [@meso/types] 1.0.1 — 2026-05-26

### ADDED

- `publishConfig.access: "public"` in both packages — scoped packages now publish correctly with `pnpm publish --access public`
- `.github/workflows/ci.yml` — PR/push CI: build → test → pack smoke test (installs tarball into clean Vite project and verifies imports resolve)
- `.github/workflows/release.yml` — tag-triggered: build → test → `pnpm publish` to npm → upload tarballs to GitHub Release
- `docs/consuming.md` — installation guide covering npm/tarball/file: methods, anti-patterns, and troubleshooting
- README: `pnpm add` command alongside `npm install`; note against `github:#path:` installs

---

---

## [@meso/ui] 2.0.1 · [@meso/types] 1.1.0 — 2026-05-24

### ADDED

- `isCompatibleVersion(ev)` — returns `false` when `schema_version` major differs from runtime; safe to call on every received event
- `assertCompatibleVersion(ev)` — throws with a descriptive message on version mismatch; use at the transport boundary for hard guarantees
- `stagePayloadToStage(payload, id)` — official bridge from `StagePayload` (protocol) to `Stage` (UI component); eliminates per-consumer mapping boilerplate
- `StageStatus` now includes `'error'`; `<StageTimeline>` renders error stages with a red ✕ icon and `--color-error` styling
- `@meso/ui` exports `"./style.css": "./dist/style.css"` — consumers can now write `import '@meso/ui/style.css'` instead of the internal dist path

### CHANGED

- `@meso/types` promoted from `dependencies` to `peerDependencies` in `meso-ui/package.json`; consumers using `file:` paths must declare both packages explicitly (see README → Monorepo 外消费)
- Package manager migrated from npm to pnpm; lockfile is now `pnpm-lock.yaml`

---

## [@meso/ui] 2.0.0 · [@meso/types] 1.0.0 — initial release

### BREAKING (vs. pre-release)

- `StreamState.memoryItems: string[]` → `memorySnippets: MemorySnippet[]` — richer memory objects replace flat strings
- `StreamState.artifact` (single) → `artifacts: Record<string, ArtifactState>` + `artifactOrder: string[]` — supports multiple concurrent artifacts
- `StagePayload` field `status` renamed to `state`

### ADDED

- `@meso/ui`: `ThreeColumnLayout`, `MessageList`, `ChatBubble`, `StageTimeline`, `ArtifactPanel`, `ThinkBlock`, `ToolCallBlock`, `SkillIndicator`, `ResourceReadBlock`, `ConfirmGate`, `SoulIndicator`, `StreamingCursor`
- `@meso/ui`: `useSSEStream`, `useTheme`
- `@meso/ui/runtime` — React-free entry point for `parseSSELine`, `applyEvent`, `createInitialStreamState`
- `@meso/ui/tokens.css` — design token CSS variables + dark/light theme support
- `@meso/types`: full SSE protocol v1.0 type definitions, `applyEvent`, `parseSSELine`, `createInitialStreamState`
- SSE protocol v1.0: versioned event envelope `{type, schema_version, payload}`
