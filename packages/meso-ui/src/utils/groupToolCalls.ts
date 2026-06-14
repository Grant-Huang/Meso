import type { StreamState } from '../runtime'

export interface ToolCallGroup {
  key: string
  groupId?: string
  groupKind?: string
  ids: string[]
}

/** Group tool calls by groupId/groupKind; ungrouped calls each get their own group. */
export function groupToolCalls(stream: StreamState): ToolCallGroup[] {
  const groups = new Map<string, ToolCallGroup>()
  const order: string[] = []

  for (const id of stream.toolCallOrder) {
    const tc = stream.toolCalls[id]
    if (!tc) continue

    const key = tc.groupId
      ? `${tc.groupKind ?? 'group'}:${tc.groupId}`
      : `__single__:${id}`

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        groupId: tc.groupId,
        groupKind: tc.groupKind,
        ids: [],
      })
      order.push(key)
    }
    groups.get(key)!.ids.push(id)
  }

  return order.map(k => groups.get(k)!)
}
