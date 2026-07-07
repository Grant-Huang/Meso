# 30 — 预设扩展子类型（Preset Extensions）

> **修订版实施依据**。本文是对 let-it-flow 项目 `# 26` 需求文档的 meso 侧收口，作为 `@meso.ai/types@2.2.0` / `@meso.ai/ui@3.3.0` 的权威实施规格。
>
> 相对原 `# 26` 的关键修订见 [§10 修订记录](#10-修订记录)。

---

## 1. 背景与目标

### 1.1 现状

`@meso.ai/types@2.1.1` 的 `extension` 事件是"万能袋"：

```typescript
export interface ExtensionPayload {
  name: string
  version?: string
  data: unknown
}
```

`applyEvent` 对 extension 仅做按 name 分组与时序日志（`applyEvent.ts:331-342`）。每个 ReAct 应用都在 extension 里承载相似的会话生命周期信号（产物清单、证据不足、收尾摘要、轨迹持久化），但 `name` 和 `data` schema 各自定义，前端要为每个应用重写渲染逻辑，无法跨应用复用。

### 1.2 目标

在 `@meso.ai/types` 定义**预设子类型**（preset extensions），让：

1. 后端 emit 预设 name 时，`applyEvent` 做**语义归约**（如 `artifacts` 合并进 `state.artifacts`、`react_result` 累加 `totalUsage`）
2. 前端组件（`@meso.ai/ui`）能直接消费归约后的状态，跨应用开箱即用
3. 应用自定义的 extension name 仍透传到 `extensions[name][]` 和 `extensionLog`，保持扩展性

### 1.3 设计纪律

- **向后兼容**：`schema_version` 仍是 `"1.0"`，`PROTOCOL_VERSION` 保持 `"1.0"`；只是 `applyEvent` 多了语义归约分支
- **向后兼容旧 name**：通过别名映射归约到对应预设（`nexus_artifacts → artifacts` 等）
- **不强制**：应用可继续用自定义 name，预设只是"推荐契约"
- **不破坏现有契约测试**：`extension-stream` fixture（`citation` name）走透传分支，行为不变

---

## 2. 预设子类型清单

**共 4 个预设子类型**（原 `# 26` 提议 5 个，移除 `confirm_gate` —— 见 [§10.1](#101-移除-confirm_gate-预设)）：

| 预设 name | 用途 | 前端是否渲染 | 归约到的 StreamState 字段 |
|-----------|------|-------------|--------------------------|
| `precondition_unmet` | 证据不足收尾（V 层前置条件未满足） | 是（`PreconditionUnmetBanner`） | `preconditionGaps` + `preconditionSummary` |
| `artifacts` | 产物清单（core.deliver 产出的制品） | 是（`ArtifactPanel` 透明复用） | `state.artifacts` + `artifactOrder` |
| `react_result` | ReAct 收尾摘要（finishReason + 步数 + usage） | 否（数据载体） | `totalUsage` + `lastFinishReason` |
| `step_trace` | 完整轨迹（供多轮追问还原上下文） | 否（仅持久化） | 仅 canonical name 归约 |

### 2.1 旧 name 别名映射

`applyEvent` 内部做别名归约：

| 旧 name（向后兼容） | 归约到（预设 name） |
|-------------------|-------------------|
| `nexus_artifacts` | `artifacts` |
| `react_step_trace` | `step_trace` |

别名映射后，前端状态里**只保留预设 name**（避免双份），但 `extensionLog` 保留**原始事件**（含旧 name，供审计）。`eventLog` 的 extension 条目 id 用 canonical name（保证 context-blend 渲染 key 一致）。

---

## 3. `@meso.ai/types` 修改要求（目标版本 2.2.0）

### 3.1 新增类型定义

在 `protocol.ts` 新增预设子类型的 data 接口：

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Preset extension payloads (v2.2.0)
//
// These are RECOMMENDED contracts — backends emit them with the preset name,
// and applyEvent performs semantic reduction. Custom names remain transparent.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Precondition unmet — emitted when finalize is blocked by evidence gaps.
 *
 * Termination contract: after emitting this extension, the backend MUST
 * follow with an `error` event carrying code="PRECONDITION_UNMET" so the
 * stream transitions to status="error". The extension itself does NOT
 * change StreamState.status.
 */
export interface PreconditionUnmetData {
  /** Machine-readable reason: "precondition_unmet" (reserved for future codes). */
  finishReason: string
  /** LLM-generated user-facing summary of what's missing. */
  finalText?: string
  /** Token usage so far (for billing/analytics). */
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
  /**
   * Optional list of missing evidence domains (e.g. ["OEE", "downtime"]).
   * Backends may omit this if domain knowledge isn't structured.
   */
  missingDomains?: string[]
}

/**
 * Single artifact descriptor in an `artifacts` extension payload.
 * `id` is REQUIRED and must be stable across re-emits (used as state key).
 */
export interface ArtifactItem {
  /**
   * Stable unique id for this artifact within the stream.
   * Used as the key in `state.artifacts`; re-emitting an item with the
   * same id overwrites the previous entry (consistent with the `artifact`
   * event stream behavior). Backends MUST supply this — frontend cannot
   * synthesize a stable id from title/index alone.
   */
  id: string
  /** Content type/lang: "html preview" | "mermaid" | "python" | "report_html" | ... */
  type: string
  /** Human-readable title. */
  title: string
  /** Short description (≤ 120 chars); optional. */
  description?: string
}

export interface ArtifactsData {
  items: ArtifactItem[]
}

/**
 * ReAct session summary — emitted on finalize.
 * Carries finish reason, step count, and aggregate usage. Non-rendering;
 * consumed by analytics/state for per-stream usage accumulation.
 */
export interface ReactResultData {
  /** "finalize_tool" | "precondition_unmet" | "step_count" | "no_tool_call" | "error" | ... */
  finishReason: string
  /** Number of ReAct steps executed. */
  stepCount: number
  /** Aggregate token usage for this stream. */
  usage: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
}

/**
 * Full step trace for multi-turn follow-up.
 * Persisted but NOT rendered; consumed by backend's previous-context loader
 * to reconstruct compressed history for the next turn.
 *
 * Note: `finalText` is informational only. For visible text content, the
 * backend MUST emit `text` events separately — applyEvent does NOT promote
 * `finalText` into `state.textContent`.
 */
export interface StepTraceData {
  /** Step trace array (backend-specific shape; frontend treats as opaque). */
  stepTrace: unknown[]
  /** Final LLM text from this turn (informational; not promoted to textContent). */
  finalText: string
}
```

### 3.2 新增预设注册表与 helper

在 `protocol.ts` 新增：

```typescript
/**
 * Registry of preset extension names. Backends emitting these names get
 * semantic reduction by applyEvent; custom names remain transparent.
 *
 * `version` is informational only — it declares the EXTENSION's data-shape
 * semver (independent of PROTOCOL_VERSION). applyEvent does NOT enforce it;
 * consumers may read it for diagnostics. No runtime gating.
 */
export const EXTENSION_PRESETS: Readonly<
  Record<string, { version: string; aliases?: string[] }>
>

export type PresetExtensionName = keyof typeof EXTENSION_PRESETS

/** Type guard: is this name a preset OR an alias of one? */
export function isPresetExtension(name: string): name is PresetExtensionName

/** Resolve an alias to its canonical preset name. Returns the input if not an alias. */
export function resolveExtensionAlias(name: string): string
```

**期望实现值**：

```typescript
export const EXTENSION_PRESETS = {
  precondition_unmet: { version: '1.0' },
  artifacts:          { version: '1.0', aliases: ['nexus_artifacts'] },
  react_result:       { version: '1.0' },
  step_trace:         { version: '1.0', aliases: ['react_step_trace'] },
} as const
```

`isPresetExtension` 返回 true 当且仅当 name 是预设名或某预设的别名。`resolveExtensionAlias` 对别名返回 canonical，对非别名（含自定义 name）原样返回。

### 3.3 `applyEvent` 语义归约要求

当前 `applyEvent` 的 extension 分支（`applyEvent.ts:331-342`）只做分组。**2.2.0 增强**为：

```typescript
case 'extension': {
  const rawName = event.payload.name
  const canonicalName = resolveExtensionAlias(rawName)

  // 1. 始终填充 extensions + extensionLog（用 canonicalName 分组）
  //    extensionLog 保留原始事件（含旧 name，供审计）
  let next: StreamState = {
    ...state,
    extensions: {
      ...state.extensions,
      [canonicalName]: [
        ...(state.extensions[canonicalName] ?? []),
        { ...event, payload: { ...event.payload, name: canonicalName } },
      ],
    },
    extensionLog: [...state.extensionLog, event],
  }

  // 2. 预设子类型的语义归约
  const data = (event.payload.data ?? {}) as Record<string, unknown>

  switch (canonicalName) {
    case 'precondition_unmet': {
      next.preconditionGaps = Array.isArray(data.missingDomains)
        ? (data.missingDomains as string[])
        : []
      next.preconditionSummary =
        typeof data.finalText === 'string' ? data.finalText : null
      // 不改 status —— 由后续 error 事件终止流（见 PreconditionUnmetData 注释）
      break
    }
    case 'artifacts': {
      // 把 items 合并进 state.artifacts（复用 artifact 事件的 ArtifactState 结构）
      // 用 item.id 作为 key（后端必填）；同 id 覆盖（与 artifact 事件流一致）
      const items = Array.isArray(data.items) ? (data.items as ArtifactItem[]) : []
      const artifacts = { ...next.artifacts }
      const artifactOrder = [...next.artifactOrder]
      for (const item of items) {
        if (!item.id) continue // 防御：缺 id 跳过（类型上已必填）
        if (!artifactOrder.includes(item.id)) artifactOrder.push(item.id)
        artifacts[item.id] = {
          id: item.id,
          lang: item.type ?? 'unknown',
          content: item.description ?? '',
          done: true,
        }
      }
      next.artifacts = artifacts
      next.artifactOrder = artifactOrder
      break
    }
    case 'react_result': {
      // 流内累加 usage（新流通过 createInitialStreamState 自然归零）
      const usage = (data.usage ?? {}) as {
        inputTokens?: number
        outputTokens?: number
        totalTokens?: number
      }
      const prev = next.totalUsage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      next.totalUsage = {
        inputTokens:  (prev.inputTokens  ?? 0) + (usage.inputTokens  ?? 0),
        outputTokens: (prev.outputTokens ?? 0) + (usage.outputTokens ?? 0),
        totalTokens:  (prev.totalTokens  ?? 0) + (usage.totalTokens  ?? 0),
      }
      next.lastFinishReason =
        typeof data.finishReason === 'string' ? data.finishReason : null
      break
    }
    case 'step_trace': {
      // 不做额外归约（仅持久化在 extensions + extensionLog）
      // canonicalName 已归一为 "step_trace"，便于多轮追问读取
      break
    }
    // default: 自定义 name，不做额外归约（已由第 1 步透传）
  }

  nextState = next
  break
}
```

**eventLog id 一致性**：`extractEventId` 对 extension 当前用 `ext-${payload.name}`（`applyEvent.ts:27`）。别名映射后 `payload.name` 仍是原始值。为保证 context-blend 渲染 key 一致，`extractEventId` 应在 alias 解析后用 canonical name（即对 extension 分支传入已归约的 event，或单独处理）。实施时确认此处。

### 3.4 `StreamState` 新增字段

在 `streamState.ts` 的 `StreamState` interface 新增（全部可选，向后兼容）：

```typescript
export interface StreamState {
  // ... 现有字段 ...

  /** Missing evidence domains (from precondition_unmet extension). Empty if not applicable. */
  preconditionGaps?: string[]

  /** User-facing summary when precondition_unmet fires. null if not applicable. */
  preconditionSummary?: string | null

  /**
   * Aggregate token usage across all react_result extensions in this stream.
   * Per-stream accumulation — new stream resets via createInitialStreamState.
   */
  totalUsage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }

  /** Last finish reason (from the most recent react_result extension). */
  lastFinishReason?: string | null
}
```

`createInitialStreamState()` 补默认值：

```typescript
export function createInitialStreamState(): StreamState {
  return {
    // ... 现有字段 ...
    preconditionGaps: [],
    preconditionSummary: null,
    totalUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    lastFinishReason: null,
  }
}
```

### 3.5 导出清单更新

`index.ts` 新增导出：

```typescript
export { EXTENSION_PRESETS, isPresetExtension, resolveExtensionAlias } from './protocol'
export type {
  PreconditionUnmetData,
  ArtifactItem,
  ArtifactsData,
  ReactResultData,
  StepTraceData,
  PresetExtensionName,
} from './protocol'
```

---

## 4. `@meso.ai/ui` 修改要求（目标版本 3.3.0）

### 4.1 依赖升级

`package.json` peerDependencies：

```json
{
  "peerDependencies": {
    "@meso.ai/types": ">=2.2.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

devDependencies 的 `workspace:*` 自动跟随，无需手改。

### 4.2 re-export 新增类型

`runtime/index.ts` 新增 re-export（从 `@meso.ai/types`）：

```typescript
export {
  EXTENSION_PRESETS,
  isPresetExtension,
  resolveExtensionAlias,
} from '@meso.ai/types'

export type {
  PreconditionUnmetData,
  ArtifactItem,
  ArtifactsData,
  ReactResultData,
  StepTraceData,
  PresetExtensionName,
} from '@meso.ai/types'
```

`index.ts` 顶层相应 re-export（已有从 `./runtime` re-export 的模式，照抄）。

### 4.3 `ArtifactPanel` 增强

**无需改动**。因为 `@meso.ai/types@2.2.0` 的 `applyEvent` 会把 `artifacts` extension 转换为 `ArtifactState` 条目（见 [§3.3](#33-applyevent-语义归约要求)），`ArtifactPanel` 从 `state.artifacts` + `state.artifactOrder` 读取，透明地同时展示两类来源。

**验收**：传入一个含 `artifacts` extension 的 StreamState，`ArtifactPanel` 能渲染出 items。

### 4.4 新增可选组件 `<PreconditionUnmetBanner>`

```typescript
export interface PreconditionUnmetBannerProps {
  /** StreamState.preconditionGaps — missing evidence domains. */
  gaps?: string[]
  /** StreamState.preconditionSummary — user-facing summary text. */
  summary?: string | null
  /** Optional callback when user wants to retry / supplement. */
  onRetry?: () => void
}

export function PreconditionUnmetBanner(
  props: PreconditionUnmetBannerProps,
): JSX.Element | null
```

**渲染规格**：

- 当 `gaps` 为空数组且 `summary` 为 null/空 → 返回 `null`（不渲染）
- 否则渲染一个黄色边框的 banner：
  - 标题行：`<StatusIcon status="error" />` + "证据不足，前置条件未满足"（**不用 emoji**，遵循 meso-ui 规则"图标统一用 StatusIcon"）
  - 正文：`summary`（若有），否则提示"分析所需的取证数据未齐备"
  - gaps 以 tag 形式列出（如 `OEE`、`downtime`）
  - 若有 `onRetry`，显示"补充信息后重试"按钮
- CSS 用 token（`--color-border`、`--color-bg-elevated` 等），禁止 hardcode 颜色
- 组件在 `src/components/PreconditionUnmetBanner/` 下，含 `.tsx` + `.css` + `index.ts`
- 在 `src/index.ts` 导出

**用途**：应用可选启用。NexusOps 当前用自写的 `renderExtension.tsx` 处理 `precondition_unmet`，可逐步迁移到此组件。

### 4.5 `renderExtension` prop 机制保持

**重要**：`MessageList` 的 `renderExtension` prop 机制**完全保留**。应用仍可自定义 extension 渲染。预设组件是**可选便利**，不是强制。

---

## 5. 兼容性矩阵

| 场景 | 后端 emit | applyEvent 行为（2.2.0） | 前端 |
|------|----------|-------------------------|------|
| 预设 name（新） | `extension(name="artifacts")` | 归约到 `state.artifacts` + `extensions["artifacts"]` | ArtifactPanel 自动展示 |
| 旧 name（别名） | `extension(name="nexus_artifacts")` | 别名映射 → 归约到 `state.artifacts` + `extensions["artifacts"]` | 同上（透明） |
| 自定义 name | `extension(name="my_app_custom")` | 透传到 `extensions["my_app_custom"]` + `extensionLog` | 应用自写 renderExtension |
| 混合（双发） | 同时 emit `artifacts` + `nexus_artifacts` | `extensions["artifacts"]` 会有两条；`state.artifacts` 按 item.id 覆盖（幂等） | 建议后端只发一个 |

### 5.1 双发处理

`artifacts` 归约用 `item.id` 作 key，**同 id 覆盖**——这天然提供幂等性：即使后端双发（新 name + 旧 name 镜像），只要 items 的 id 一致，`state.artifacts` 不会重复。`extensions["artifacts"]` 数组会有两条记录（供审计），但不影响渲染。

`react_result` 的 usage 累加**不做去重**——双发会导致 usage 翻倍。**建议平台侧保证只发一份**，依赖 meso 的别名映射处理旧前端。

---

## 6. 测试要求（TDD 冻结基线）

meso 团队需在 `packages/meso-types/src/__tests__/runtime.contract.test.ts` 补充以下用例。这些用例作为 TDD 冻结基线，实施时先写测试再写实现。

### 6.1 预设归约测试

```typescript
describe('preset extension reduction', () => {
  const initial = createInitialStreamState()

  it('precondition_unmet populates gaps and summary, does NOT change status', () => {
    const state = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: {
        name: 'precondition_unmet',
        version: '1.0',
        data: { finishReason: 'precondition_unmet', finalText: '缺 OEE 数据', missingDomains: ['OEE'] },
      },
    })
    expect(state.preconditionGaps).toEqual(['OEE'])
    expect(state.preconditionSummary).toBe('缺 OEE 数据')
    expect(state.status).toBe('idle') // 不改 status
  })

  it('artifacts merges into state.artifacts by item.id', () => {
    const state = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: {
        name: 'artifacts',
        version: '1.0',
        data: { items: [{ id: 'r1', type: 'report_html', title: 'OEE 报告', description: '7月数据' }] },
      },
    })
    expect(state.artifactOrder).toEqual(['r1'])
    expect(state.artifacts['r1'].lang).toBe('report_html')
    expect(state.artifacts['r1'].content).toBe('7月数据')
    expect(state.artifacts['r1'].done).toBe(true)
  })

  it('artifacts re-emit with same id overwrites (idempotent)', () => {
    const s1 = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'artifacts', data: { items: [{ id: 'r1', type: 'html preview', title: 'A' }] } },
    })
    const s2 = applyEvent(s1, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'artifacts', data: { items: [{ id: 'r1', type: 'html preview', title: 'A v2', description: 'updated' }] } },
    })
    expect(state.artifactOrder).toEqual(['r1']) // 不重复
    expect(s2.artifacts['r1'].content).toBe('updated')
  })

  it('react_result accumulates usage per stream', () => {
    let state = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'react_result', data: { finishReason: 'finalize_tool', stepCount: 5, usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 } } },
    })
    state = applyEvent(state, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'react_result', data: { finishReason: 'finalize_tool', stepCount: 3, usage: { inputTokens: 200, totalTokens: 300 } } },
    })
    expect(state.totalUsage.totalTokens).toBe(450)
    expect(state.totalUsage.inputTokens).toBe(300)
    expect(state.lastFinishReason).toBe('finalize_tool')
  })

  it('step_trace reduces to canonical name only', () => {
    const state = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'step_trace', data: { stepTrace: [], finalText: '' } },
    })
    expect(state.extensions['step_trace']).toHaveLength(1)
    expect(state.extensions['react_step_trace']).toBeUndefined()
  })
})
```

### 6.2 别名映射测试

```typescript
describe('alias mapping', () => {
  const initial = createInitialStreamState()

  it('nexus_artifacts → artifacts (canonical in extensions, raw in log)', () => {
    const state = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'nexus_artifacts', data: { items: [{ id: 'r1', type: 'html', title: 'A' }] } },
    })
    expect(state.extensions['artifacts']).toHaveLength(1)
    expect(state.extensions['nexus_artifacts']).toBeUndefined()
    expect(state.extensionLog[0].payload.name).toBe('nexus_artifacts') // 原始 name 保留在 log
    expect(state.artifacts['r1']).toBeDefined() // 归约仍生效
  })

  it('react_step_trace → step_trace', () => {
    const state = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'react_step_trace', data: { stepTrace: [], finalText: '' } },
    })
    expect(state.extensions['step_trace']).toHaveLength(1)
    expect(state.extensions['react_step_trace']).toBeUndefined()
  })

  it('isPresetExtension recognizes aliases', () => {
    expect(isPresetExtension('nexus_artifacts')).toBe(true)
    expect(isPresetExtension('artifacts')).toBe(true)
    expect(isPresetExtension('custom_xxx')).toBe(false)
  })

  it('resolveExtensionAlias returns canonical', () => {
    expect(resolveExtensionAlias('nexus_artifacts')).toBe('artifacts')
    expect(resolveExtensionAlias('artifacts')).toBe('artifacts')
    expect(resolveExtensionAlias('custom')).toBe('custom')
  })
})
```

### 6.3 未知 name 透传测试（回归保障）

```typescript
describe('custom name transparency', () => {
  const initial = createInitialStreamState()

  it('custom name passes through unchanged', () => {
    const state = applyEvent(initial, {
      type: 'extension', schema_version: '1.0',
      payload: { name: 'my_app_widget', data: { foo: 'bar' } },
    })
    expect(state.extensions['my_app_widget']).toHaveLength(1)
    expect((state.extensions['my_app_widget'][0].payload as any).data).toEqual({ foo: 'bar' })
    // 不触发任何语义归约
    expect(state.totalUsage.totalTokens).toBe(0)
    expect(state.artifactOrder).toHaveLength(0)
    expect(state.preconditionGaps).toEqual([])
  })
})
```

### 6.4 向后兼容测试

```typescript
describe('backward compat with 2.1.1', () => {
  it('PROTOCOL_VERSION stays "1.0"', () => {
    expect(PROTOCOL_VERSION).toBe('1.0')
  })

  it('StreamState without new fields still works', () => {
    const legacyState = { ...createInitialStreamState() }
    delete (legacyState as any).totalUsage
    delete (legacyState as any).preconditionGaps
    const state = applyEvent(legacyState as StreamState, {
      type: 'text', schema_version: '1.0', payload: { delta: 'hi' },
    })
    expect(state.textContent).toBe('hi')
  })

  it('createInitialStreamState includes new defaults', () => {
    const s = createInitialStreamState()
    expect(s.preconditionGaps).toEqual([])
    expect(s.preconditionSummary).toBeNull()
    expect(s.totalUsage).toEqual({ inputTokens: 0, outputTokens: 0, totalTokens: 0 })
    expect(s.lastFinishReason).toBeNull()
  })
})
```

### 6.5 现有测试回归

现有 `extension-stream` fixture（`citation` name）必须继续通过——`citation` 不是预设，走透传分支，行为不变。

---

## 7. 版本与发布

### 7.1 版本号

| 包 | 当前版本 | 目标版本 | 说明 |
|----|---------|---------|------|
| `@meso.ai/types` | 2.1.1 | **2.2.0** | minor（新增功能，向后兼容） |
| `@meso.ai/ui` | 3.2.0 | **3.3.0** | minor（新增组件 + re-export） |

**`PROTOCOL_VERSION` 保持 `"1.0"`**：事件信封结构未变，只是 `applyEvent` 多了归约分支。升级协议版本会强制消费方做兼容检查，得不偿失。

### 7.2 发布清单

发布前确认：

- [ ] `@meso.ai/types@2.2.0` 构建产物含 `EXTENSION_PRESETS` / `isPresetExtension` / `resolveExtensionAlias`
- [ ] `applyEvent` 对 4 个预设 name + 2 个别名做语义归约
- [ ] `StreamState` 新字段在 `createInitialStreamState()` 有默认值
- [ ] 所有测试用例（§6）通过
- [ ] `@meso.ai/ui@3.3.0` 构建产物含 re-export + `<PreconditionUnmetBanner>`
- [ ] peerDependencies 声明 `@meso.ai/types@>=2.2.0`
- [ ] 现有 `extension-stream` fixture 回归通过

### 7.3 发布后通知

发布后通知 let-it-flow 团队（通过 issue / PR），附：

- types 2.2.0 的 npm tarball 链接
- ui 3.3.0 的 npm tarball 链接
- 测试报告（§6 全部用例通过截图）

---

## 8. 实施优先级

| 优先级 | 工作项 | 工作量 |
|--------|-------|--------|
| **P0** | EXTENSION_PRESETS 注册表 + isPresetExtension + resolveExtensionAlias | 0.5 天 |
| **P0** | applyEvent 别名映射（nexus_artifacts → artifacts 等） | 0.5 天 |
| **P0** | 4 个预设的 applyEvent 语义归约 | 1 天 |
| **P0** | StreamState 新字段 + createInitialStreamState 默认值 | 0.5 天 |
| **P0** | 测试用例（§6 全部） | 1 天 |
| **P1** | `@meso.ai/ui` re-export + PreconditionUnmetBanner 组件 | 1 天 |
| **P1** | 发布 types 2.2.0 + ui 3.3.0 | 0.5 天 |

**总计**：约 5 个工作日（已扣除 confirm_gate 相关工作）。

---

## 9. 开放问题（已关闭）

原 `# 26` 的 3 个开放问题在本次修订中全部关闭：

1. **`schema_version` 是否升级到 "1.1"？** → **保持 "1.0"**。信封结构未变，applyEvent 归约是纯加法。
2. **`step_trace` 的 `stepTrace` 字段是否需要强类型？** → **保持 `unknown[]`**。跨包耦合成本高，类型由后端保证。`finalText` 明确为"informational only"，不提升到 textContent。
3. **`artifacts` 归约生成 artifact id 的稳定性？** → **后端必填 `item.id`**（见 [§3.1 ArtifactItem](#31-新增类型定义)）。前端不合成 id，同 id 覆盖（与 artifact 事件流一致）。

---

## 10. 修订记录

本文档相对 let-it-flow 原 `# 26` 需求文档的修订，均经双方对齐确认。

### 10.1 移除 `confirm_gate` 预设

**原提议**：新增 `confirm_gate` extension 预设，承载 HITL 确认门，归约到 `state.activeConfirmGate`。

**问题**：meso 已有完整的原生 HITL 链路：

- `tool_call(risk='write'|'destructive'` 或 `requires_confirm=true)` → `applyEvent` 自动设 `toolCalls[id].status='awaiting_confirm'`
- `ConfirmGate` 组件读 `ToolCallPayload`（`toolCall.id/name/args/risk`），由 `ToolCallBlock` 渲染
- `useLeanStream` 的 `confirmTool`/`cancelTool` 走 `pendingConfirmRef`

新增 `confirm_gate` extension 是第二条并行确认路径，字段名不兼容（`gate_id` vs `id`、`prompt` vs 无、`options` vs 固定 approve/reject），且 `activeConfirmGate` 设置后无任何事件清除（流结束后残留）。

**修订**：移除 `confirm_gate` 预设。HITL 统一走 `tool_call(requires_confirm=true)` + `ConfirmGate` 组件。let-it-flow 的 HITL 改走 tool_call + 后端 confirm API，不走 extension。

**影响**：预设从 5 个减为 4 个；删除 `ConfirmGateData` 接口、`activeConfirmGate` 字段、对应测试用例。

### 10.2 `precondition_unmet` 终止信号改由 error 事件承担

**原提议**：`PreconditionUnmetData` 注释称"stream will terminate with status failed"，但归约逻辑不改 status，且 `StreamStatus` 无 `'failed'`。

**修订**：明确终止契约——后端在 `precondition_unmet` extension 后**必须紧跟一条 `error` 事件**（`code="PRECONDITION_UNMET"`），由 error 事件把 status 翻成 `'error'`。`precondition_unmet` 归约只设业务字段（`preconditionGaps` + `preconditionSummary`），不改 status。`StreamStatus` 不新增 `'failed'`。

### 10.3 `artifacts` 归约用后端 `item.id`

**原提议**：artifact id 合成为 `ext-artifacts-{index}-{encodeURIComponent(title)}`。

**问题**：跨事件覆盖、同 title 碰撞、title 缺失、顺序变化都会导致 id 不稳定，UI 渲染错乱。

**修订**：`ArtifactItem.id` 改为必填，由后端提供稳定 id。applyEvent 用 `item.id` 作 `state.artifacts` 的 key，同 id 覆盖（与 `artifact` 事件流行为一致）。这同时提供了双发幂等性（见 [§5.1](#51-双发处理)）。

### 10.4 `totalUsage` 明确为流内累加

**原提议**：未明确累加语义边界。

**修订**：明确为**当前流内累加**，新流通过 `createInitialStreamState()` 自然归零（`useSSEStream` 的 `reset()`/`start()` 已有行为，无需额外逻辑）。注释明确"per-stream aggregation"。

### 10.5 `EXTENSION_PRESETS.version` 定性为信息性

**原提议**：注册表带 `version` 字段但 applyEvent 不消费，语义不明。

**修订**：明确为"informational only, no runtime enforcement"。consumers 可读用于诊断，applyEvent 不做版本协商或拒绝。

### 10.6 `PreconditionUnmetBanner` 不用 emoji

**原提议**：Banner 标题用 `⚠` emoji。

**修订**：遵循 meso-ui 规则"图标统一用 StatusIcon"，改用 `<StatusIcon status="error" />`。

---

## 附：与 let-it-flow 原 `# 26` 的字段映射

供 let-it-flow 团队迁移参考：

| 原 `# 26` 字段/概念 | 修订版（本文档） | 变化 |
|---------------------|----------------|------|
| `ConfirmGateData` | **删除** | HITL 走 tool_call |
| `state.activeConfirmGate` | **删除** | 用 `toolCalls[id].status='awaiting_confirm'` |
| `PreconditionUnmetData`（注释提 "status failed"） | 注释改为"后端紧跟 error 事件" | status 不由 extension 改 |
| `ArtifactItem`（无 `id`） | `ArtifactItem.id` 必填 | 后端提供稳定 id |
| artifact 合成 id `ext-artifacts-{i}-{title}` | 用 `item.id` | 幂等覆盖 |
| `ReactResultData` | 不变 | — |
| `StepTraceData` | 不变（注释明确 finalText 不提升） | — |
| `EXTENSION_PRESETS`（5 项含 confirm_gate） | 4 项（删 confirm_gate） | — |
| `state.totalUsage`（语义未明） | 明确"per-stream" | 新流归零 |
| `<PreconditionUnmetBanner>`（标题用 ⚠） | 标题用 StatusIcon | 遵循设计规则 |
