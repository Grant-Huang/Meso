# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [@meso.ai/ui] 2.0.0 · [@meso.ai/types] 1.1.0 — 2026-05-28

### ADDED (`@meso.ai/types`)

- `ToolDefinition` — dev-time config type for external tool registration; tool authors write one JSON file describing their capability; backends read it at startup and translate to `ToolSpec` for the `capabilities` SSE event
- `ExternalToolAuth` — auth descriptor for HTTP tools (`bearer` / `api_key` / `basic`; `env` field for secret injection via environment variables)
- Both types exported from package root and included in `dist/` declarations
- `manifest.json` `tools[]` field now supports three forms: builtin string ID, file path (`./tools/foo.json`), or inline `ToolDefinition` object
- 6 new contract tests: `capabilities` event `risk` + `input_schema` field coverage; `ToolDefinition` shape validation (local / api / destructive)

### ADDED (demo)

- `ToolsPage` — two-column demo page: step-by-step tool integration guide on the left; live SSE simulation (safe auto-execute + destructive ConfirmGate interaction) on the right

### CHANGED (docs)

- `docs/integration-guide.md` step 7 expanded to 4-section tool integration guide with Python backend example and updated acceptance checklist
- `docs/app-plugin-system.md` tools section rewritten with full `ToolDefinition` format reference, HTTP tool example, and cross-app shared tools pattern

---

## [@meso.ai/ui] 2.0.2 · [@meso.ai/types] 1.0.1 — 2026-05-26

### ADDED

- `publishConfig.access: "public"` in both packages — scoped packages now publish correctly with `pnpm publish --access public`
- `.github/workflows/ci.yml` — PR/push CI: build → test → pack smoke test (installs tarball into clean Vite project and verifies imports resolve)
- `.github/workflows/release.yml` — tag-triggered: build → test → `pnpm publish` to npm → upload tarballs to GitHub Release
- `docs/consuming.md` — installation guide covering npm/tarball/file: methods, anti-patterns, and troubleshooting
- README: `pnpm add` command alongside `npm install`; note against `github:#path:` installs

---

---

## [@meso.ai/ui] 2.0.1 · [@meso.ai/types] 1.1.0 — 2026-05-24

### ADDED

- `isCompatibleVersion(ev)` — returns `false` when `schema_version` major differs from runtime; safe to call on every received event
- `assertCompatibleVersion(ev)` — throws with a descriptive message on version mismatch; use at the transport boundary for hard guarantees
- `stagePayloadToStage(payload, id)` — official bridge from `StagePayload` (protocol) to `Stage` (UI component); eliminates per-consumer mapping boilerplate
- `StageStatus` now includes `'error'`; `<StageTimeline>` renders error stages with a red ✕ icon and `--color-error` styling
- `@meso.ai/ui` exports `"./style.css": "./dist/style.css"` — consumers can now write `import '@meso.ai/ui/style.css'` instead of the internal dist path

### CHANGED

- `@meso.ai/types` promoted from `dependencies` to `peerDependencies` in `meso-ui/package.json`; consumers using `file:` paths must declare both packages explicitly (see README → Monorepo 外消费)
- Package manager migrated from npm to pnpm; lockfile is now `pnpm-lock.yaml`

---

## [@meso.ai/ui] 2.0.0 · [@meso.ai/types] 1.0.0 — initial release

### BREAKING (vs. pre-release)

- `StreamState.memoryItems: string[]` → `memorySnippets: MemorySnippet[]` — richer memory objects replace flat strings
- `StreamState.artifact` (single) → `artifacts: Record<string, ArtifactState>` + `artifactOrder: string[]` — supports multiple concurrent artifacts
- `StagePayload` field `status` renamed to `state`

### ADDED

- `@meso.ai/ui`: `ThreeColumnLayout`, `MessageList`, `ChatBubble`, `StageTimeline`, `ArtifactPanel`, `ThinkBlock`, `ToolCallBlock`, `SkillIndicator`, `ResourceReadBlock`, `ConfirmGate`, `SoulIndicator`, `StreamingCursor`
- `@meso.ai/ui`: `useSSEStream`, `useTheme`
- `@meso.ai/ui/runtime` — React-free entry point for `parseSSELine`, `applyEvent`, `createInitialStreamState`
- `@meso.ai/ui/tokens.css` — design token CSS variables + dark/light theme support
- `@meso.ai/types`: full SSE protocol v1.0 type definitions, `applyEvent`, `parseSSELine`, `createInitialStreamState`
- SSE protocol v1.0: versioned event envelope `{type, schema_version, payload}`
