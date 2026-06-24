/**
 * ProcessTraceEnhancementsPage — Demonstrates ProcessTrace simplification and CollapsibleToolTrace
 *
 * Left:  guide on streaming UI enhancements
 * Right: live simulation with two demo variants
 *        ① ProcessTrace with simplify options
 *        ② CollapsibleToolTrace (folded by default)
 */
import { useState, useCallback } from 'react'
import { ProcessTrace, CollapsibleToolTrace, applyEvent, createInitialStreamState, parseSSELine } from '@meso.ai/ui'
import type { StreamState } from '@meso.ai/ui'

const SSE_EVENTS = [
  `data: {"type":"capabilities","schema_version":"1.0","payload":{"tools":[{"name":"web_search","description":"搜索网络信息","provider":"mcp","risk":"safe"},{"name":"code_generator","description":"生成代码片段","provider":"mcp","risk":"safe"},{"name":"database_query","description":"查询数据库","provider":"api","risk":"safe"}]}}`,
  `data: {"type":"phase","schema_version":"1.0","payload":{"id":"search","name":"搜索阶段","state":"running"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"我来帮"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"你搜索"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"相关信息。"}}`,
  `data: {"type":"tool_call","schema_version":"1.0","payload":{"id":"tc-1","name":"web_search","args":{"query":"TypeScript 最佳实践 2024","limit":5},"risk":"safe","provider":"mcp"}}`,
  `data: {"type":"tool_status","schema_version":"1.0","payload":{"id":"tc-1","status":"running"}}`,
  `data: {"type":"tool_result","schema_version":"1.0","payload":{"tool_call_id":"tc-1","output":"搜索结果：\\n1. TypeScript Handbook\\n2. Type Safe Patterns\\n3. Advanced TS Tips","duration_ms":234,"metadata":{"resultCount":3,"category":"search"}}}`,
  `data: {"type":"tool_call","schema_version":"1.0","payload":{"id":"tc-2","name":"code_generator","args":{"language":"typescript","topic":"type guards"},"risk":"safe","provider":"mcp"}}`,
  `data: {"type":"tool_status","schema_version":"1.0","payload":{"id":"tc-2","status":"running"}}`,
  `data: {"type":"tool_result","schema_version":"1.0","payload":{"tool_call_id":"tc-2","output":"// Type Guard Example\\nfunction isString(val: unknown): val is string {\\n  return typeof val === 'string';\\n}","duration_ms":156,"metadata":{"category":"code"}}}`,
  `data: {"type":"phase","schema_version":"1.0","payload":{"id":"search","name":"搜索阶段","state":"done"}}`,
  `data: {"type":"text","schema_version":"1.0","payload":{"delta":"已找到相关资源和代码示例，请参考上面的执行过程。"}}`,
  `data: {"type":"done","schema_version":"1.0","payload":{}}`,
]

function buildStream(eventCount: number): StreamState {
  let state = createInitialStreamState()
  state.status = 'streaming'

  for (let i = 0; i < Math.min(eventCount, SSE_EVENTS.length); i++) {
    const event = parseSSELine(SSE_EVENTS[i])
    if (event) {
      state = applyEvent(state, event)
    }
  }

  return state
}

