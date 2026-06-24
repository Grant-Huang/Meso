# 真正的线性追加式流式会话 (Linear Streaming UI Pattern)

## 问题诊断

当前实现中，流式会话**并不是真正的线性追加**。现象表现为：
- 确认门按钮会"插入"到前面的会话中，而不是追加到底部
- 工具调用的顺序可能被重新排列
- 同一工具的状态变化（pending → done → awaiting_confirm）会导致整个元素重新渲染

### 根本原因

```tsx
// MessageList.tsx - 当前实现
{streaming && streaming.status !== 'idle' && (
  <div className="meso-message-list__live">
    {renderLiveTrace ? renderLiveTrace(streaming) : (
      <CollapsibleToolTrace
        stream={streaming}  // ← 接收整个 StreamState
        // ...
      />
    )}
  </div>
)}
```

每次 `streaming` 状态更新时，**整个 `renderLiveTrace` 都会被重新调用**，导致：
1. 所有工具调用被重新渲染
2. 新出现的确认门可能改变了渲染顺序
3. DOM 元素位置不稳定

---

## 什么是真正的线性追加式

### 特征

1. **纯粹追加 (Append-Only)**
   - 新内容总是追加到底部
   - 前面的内容永远不变
   - 不存在"重排"

2. **时间线性 (Timeline Linear)**
   ```
   时间 →
   ─────────────────────────
   User: "..."           ← 已固定
   AI: "搜索中..."       ← 已固定
   > 搜索结果 — 5 项     ← 已固定
   > 代码生成            ← 已固定
   > 发布草稿            ← 当前：可能有确认门
   ```

3. **状态固化 (Immutable History)**
   - 一旦某个元素渲染过，不应该再改变位置或内容
   - 只有"当前"和"未来"的元素能变化

### Claude Code 的实现参考

Claude 的对话界面使用真正的线性追加：
- 每条消息（包括工具执行）都是一个独立的"块"
- 新块总是追加到底部
- 不存在内容的"重排"或"插入"

---

## 改进方案

### 方案 A：事件流快照（推荐）

将 StreamState 的变化转换为一系列**不可变的事件快照**，然后依次渲染：

```tsx
interface StreamSnapshot {
  toolCalls: Array<{
    id: string
    call: ToolCallPayload
    result?: ToolResultPayload
    status: ToolCallStatus
    pinnedAt: number  // ← 表示这个工具调用何时"固定"
  }>
  textContent: string
  isStreaming: boolean
}

function buildStreamSnapshots(stream: StreamState): StreamSnapshot[] {
  // 只返回"已完成"的工具调用
  // 当前进行中的工具单独处理
  return stream.toolCallOrder
    .filter(id => {
      const tc = stream.toolCalls[id]
      return tc.result !== undefined  // ← 只取有结果的（已完成）
    })
    .map(id => ({...}))
}
```

#### 改进的 MessageList 逻辑

```tsx
export function MessageList({
  messages,
  streaming,
  renderLiveTrace,
}: MessageListProps) {
  // 1. 已完成的消息（不变）
  {messages.map(m => <ChatBubble {...m} />)}

  // 2. 流式内容分两部分：
  {streaming && streaming.status !== 'idle' && (
    <>
      {/* Part A: 已完成的工具调用（从不改变） */}
      <div className="meso-message-list__frozen-tools">
        {completedTools.map(id => (
          <ToolCallBlock
            key={id}  // ← 稳定的 key
            toolCall={stream.toolCalls[id]}
            // 已完成，不需要 onConfirm/onCancel
          />
        ))}
      </div>

      {/* Part B: 当前进行中的内容（可变） */}
      <div className="meso-message-list__streaming-head">
        {currentTool && (
          <ToolCallBlock
            toolCall={currentTool}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        )}
        {streaming.textContent && (
          <ChatBubble content={streaming.textContent} streaming />
        )}
      </div>
    </>
  )}
}
```

### 方案 B：Fragment 分离

使用 React Fragment 将流式内容分离为多个独立的"不可变块"：

