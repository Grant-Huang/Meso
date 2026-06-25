# Platform vs Application Responsibilities

**Context**: Implementing narration field for self-describing streaming events  
**Date**: 2026-06-24  
**Decision**: Clear separation of concerns between @meso.ai/types and application code

---

## Core Principle

**Platform (@meso.ai/types)** defines the protocol and runtime mechanisms.  
**Application (@meso/demo)** implements business logic and fills the protocol with context-aware data.

---

## Layer Division

### Platform Layer (@meso.ai/types) — Owns the Mechanism

#### Responsibility: ✅ DO

1. **Protocol Type Definitions**
   - Define `narration?: string` field in:
     - PhasePayload
     - ToolResultPayload
     - ResourceContentPayload
     - WorkflowNodePayload
   - Location: `packages/meso-types/src/protocol.ts`

2. **State Machine Logic**
   - Implement auto-forward: `narration → text` conversion
   - Happens in `applyEvent()` before event type switch
   - Works for ANY event type without special cases
   - Location: `packages/meso-types/src/applyEvent.ts`

3. **Type Safety**
   - Ensure TypeScript compilation passes
   - Update `.d.ts` files
   - Export types for consumption

4. **Documentation**
   - Document the narration field purpose in JSDoc
   - Explain the auto-conversion mechanism
   - Show examples of how to use

#### Responsibility: ❌ DON'T

- ❌ Hardcode any narration text
- ❌ Generate strings for specific use cases
- ❌ Make assumptions about business logic
- ❌ Add AI/LLM dependencies

**Why**: Platform must remain generic and composable.

---

### Application Layer (@meso/demo) — Owns the Content

#### Responsibility: ✅ DO

1. **Orchestration Context**
   - Fill `narration` field with context-aware descriptions
   - Orchestrator knows what it's doing and why
   - Location: `demo/src/hooks/useFullStream.ts`, `useLeanStream.ts`

2. **Data-Driven Narration**
   - Extract information from execution context
   - Use metadata, result counts, timing, etc.
   - Example:
     ```typescript
     emit(ev({ type: 'resource_content', payload: {
       resource_read_id: 'rr1',
       contents: resourceData,
       narration: `MES 数据：OEE ${oee}%，可用率 ${availability}%`
     }}))
     ```

3. **Business Logic**
   - Decide when/how to narrate
   - Choose appropriate language/tone
   - Control level of detail

4. **Future Extensions**
   - When adding LLM narration, stays in application layer
   - Example:
     ```typescript
     const narration = await llm.generate({
       context: phaseResults,
       maxTokens: 50
     })
     emit(ev({ type: 'phase', payload: { ..., narration } }))
     ```

#### Responsibility: ❌ DON'T

- ❌ Modify protocol.ts
- ❌ Change applyEvent logic
- ❌ Assume UI rendering details
- ❌ Pollute state machine with business rules

**Why**: Application must focus on "what to say" not "how to say it."

---

## Examples

### Example 1: Phase Event

```typescript
// Application fills narration based on execution context
emit(ev({ type: 'phase', payload: {
  id: 'evidence',
  name: '多系统取证',
  state: 'running',
  narration: `现在从 5 个数据源对 ${line} 进行全面取证。`  // ← App layer
}}))
```

Platform layer (applyEvent) auto-converts:
```typescript
// Becomes this text event (invisible to application)
emit({ type: 'text', delta: `现在从 5 个数据源对 ${line} 进行全面取证。\n\n` })
```

UI sees both events in stream, text renders as conversation.

### Example 2: Tool Result

```typescript
// Application orchestrates and narrates
const result = await search(query)
emit(ev({ type: 'tool_result', payload: {
  tool_call_id: 'tc1',
  output: JSON.stringify(result),
  metadata: { resultCount: result.length },  // ← Platform uses this
  duration_ms: 234,
  narration: `知识库命中 ${result.length} 条`  // ← App layer
}}))
```

### Example 3: Resource Content

```typescript
// Resource provider (app layer) fills narration
const mes = buildMesData(sig)
emit(ev({ type: 'resource_content', payload: {
  resource_read_id: 'rr1',
  contents: [{ type: 'text', text: JSON.stringify(mes) }],
  duration_ms: 280,
  narration: `MES 现场数据：OEE ${mes.oee_now}%`  // ← App layer
}}))
```

---

## Why This Division Matters

### Problem: Mixed Responsibilities (Anti-Pattern)