const GUIDE_CONTENT = `
## ProcessTrace 简化参数

新增 \`simplify\` 参数允许您控制工具调用的显示方式：

\`\`\`tsx
interface SimplifyOptions {
  hideMetadata?: boolean;      // 隐藏参数和耗时
  hideResultDetails?: boolean; // 结果只显示摘要，不展开
  compact?: boolean;           // 单行紧凑模式
}
\`\`\`

### 应用场景
- **hideMetadata**: 简化主要信息流，隐藏技术细节
- **hideResultDetails**: 展示摘要，减少垂直空间占用
- **compact**: 流式中快速浏览而不深入查看细节

## CollapsibleToolTrace 组件

全新组件，默认折叠工具调用为单行摘要：

\`\`\`tsx
<CollapsibleToolTrace
  stream={stream}
  defaultExpanded="none"    // 默认全部折叠
  simplify={{ hideMetadata: true }}
  onlyShowCurrent={false}   // 仅显示最新工具
/>
\`\`\`

### 关键特性
✓ 紧凑展示：单行摘要显示工具状态和结果计数
✓ 点击展开：查看完整参数和结果详情
✓ 仅显示当前：流式中只展示最新工具调用
✓ 灵活定制：支持 renderSummary 自定义摘要格式

## ToolResult 元数据

\`ToolResult\` 现在支持结构化元数据：

\`\`\`tsx
metadata?: {
  resultCount?: number;  // 结果数量（用于搜索、查询）
  category?: string;     // 类别：search | fetch | compute | ...
  custom?: Record<string, unknown>;
}
\`\`\`

前端可以用元数据生成一致的摘要格式，而无需解析字符串。

## 统一流式 UI 模式

这三个增强功能协同工作，建立了消费应用可复用的"流式展示规范"：

1. **详细模式** → ProcessTrace（完整展示所有信息）
2. **简化模式** → ProcessTrace + simplify（隐藏元数据）
3. **可折叠模式** → CollapsibleToolTrace（摘要行 + 点击展开）

应用可根据上下文选择最合适的展示方式。
`.trim()

export function ProcessTraceEnhancementsPage() {
  const [eventCount, setEventCount] = useState(8)
  const [selectedDemo, setSelectedDemo] = useState<'detailed' | 'simplified' | 'collapsible'>('detailed')

  const stream = buildStream(eventCount)
  const isStreaming = eventCount < SSE_EVENTS.length

  const handleAutoPlay = useCallback(() => {
    if (eventCount < SSE_EVENTS.length) {
      setEventCount(eventCount + 1)
    }
  }, [eventCount])

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', height: '100%' }}>
      {/* Left: Guide */}
      <div style={{ flex: '0 0 320px', overflowY: 'auto', fontSize: '13px', lineHeight: '1.6', color: '#666' }}>
        <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#222', fontWeight: 600 }}>
          流式 UI 增强
        </h2>
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '11px' }}>
          {GUIDE_CONTENT}
        </div>
      </div>

      {/* Right: Demo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              setEventCount(1)
              setSelectedDemo('detailed')
            }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            重置
          </button>
          <button
            onClick={handleAutoPlay}
            disabled={!isStreaming}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: isStreaming ? '#fff' : '#f5f5f5',
              cursor: isStreaming ? 'pointer' : 'not-allowed',
              opacity: isStreaming ? 1 : 0.6,
            }}
          >
            ▶ 下一步 ({eventCount}/{SSE_EVENTS.length})
          </button>
          <span style={{ fontSize: '12px', color: '#999' }}>
            {isStreaming && '流式中...'}
          </span>
        </div>

        {/* Demo selector */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          {(['detailed', 'simplified', 'collapsible'] as const).map(demo => (
            <button
              key={demo}
              onClick={() => setSelectedDemo(demo)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '4px',
                border: 'none',
                background: selectedDemo === demo ? '#f0f0f0' : 'transparent',
                cursor: 'pointer',
                fontWeight: selectedDemo === demo ? 600 : 400,
              }}
            >
              {demo === 'detailed' && '📋 详细模式'}
              {demo === 'simplified' && '📄 简化模式'}
              {demo === 'collapsible' && '📦 可折叠模式'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px', flex: 1, overflowY: 'auto' }}>
          {selectedDemo === 'detailed' && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>ProcessTrace（默认，完整显示）</h3>
              <ProcessTrace
                stream={stream}
                streaming={isStreaming}
                defaultCollapsed={false}
              />
            </div>
          )}

          {selectedDemo === 'simplified' && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>ProcessTrace（简化：隐藏元数据）</h3>
              <ProcessTrace
                stream={stream}
                streaming={isStreaming}
                defaultCollapsed={false}
                simplify={{ hideMetadata: true, hideResultDetails: true }}
              />
            </div>
          )}

          {selectedDemo === 'collapsible' && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>CollapsibleToolTrace（默认折叠摘要）</h3>
              <CollapsibleToolTrace
                stream={stream}
                defaultExpanded="none"
                simplify={{ hideMetadata: true }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