```tsx
function renderLiveTrace(stream: StreamState) {
  // 计算哪些工具调用已经"完成"且应该"固定"
  const frozenToolIds = calculateFrozenToolIds(stream)
  const currentToolId = stream.toolCallOrder[stream.toolCallOrder.length - 1]

  return (
    <>
      {/* 已固定的工具调用（frozen） */}
      {frozenToolIds.map(id => (
        <Fragment key={`frozen-${id}`}>
          <CollapsibleToolTrace
            stream={{ ...stream, toolCallOrder: [id] }}
            defaultExpanded="all"
            // 不传 onConfirm/onCancel（已完成，不需要交互）
          />
        </Fragment>
      ))}

      {/* 当前工具（可能变化） */}
      {currentToolId && (
        <Fragment key={`current-${currentToolId}`}>
          <CollapsibleToolTrace
            stream={{ ...stream, toolCallOrder: [currentToolId] }}
            defaultExpanded="all"
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        </Fragment>
      )}

      {/* 文本和 artifacts */}
      <ChatBubble content={stream.textContent} streaming />
    </>
  )
}

function calculateFrozenToolIds(stream: StreamState): string[] {
  // 规则：如果一个工具调用有 result 且不是最后一个，就冻结它
  const currentIndex = stream.toolCallOrder.length - 1
  return stream.toolCallOrder.slice(0, currentIndex).filter(id => {
    const tc = stream.toolCalls[id]
    return tc.result !== undefined || tc.status !== 'pending'
  })
}
```

### 方案 C：Pinned Content（最简）

使用 `useFoldState` 的 `pinnedContent` 模式（现有代码已支持）：

```tsx
function CollapsibleToolTrace({
  stream,
  streaming,
  defaultExpanded,
  pinnedContent,  // ← 新增
}: CollapsibleToolTraceProps) {
  // 如果提供了 pinnedContent，说明这个工具已"冻结"
  // 不应该再响应状态变化
  if (pinnedContent) {
    return pinnedContent
  }

  // 否则正常渲染（可能变化）
  return <div>{/* 动态内容 */}</div>
}
```

---

## CSS 考虑

### 避免 Layout Shift

确保已固定的工具调用块不会因为新元素出现而移动：

```css
.meso-message-list__frozen-tools {
  display: flex;
  flex-direction: column;
  gap: 0;  /* 不要有 gap，避免 reflow */
}

.meso-collapsible-tool__item {
  /* 使用 CSS Grid 或 Flex 的固定大小 */
  /* 避免内容导致高度变化 */
  contain: layout;  /* CSS containment 优化 */
}
```

---

## 实施检查清单

- [ ] 分离"已完成"和"当前进行中"的工具调用
- [ ] 为每个工具调用使用稳定的 `key`（基于 toolCallId）
- [ ] 已完成的工具不传递 `onConfirm`/`onCancel` 回调
- [ ] 确认门只在"当前"工具上显示，不会追溯到前面
- [ ] 测试：确认确认门出现时，前面的工具位置不变
- [ ] 测试：快速滚动时，前面的内容不抖动

---

## 验证方式

### 测试用例 1：确认门不会插入

```
1. 开始流式会话，工具调用发起
2. 工具调用完成，出现结果
3. 工具标记为 awaiting_confirm
4. ✓ 确认门应该追加到底部，前面的工具位置不变
```

### 测试用例 2：多个工具顺序不变

```
1. Tool A 完成（有结果）
2. Tool B 完成（有结果）
3. Tool C 开始（pending）
4. Tool C 完成（awaiting_confirm）
5. ✓ A → B → C 的顺序不变，没有重排
```

### 测试用例 3：Scroll 稳定

```
1. 用户向上滚动，查看前面的工具调用
2. 新的工具调用完成，追加到底部
3. ✓ 用户仍能看到前面的工具调用内容，未因新增内容而跳动
```

---

## 参考：CLAUDE.md 相关原则

> Streaming → done 渲染路径必须同源
>
> 原则：streaming 与 done 必须共用同一渲染路径。done 不是"换组件"，是"同组件的不同 prop 状态"。

这个原则的延伸应用到流式 UI 的线性追加：
- 不应该有"两条渲染路径"
- 已完成的工具和当前工具应该用同一个组件渲染
- 区别只是 prop 的差异（如 `onConfirm` 的有无），不是组件的切换