```typescript
// ❌ BAD: Platform knows about business logic
export function applyEvent(state, event) {
  if (event.type === 'tool_result' && event.payload.metadata?.resultCount) {
    // Platform generates business-specific text?
    const narration = `返回 ${event.payload.metadata.resultCount} 条结果`
    state = applyEvent(state, { type: 'text', delta: narration })
  }
  // ...
}
```

**Issues**:
- Platform is not generic anymore
- Hard to reuse in different applications
- Can't standardize (MCP, etc.)
- Violates separation of concerns

### Solution: Clear Division

```typescript
// ✅ GOOD: Platform is generic
export function applyEvent(state, event) {
  // If event ALREADY has narration, forward it
  if (event.payload.narration) {
    state = applyEvent(state, { type: 'text', delta: event.payload.narration })
  }
  // No business logic, just mechanism
}

// Application provides the narration
emit(ev({ type: 'tool_result', payload: {
  output: result,
  narration: `返回 ${result.length} 条结果`  // ← App decides
}}))
```

**Benefits**:
- Platform stays generic and reusable
- Application controls all narration
- Easy to standardize
- Clean architectural boundaries

---

## Testing This Division

### Platform Tests (@meso.ai/types)

```typescript
// Test that applyEvent auto-converts narration
test('applyEvent: narration field → text event', () => {
  const event = {
    type: 'phase',
    payload: {
      id: 'test',
      state: 'running',
      narration: '开始测试'
    }
  }
  const state = applyEvent(initialState, event)
  // Check: textContent includes '开始测试\n\n'
  expect(state.textContent).toContain('开始测试')
})
```

### Application Tests (@meso/demo)

```typescript
// Test that orchestrator fills narration correctly
test('useFullStream: phase event includes narration', async () => {
  const emissions = []
  const hook = renderHook(() => useFullStream())
  
  // Emit and capture
  hook.result.current.send(topic, opts)
  
  // Find phase event
  const phaseEvent = emissions.find(e => e.type === 'phase')
  expect(phaseEvent.payload.narration).toMatch(/现在开始/)
})
```

---

## Migration Path for Existing Code

### Step 1: Update Platform (No Breaking Changes)

```typescript
// Add narration field to payload types
export interface PhasePayload {
  id: string
  name: string
  state: PhaseState
  narration?: string  // ← New, optional
}
```

### Step 2: Application Can Mix Old and New

```typescript
// Old way (still works during transition)
emit(ev({ type: 'phase', payload: { ... } }))
emit(ev({ type: 'text', payload: { delta: '...' } }))

// New way
emit(ev({ type: 'phase', payload: { ..., narration: '...' } }))
```

### Step 3: Gradually Migrate

Replace hardcoded text events → narration fields as you touch code.

### Step 4: Delete Hardcoded Text

Once all events have narration, remove the separate text emissions.

---

## Decision Record

| Question | Answer | Rationale |
|----------|--------|-----------|
| **Who fills narration?** | Application | Knows context best |
| **Who converts narration → text?** | Platform (applyEvent) | Single mechanism for all events |
| **Where is narration defined?** | protocol.ts | Type safety |
| **Can platform generate narration?** | No | Violates separation of concerns |
| **Can application call applyEvent?** | Only via hook (useSSEStream) | Platform is read-only to apps |
| **Is narration mandatory?** | No | Backward compatible |
| **Can we add LLM narration later?** | Yes, in application | Doesn't require platform changes |

---

## Checklist: Keeping Boundaries Clean

### Platform Review (Before Merging PR)

- [ ] No hardcoded business strings in protocol.ts
- [ ] applyEvent has no conditional logic based on event content
- [ ] All narration field adds are in type definitions only
- [ ] Auto-conversion mechanism is generic (works for all payload types)
- [ ] No imports from demo/ or application code
- [ ] JSDoc explains: "Fill this with context-aware description"

### Application Review (Before Merging PR)

- [ ] All narration filled by orchestrator, not by UI layer
- [ ] Narration uses available context (timestamps, metadata, result counts)
- [ ] No hardcoded text events (all moved to narration field)
- [ ] No assumptions about UI rendering in the narration text
- [ ] Can explain: "Why does THIS orchestrator narrate THIS way?"

---

## Related

- Design: `docs/26-narration-field-design.md`
- Implementation: PR #59
- Protocol: `packages/meso-types/src/protocol.ts`
- State Machine: `packages/meso-types/src/applyEvent.ts`
- Examples: `demo/src/hooks/useFullStream.ts`, `useLeanStream.ts`

---

**Conclusion**: Clear separation enables composition, reusability, and standardization.
