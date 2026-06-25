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
| **Duration** | `(Xms)` from `duration_ms` | ✓ | ✓ | ✓ | — |
| **Result Count** | From `metadata.resultCount` | ✓ | ✓ | ✓ | — |
| **Risk Level** | `[safe/write/destructive]` badge | — | ✓ | ✓ | — |
| **Provider Info** | MCP server, provider type | — | ✓ | ✓ | — |
| **Narration** | Context text from orchestrator | ✓ | ✓ | ✓ | — |
| **Confirmation Gate** | Show ConfirmGate when needed | ✓ | ✓ | ✓ | — |
| **Status** | `awaiting_confirm / running / done / error` | — | ✓ | ✓ | — |
| **Input Parameters** | Full `call.args` object | ✓ (when expanded) | ✓ | ✓ | **Collapsed** |
| **Output Preview** | First 200 chars of `output` | ✓ (when expanded) | ✓ (truncated) | ✓ (full) | **Collapsed** |
| **Metadata** | `metadata.{resultCount,category,custom}` | ✓ (when expanded) | ✓ (key fields) | ✓ (all) | **Collapsed** |
| **Error Message** | Full error if present | ✓ | ✓ | ✓ | — |
| **Execution Timeline** | Start/end timestamps, duration breakdown | ✗ | ✗ | ✓ | **Collapsed** |
| **Custom Metadata** | `metadata.custom` fields | ✗ | ✗ | ✓ | **Collapsed** |

---

## Resource Read & Think Block Verbosity (v3.2+)

Verbosity now controls `ResourceReadBlock` content expansion and `ThinkBlock` collapse behavior, threaded via the same `simplify` prop.

| Element | Compact | Standard | Detailed |
|---|---|---|---|
| **Resource content** (`ResourceReadBlock`) | Collapsed | Collapsed | **Expanded** |
| **Think block** (`ThinkBlock` defaultOpen) | `false` (collapsed) | `true` (open) | `true` (open) |
| **Think block auto-collapse** (`collapseWhen`) | — | `streamEnd` (auto-collapse 1.5s after stream ends) | `never` (stays open) |
| **Frozen tools** (blend mode history) | `none` (collapsed) | `none` (collapsed, click to expand) | `all` (expanded) |

**Implementation**: `simplify` is threaded from `MessageList` → `InterleavedStreamingContent` → `ResourceReadBlock` / `ThinkBlock`. Both components derive `defaultOpen` from `simplify.verbosity` via `resolveVerbosity()` (`packages/meso-ui/src/utils/verbosity.ts`). Explicit `defaultOpen` / `collapseWhen` props on `ThinkBlock` still override the verbosity-derived defaults.

**Note on block mode**: As of v3.2, `LinearStreamingTools` (block mode) now threads `simplify` (previously hardcoded `undefined`). Verbosity selection works in both blend and block modes.

---

## Visual Examples

### Compact Mode
```
▶ [●] web_search — 8 项 (245ms)
  知识库命中 8 条结果            ← narration（纯文本，无符号前缀）
  
  [展开时显示：]
  ▶ Input Parameters
  ▶ Output  
  ▶ Metadata
  
▶ [●] knowledge_base — 3 项 (180ms)
  返回 3 条相关文献
```

> 图例：`[●]` = StatusIcon(done) 绿色圆+勾（SVG，非 Unicode 字符）；`▶`/`▼` = ChevronIcon。

**特点**：
- 摘要行展示关键信息（名称、数量、耗时）
- 旁白/narration 为纯文本，状态由 StatusIcon 表达
- 确认门按钮在 awaiting_confirm 时显示
- 点击摘要行展开，所有内容折叠（参数、输出、元数据都需点击才展开）

---

### Standard Mode (Recommended Default)
```
▼ [●] web_search — 8 项 (245ms) [safe] — MCP
  知识库命中 8 条结果            ← narration（纯文本）
  
  Input Parameters
    ▶ query: "AI Agent框架"
  Output (Preview)
    ▶ [{"id":"s1","title":"LangGraph vs CrewAI","score":0.94}...]
  Metadata
    ▶ resultCount: 8
      category: web_search
    
▶ [●] knowledge_base — 3 项 (180ms) [safe] — builtin
  返回 3 条相关文献
```

**特点**：
- 摘要行展示完整信息（名称、数量、耗时、风险等级、Provider）
- narration 纯文本，状态由 StatusIcon 表达
- 参数、输出、元数据默认折叠（点击展开）
- 第二层信息（参数值、输出内容、字段值）也默认折叠

---

### Detailed Mode
```
▼ [●] web_search — 8 项 (245ms) [safe] — MCP
  知识库命中 8 条，精度 0.94      ← narration（纯文本）
  
  ▼ Input Parameters
    query: "AI Agent框架"
    limit: 10
    filter: "recent"
  
  ▼ Output (Full)
    [{"id":"s1","title":"LangGraph vs CrewAI","score":0.94},
     {"id":"s2","title":"Anthropic Agents","score":0.89},
     ...]
  
  ▼ Metadata
    resultCount: 8
    category: web_search
    custom:
      source: google
      region: global
  
  ▼ Execution Timeline
    Duration: 245ms
    
▶ [●] knowledge_base — 3 项 (180ms) [safe] — builtin
  返回 3 条相关文献          ← narration（纯文本）
```

**特点**：
- 所有信息完全展开（参数、输出、元数据都默认展开）
- 第二层信息也展开（参数具体值、完整输出内容）
- 包含执行时间线
- 包含自定义元数据
- 用于调试和深度分析

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

  /** Expansion strategy: 'none' | 'current' | 'all' | 'last-n' */
  defaultExpanded?: 'all' | 'current' | 'none' | 'last-n'
  /** Number of items to expand when defaultExpanded='last-n' (default: 2) */
  expandCount?: number

  /** Show only the most recent tool call */
  onlyShowCurrent?: boolean

  /** Verbosity and display options (threaded into ToolCallBlock) */
  simplify?: SimplifyOptions

  onToolClick?: (toolCallId: string) => void
  onToolConfirm?: (toolCallId: string) => void
  onToolCancel?: (toolCallId: string) => void

  renderSummary?: (tc: ToolCallState, index: number) => ReactNode
}
```

> **Note**: Verbosity is controlled exclusively via `simplify: { verbosity }`. There is no separate top-level `verbosity` prop. The blend mode derives `defaultExpanded` for frozen tools from verbosity (see Resource/Think Verbosity section above).
  onToolCancel?: (toolCallId: string) => void
  renderSummary?: (tc: ToolCallState, index: number) => ReactNode
}
```

---

## Summary Line Variants

> `[●]` represents the StatusIcon (SVG rendered by `CollapsibleToolTrace`), not a Unicode character.

### Compact
```
[●] web_search
```

### Standard
```
[●] web_search — 8 项 (245ms) [safe]
```

### Detailed
```
[●] web_search — 8 项 (245ms) [safe] — builtin
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
