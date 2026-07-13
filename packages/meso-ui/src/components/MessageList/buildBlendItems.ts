import type { StreamState } from '../../runtime'

/**
 * Render item produced by walking eventLog. Consecutive text deltas are
 * coalesced into a single text run so prose flows naturally and Markdown can
 * be rendered on a complete run, while tool/artifact cards break the runs to
 * preserve interleaving (context-blend).
 */
export type BlendItem =
  | { kind: 'text'; key: string; text: string }
  | { kind: 'tool'; key: string; id: string }
  | { kind: 'artifact'; key: string; id: string }
  | { kind: 'resource'; key: string; id: string }
  | { kind: 'extension'; key: string; index: number }

/**
 * Walk the stream's eventLog and produce a flat list of blend items that
 * preserve the original arrival order while coalescing consecutive text
 * deltas and deduplicating artifact events.
 *
 * Why dedup artifacts: a single artifact emits multiple `artifact` events
 * (one per streaming delta plus a final done:true). Each event lands in
 * eventLog, so without dedup the same `artifact-<id>` key would be produced
 * multiple times and React warns about duplicate keys. The artifact's
 * accumulated content already lives in `stream.artifacts[id]`, so a single
 * panel per id is correct.
 */
export function buildBlendItems(stream: StreamState, hiddenArtifactLangs?: string[]): BlendItem[] {
  const items: BlendItem[] = []
  const seenArtifacts = new Set<string>()
  let textBuf = ''
  let textKey: string | null = null
  let extIndex = 0

  const flushText = () => {
    if (textKey !== null && textBuf.length > 0) {
      items.push({ kind: 'text', key: textKey, text: textBuf })
    }
    textBuf = ''
    textKey = null
  }

  for (const entry of stream.eventLog) {
    const { type, id } = entry
    if (type === 'text') {
      const chunk = stream.textChunks.find(tc => tc.id === id)
      if (!chunk) continue
      if (textKey === null) textKey = `text-${id}`
      textBuf += chunk.delta
    } else if (type === 'tool_call') {
      if (!stream.toolCalls[id]) continue
      flushText()
      items.push({ kind: 'tool', key: `tool-${id}`, id })
    } else if (type === 'resource_read') {
      if (!stream.resourceReads[id]) continue
      flushText()
      items.push({ kind: 'resource', key: `resource-${id}`, id })
    } else if (type === 'extension') {
      // 按到达顺序内联渲染扩展事件（如 citation），而非堆在会话末尾
      if (extIndex >= stream.extensionLog.length) continue
      flushText()
      items.push({ kind: 'extension', key: `ext-${extIndex}`, index: extIndex })
      extIndex++
    } else if (type === 'artifact') {
      const art = stream.artifacts[id]
      if (!art) continue
      if (hiddenArtifactLangs?.includes(art.lang)) continue
      // Skip subsequent events for an artifact already emitted (streaming deltas).
      if (seenArtifacts.has(id)) continue
      seenArtifacts.add(id)
      flushText()
      items.push({ kind: 'artifact', key: `artifact-${id}`, id })
    }
  }
  flushText()
  return items
}
