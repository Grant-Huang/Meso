# Self-Describing Events: Narration Field Design

**Date**: 2026-06-24  
**Status**: Implemented in PR #59  
**Scope**: @meso.ai/types (platform layer) + @meso/demo (application layer)

---

## Problem Statement

In open orchestration patterns (like MCP, LangGraph, etc.), embedding narration as hardcoded text events has two issues:

1. **Inflexible**: UI strings live in backend orchestration code
2. **Non-scalable**: Every new orchestration layer must duplicate narration logic
3. **Not standardizable**: Difficult to propose as a protocol standard

## Solution: Self-Describing Events

Move narration from separate `text` events into the event payload itself via optional `narration` field.

```
Before:
┌─────────────────┐     ┌─────────────────┐
│ phase: collect  │ ... │ text: "开始采集"  │ ← separate event
└─────────────────┘     └─────────────────┘

After:
┌──────────────────────────────────┐
│ phase: collect                   │
│ narration: "开始采集"             │ ← same event
└──────────────────────────────────┘
```

---

## Architecture

### Platform Layer (@meso.ai/types)

**Protocol Changes**:

```typescript
// packages/meso-types/src/protocol.ts

export interface PhasePayload {
  id: string
  name: string
  state: 'running' | 'done' | 'error'
  started_at?: number
  ended_at?: number
  pinned_think?: string
  
  // ← NEW: Orchestrator fills this with context-aware description
  narration?: string
}

export interface ToolResultPayload {
  tool_call_id: string
  output: string
  error?: string
  duration_ms?: number
  metadata?: { ... }
  
  // ← NEW: Tool executor fills this with outcome summary
  narration?: string
}

export interface ResourceContentPayload {
  resource_read_id: string
  contents: ResourceContentItem[]
  error?: string
  duration_ms?: number
  
  // ← NEW: Resource provider fills this with retrieval summary
  narration?: string
}

export interface WorkflowNodePayload {
  run_id: string
  node_id: string
  parent_id?: string | null
  name: string
  state: WorkflowNodeState
  started_at?: number
  duration_ms?: number
  metadata?: Record<string, unknown>
  
  // ← NEW: DAG executor fills this with cross-node insights
  narration?: string
}
```

**State Machine** (applyEvent.ts):

```typescript
export function applyEvent(state: StreamState, event: SSEEvent): StreamState {
  // Auto-forward narration → text
  // Happens BEFORE the event type switch, so every event type benefits
  const payload = event.payload as Record<string, unknown>
  if (payload && typeof payload.narration === 'string' && payload.narration.length > 0) {
    state = applyEvent(state, {
      type: 'text',
      schema_version: '1.0',
      payload: { delta: payload.narration + '\n\n' },
    })
  }

  // Then process the event normally
  switch (event.type) {
    case 'phase': { ... }
    case 'tool_result': { ... }
    // ... etc
  }
}
```

**Key Benefit**: UI layer doesn't change. applyEvent handles the conversion transparently.

### Application Layer (@meso/demo)

**Orchestration Pattern**:

```typescript
// Before (hardcoded text)
emit(ev({ type: 'phase', payload: { id: 'collect', name: '采集', state: 'running' } }))
emit(ev({ type: 'text', payload: { delta: `现在采集数据...` } }))
await executeCollection()
emit(ev({ type: 'text', payload: { delta: `✓ 采集完成：${count} 条` } }))

// After (self-describing)
emit(ev({ type: 'phase', payload: {
  id: 'collect',
  name: '采集',
  state: 'running',
  narration: `现在采集数据...`  // ← orchestrator's context
} }))
await executeCollection()
emit(ev({ type: 'phase', payload: {
  id: 'collect',
  name: '采集',
  state: 'done',
  narration: `✓ 采集完成：${count} 条`  // ← accurate, data-driven
} }))
```

**Changes in useFullStream.ts and useLeanStream.ts**:
- Removed ~20 hardcoded `emit(ev({ type: 'text', ... }))` calls
- Replaced with `narration` field in phase/tool_result/resource_content payloads
- Narration can now be:
  - Static: known at orchestration time
  - Dynamic: computed from result metadata
  - LLM-generated: called during execution

---

## Design Principles

### 1. "Who Executes, Who Describes"
- **Orchestrator** is in best position to describe its own work
- **Knows**: input parameters, execution context, result interpretation
- **Decision**: Orchestrator fills `narration` field directly

### 2. Single Source of Truth
- Both data (output, duration_ms) and description (narration) live in same event
- No separate text event to sync with
- Prevents drift between execution fact and narration

### 3. No UI Logic in Backends
- Narration is data (optional field), not presentation code
- applyEvent (platform layer) handles conversion
- Backends never hardcode "when to show what"

### 4. Extensible
- **Phase 1 (current)**: Orchestrator fills narration statically
- **Phase 2 (future)**: narration computed from metadata
- **Phase 3 (optional)**: LLM-generated cross-node insights

