import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface SharedArtifact {
  id: string
  label: string
  lang: string
  content: string
  /** true while content is still streaming in */
  streaming?: boolean
}

interface ArtifactContextValue {
  artifacts: SharedArtifact[]
  setArtifacts: (arts: SharedArtifact[]) => void
  clearArtifacts: () => void
  /** 当前请求切换到的右栏 tab id（null 表示无请求，由 App 消费后清回 null）*/
  openTabId: string | null
  /** 主窗口链接卡片调用：设置 openTabId 触发右栏切到对应 tab */
  openArtifactTab: (id: string) => void
  /** App 消费 openTabId 后调用，清回 null 以允许用户手动切换 */
  consumeOpenTab: () => void
}

const ArtifactContext = createContext<ArtifactContextValue | null>(null)

export function ArtifactProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifactsState] = useState<SharedArtifact[]>([])
  const [openTabId, setOpenTabId] = useState<string | null>(null)

  const setArtifacts = useCallback((arts: SharedArtifact[]) => {
    setArtifactsState(arts)
  }, [])

  const clearArtifacts = useCallback(() => {
    setArtifactsState([])
  }, [])

  const openArtifactTab = useCallback((id: string) => {
    setOpenTabId(id)
  }, [])

  const consumeOpenTab = useCallback(() => {
    setOpenTabId(null)
  }, [])

  return (
    <ArtifactContext.Provider value={{ artifacts, setArtifacts, clearArtifacts, openTabId, openArtifactTab, consumeOpenTab }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export function useArtifactContext(): ArtifactContextValue {
  const ctx = useContext(ArtifactContext)
  if (!ctx) throw new Error('useArtifactContext must be used within ArtifactProvider')
  return ctx
}

/** Map artifact ids to human-readable tab labels for the right pane. */
export const ARTIFACT_LABELS: Record<string, string> = {
  report: '诊断报告',
  'oee-table': 'OEE 明细',
  dashboard: 'OEE 看板',
}
