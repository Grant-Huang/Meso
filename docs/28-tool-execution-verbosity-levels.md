# Tool Execution Display Verbosity Levels

**Date**: 2026-06-24  
**Component**: CollapsibleToolTrace, ProcessTrace, ToolCallBlock  
**Problem**: Current display is too simplistic in both "compact" and "detailed" modes

---

## Three Verbosity Levels

### Level 1: **Compact** (最小化)
**Use case**: Quick overview, conversation flow  
**Default expansion**: Closed (collapsed)  
**Target**: One-liner summary in conversation

### Level 2: **Standard** (均衡) ← **NEW DEFAULT**
**Use case**: Understanding what happened, typical case  
**Default expansion**: Last tool expanded, others collapsed  
**Target**: Balance between conciseness and informativeness

### Level 3: **Detailed** (完整)
**Use case**: Debugging, understanding internals, optimization  
**Default expansion**: All expanded  
**Target**: Every relevant field visible

---

## Elements and Display Rules

| Element | Description | Compact | Standard | Detailed | Collapse Default |
|---------|-------------|---------|----------|----------|------------------|
| **Summary Line** | `✓/✗ tool_name — result_count (Xms)` | ✓ | ✓ | ✓ | — |
| **Tool Name** | Display name from `call.name` | ✓ | ✓ | ✓ | — |
| **Status Icon** | ✓/✗/⏳ | ✓ | ✓ | ✓ | — |
| **Result Count** | From `metadata.resultCount` | — | ✓ | ✓ | — |
| **Duration** | `(Xms)` from `duration_ms` | — | ✓ | ✓ | — |
| **Risk Level** | `[safe/write/destructive]` badge | — | ✓ | ✓ | — |
| **Status** | `awaiting_confirm / pending / running / done / error` | — | ✓ | ✓ | — |
| **Confirmation Gate** | Show ConfirmGate when needed | — | ✓ | ✓ | — |
| **Input Parameters** | Full `call.args` object | ✗ | ✓ (collapsed) | ✓ (expanded) | **Collapsed** |
| **Output Preview** | First 200 chars of `output` | ✗ | ✓ (truncated) | ✓ (full) | **Collapsed** |
| **Metadata** | `metadata.{resultCount,category,custom}` | ✗ | ✓ (key fields) | ✓ (all) | **Collapsed** |
| **Error Message** | Full error if present | — | ✓ | ✓ | — |
| **Execution Timeline** | Start/end timestamps, duration breakdown | ✗ | ✗ | ✓ | **Collapsed** |
| **Provider Info** | MCP server, provider type | ✗ | — | ✓ | **Collapsed** |
| **Custom Metadata** | `metadata.custom` fields | ✗ | ✗ | ✓ | **Collapsed** |
| **Narration** | Tooltip/context from orchestrator | — | ✓ | ✓ | — |

---

## Visual Examples

### Compact Mode
```
▶ ✓ web_search
▶ ✓ knowledge_base
```
(Click to expand details)

---

### Standard Mode (Recommended Default)
```
▼ ✓ web_search — 8 项 (245ms) [safe]
  Input Parameters
    ▶ query: "AI Agent框架"
  Output (Preview)
    ▶ [{"id":"s1","title":"LangGraph vs CrewAI","score":0.94}...]
  Metadata
    resultCount: 8
    category: web_search
    
▶ ✓ knowledge_base — 3 项 (180ms) [safe]
```

---

### Detailed Mode
```
▼ ✓ web_search — 8 项 (245ms) [safe]
  Status: done
  Provider: builtin
  
  Input Parameters
    ▼ query: "AI Agent框架"
      // Show as key: value
  
  Execution Timeline
    Started: 2026-06-24 12:34:56.789
    Duration: 245ms
    Breakdown: query(50ms) → fetch(180ms) → parse(15ms)
  
  Output
    ▼ [Full JSON output visible]
      [{"id":"s1","title":"LangGraph vs CrewAI","score":0.94},
       {"id":"s2","title":"Anthropic Agents","score":0.89},
       ...]
  
  Metadata
    resultCount: 8
    category: web_search
    custom:
      source: google
      region: global
      
▶ ✓ knowledge_base — 3 项 (180ms) [safe]
```

---

## Implementation Guidelines

### 1. SimplifyOptions Extension

```typescript
export interface SimplifyOptions {
  // ← OLD (keep for backward compatibility)
  hideMetadata?: boolean
  hideResultDetails?: boolean
  compact?: boolean
  
  // ← NEW: Explicit verbosity level
  verbosity?: 'compact' | 'standard' | 'detailed'
  
  // ← NEW: Fine-grained controls
  showDuration?: boolean
  showProvider?: boolean
  showRiskLevel?: boolean
  showExecutionTimeline?: boolean
  defaultParamsCollapsed?: boolean
  defaultOutputCollapsed?: boolean
  defaultMetadataCollapsed?: boolean
}
```

### 2. ToolCallBlock Component Updates