---

## Use Cases

### Use Case 1: Multi-Step MCP Tool

```typescript
// Step 1: Start phase with intro narration
emit({ type: 'phase', payload: {
  id: 'search',
  state: 'running',
  narration: `正在搜索"${query}"...`
}})

// Step 2: Tool result with outcome summary
emit({ type: 'tool_result', payload: {
  tool_call_id: 'search_1',
  output: JSON.stringify(results),
  metadata: { resultCount: results.length },
  narration: `✓ 找到 ${results.length} 个结果`  // ← data-driven
}})

// Step 3: Phase complete with synthesis
emit({ type: 'phase', payload: {
  id: 'search',
  state: 'done',
  narration: `搜索完成，${results.length} 条结果已排序`
}})
```

### Use Case 2: Data Aggregation

```typescript
// Resource reads with per-source narration
for (const source of sources) {
  emit({ type: 'resource_content', payload: {
    resource_read_id: source.id,
    contents: [{ type: 'text', text: source.data }],
    duration_ms: source.elapsed,
    narration: `✓ ${source.name}：${source.recordCount} 条记录`  // ← context
  }})
}
```

### Use Case 3: DAG Workflow Completion

```typescript
// After a workflow run completes, fill narration with cross-node insight
emit({ type: 'workflow_node', payload: {
  run_id: 'workflow_1',
  node_id: 'orchestrator',
  state: 'done',
  duration_ms: 5000,
  narration: `工作流完成：4 个并行采集任务，合计 12.5K 字`
}})
```

---

## Future Extensions

### Extension 1: Metadata-Driven Narration

Instead of hardcoding strings, derive narration from result metadata:

```typescript
// Metadata contains everything needed
emit({ type: 'tool_result', payload: {
  tool_call_id: 'search',
  output: JSON.stringify(results),
  metadata: {
    resultCount: 42,
    category: 'web_search',
    duration_ms: 234,
    confidence: 0.95,
  }
  // Narration is optional — UI can fallback to template
  // narration: `✓ 返回 42 个结果（信度 95%）`
}})
```

UI could render template based on metadata:
```typescript
function renderNarration(event) {
  if (event.payload.narration) {
    return event.payload.narration  // exact
  }
  // Fallback template
  if (event.type === 'tool_result' && event.payload.metadata?.resultCount) {
    return `✓ ${event.payload.name} — ${event.payload.metadata.resultCount} results`
  }
}
```

### Extension 2: LLM-Generated Narration

Asynchronous post-processing to generate cross-node insights:

```typescript
// Phase 1: Emit raw events with narration
emit({ type: 'phase', payload: { id: 'collect', state: 'done', narration: `采集完成` }})
emit({ type: 'phase', payload: { id: 'analyze', state: 'done', narration: `分析完成` }})

// Phase 2: Optionally, call lightweight LLM to generate synthesis
const insights = await llm.stream(`
基于以下执行步骤，用 1 句话总结工作成果：
- 采集：5 个数据源，共 12.5K 字
- 分析：识别 3 个关键发现

只输出中文，不要标题。`)

for await (const chunk of insights) {
  emit({ type: 'text', payload: { delta: chunk }})
}
```

---

## Migration Path

### For Existing Orchestrators

1. **Minimal change**: Add `narration` to relevant events
   ```typescript
   // Old: emit text separately
   emit(text_event)
   emit(phase_event)
   
   // New: narration in phase_event
   emit(phase_event_with_narration)
   ```

2. **No UI changes needed**: applyEvent handles conversion

3. **Gradual adoption**: Mix narration and explicit text events during transition

---

## Standardization Path (MCP)

This pattern is a candidate for MCP standardization:

- ✅ Protocol-level: fits naturally in event envelope
- ✅ Language-agnostic: simple optional string field
- ✅ Backward compatible: narration is optional
- ✅ Community value: solves a common problem in orchestration

**Proposed MCP extension**:
```
Every event may carry an optional "narration" field.
If present, conforming UI implementations should emit
a corresponding text event for user visibility.
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **String location** | Separate text events | Event payload |
| **Source of truth** | Text event | Event payload |
| **UI responsibility** | Render text events | applyEvent auto-converts |
| **Orchestrator role** | Send text + execution | Send self-describing execution |
| **Extensibility** | Hardcoded per-use | Flexible: static/dynamic/LLM |
| **Standardizable** | No | Yes |

---

## Related Files

- `packages/meso-types/src/protocol.ts` — Type definitions
- `packages/meso-types/src/applyEvent.ts` — State machine logic
- `demo/src/hooks/useFullStream.ts` — Example: deep research
- `demo/src/hooks/useLeanStream.ts` — Example: OEE diagnosis

---

**Next Steps**:
1. ✅ Implement in PR #59
2. Gather feedback from demo usage
3. Consider metadata-driven narration (Phase 2)
4. Explore LLM narration for cross-node synthesis
5. Propose to MCP community
