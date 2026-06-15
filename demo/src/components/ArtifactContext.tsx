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
}

const ArtifactContext = createContext<ArtifactContextValue | null>(null)

export function ArtifactProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifactsState] = useState<SharedArtifact[]>([])

  const setArtifacts = useCallback((arts: SharedArtifact[]) => {
    setArtifactsState(arts)
  }, [])

  const clearArtifacts = useCallback(() => {
    setArtifactsState([])
  }, [])

  return (
    <ArtifactContext.Provider value={{ artifacts, setArtifacts, clearArtifacts }}>
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
