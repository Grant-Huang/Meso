import { createContext, useContext, type ReactNode } from 'react'
import {
  type MesoLabels,
  type MesoLocale,
  defaultLabelsByLocale,
  zhCNLabels,
} from './labels'

export interface MesoLocaleContextValue {
  locale: MesoLocale
  labels: MesoLabels
}

const MesoLocaleContext = createContext<MesoLocaleContextValue>({
  locale: 'zh-CN',
  labels: zhCNLabels,
})

export interface MesoLocaleProviderProps {
  locale?: MesoLocale
  labels?: Partial<MesoLabels>
  children: ReactNode
}

export function MesoLocaleProvider({
  locale = 'zh-CN',
  labels: labelOverrides,
  children,
}: MesoLocaleProviderProps) {
  const labels = { ...defaultLabelsByLocale[locale], ...labelOverrides }
  return (
    <MesoLocaleContext.Provider value={{ locale, labels }}>
      {children}
    </MesoLocaleContext.Provider>
  )
}

export function useMesoLabels(): MesoLabels {
  return useContext(MesoLocaleContext).labels
}

export function useMesoLocale(): MesoLocaleContextValue {
  return useContext(MesoLocaleContext)
}