```typescript
interface ToolCallBlockProps {
  toolCall: ToolCallState
  simplify?: SimplifyOptions
  onConfirm?: (id: string) => void
  onCancel?: (id: string) => void
}

function ToolCallBlock({ toolCall, simplify = {} }: ToolCallBlockProps) {
  const verbosity = simplify.verbosity ?? 'standard'
  const showDuration = simplify.showDuration ?? (verbosity !== 'compact')
  const showParams = verbosity !== 'compact'
  const paramsCollapsed = simplify.defaultParamsCollapsed ?? (verbosity === 'standard')
  const outputCollapsed = simplify.defaultOutputCollapsed ?? (verbosity === 'standard')
  
  return (
    <div className={`meso-tool-call meso-tool-call--${verbosity}`}>
      {/* Summary always shown */}
      <div className="meso-tool-call__summary">
        {renderSummary(toolCall, { showDuration, showRiskLevel: verbosity !== 'compact' })}
      </div>
      
      {/* Parameters section */}
      {showParams && (
        <Collapsible title="Input Parameters" defaultCollapsed={paramsCollapsed}>
          {renderParams(toolCall.call.args)}
        </Collapsible>
      )}
      
      {/* Output section */}
      {toolCall.result && (
        <Collapsible title="Output" defaultCollapsed={outputCollapsed}>
          {renderOutput(toolCall.result.output, verbosity)}
        </Collapsible>
      )}
      
      {/* Metadata section */}
      {showMetadata && (
        <Collapsible title="Metadata" defaultCollapsed={metadataCollapsed}>
          {renderMetadata(toolCall.result.metadata, verbosity)}
        </Collapsible>
      )}
      
      {/* Timeline section (detailed only) */}
      {verbosity === 'detailed' && showExecutionTimeline && (
        <Collapsible title="Execution Timeline" defaultCollapsed={true}>
          {renderTimeline(toolCall)}
        </Collapsible>
      )}
    </div>
  )
}
```

### 3. CollapsibleToolTrace Updates

```typescript
export interface CollapsibleToolTraceProps {
  stream: StreamState
  streaming?: boolean
  defaultExpanded?: 'all' | 'current' | 'none'
  onlyShowCurrent?: boolean
  
  // ← NEW: Verbosity control
  verbosity?: 'compact' | 'standard' | 'detailed'
  
  // ← NEW: Control which tools expand by default
  expandStrategy?: 'none' | 'current' | 'all' | 'last-n'
  expandCount?: number  // for 'last-n' strategy
  
  simplify?: SimplifyOptions
  onToolClick?: (toolCallId: string) => void
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void
  renderSummary?: (tc: ToolCallState, index: number) => ReactNode
}
```

---

## Summary Line Variants

### Compact
```
✓ web_search
```

### Standard
```
✓ web_search — 8 项 (245ms) [safe]
```

### Detailed
```
✓ web_search — 8 项 (245ms) [safe] — builtin
```

---

## Default Behaviors by Context

### In MessageList (Conversation)
- **Default**: `verbosity: 'compact'`, `expandStrategy: 'current'`
- **Reason**: Keep conversation clean, expand only the latest tool

### In ProcessTrace (Execution Overview)
- **Default**: `verbosity: 'standard'`, `expandStrategy: 'last-n'`, `expandCount: 2`
- **Reason**: Show recent actions in detail, older ones collapsed

### In LeanManufacturingPage (Full Page)
- **Default**: `verbosity: 'standard'`, `expandStrategy: 'current'`
- **Reason**: Focus on current action, allow expanding others on demand

### In FullStreamPage (Research)
- **Default**: `verbosity: 'detailed'`, `expandStrategy: 'all'`
- **Reason**: Deep dive, show all details

---

## Migration Path

### Phase 1: Add verbosity prop (non-breaking)
```typescript
// Old code still works
<ToolCallBlock toolCall={tc} simplify={{ compact: true }} />

// New code
<ToolCallBlock toolCall={tc} simplify={{ verbosity: 'compact' }} />
```

### Phase 2: Compute default verbosity from context
```typescript
// Auto-detect based on parent component
const defaultVerbosity = isInConversation ? 'compact' : 'standard'
```

### Phase 3: Deprecate old SimplifyOptions
```typescript
// Hide hideMetadata, hideResultDetails, compact
// Use only verbosity
```

---

## Testing Checklist

- [ ] Compact mode: only summary line visible, click to expand
- [ ] Standard mode: summary + key fields collapsed, params/output/metadata collapsible
- [ ] Detailed mode: everything visible with execution timeline
- [ ] Expand strategy 'last-n' works with expandCount
- [ ] Default expand state respects verbosity level
- [ ] Output truncation works in standard mode (200 chars)
- [ ] Full output shown in detailed mode
- [ ] Error messages shown in all modes
- [ ] ConfirmGate shown when needed (all modes)
- [ ] Risk level badge shown in standard/detailed
- [ ] Duration shown in standard/detailed
- [ ] Provider info shown in detailed only
- [ ] Timeline section shown in detailed only
- [ ] Custom metadata shown in detailed only
- [ ] Backward compatibility: old SimplifyOptions still work

---

## CSS Classes

```css
/* Verbosity level indicators */
.meso-tool-call--compact { /* Minimal styling */ }
.meso-tool-call--standard { /* Balanced styling */ }
.meso-tool-call--detailed { /* Full styling */ }

/* Collapsible sections */
.meso-collapsible { }
.meso-collapsible--collapsed { }
.meso-collapsible--expanded { }

/* Elements visibility */
.meso-tool-call__duration { }
.meso-tool-call__risk-level { }
.meso-tool-call__execution-timeline { }
```

---

## Next Steps

1. **Design**: Define exact pixel heights/spacing for each mode ✓ (this doc)
2. **Implement**: Update ToolCallBlock, CollapsibleToolTrace with verbosity levels
3. **Test**: Verify expansion strategies work correctly
4. **Document**: Update component JSDoc with examples
5. **Demo**: Show all three modes in meso-demo
6. **Release**: New minor version (non-breaking addition)

---

## Related

- Component: `packages/meso-ui/src/components/ToolCallBlock/`
- Component: `packages/meso-ui/src/components/CollapsibleToolTrace/`
- Demo: `demo/src/pages/LeanManufacturingPage.tsx`
- PR: #59 (narration field foundation)
