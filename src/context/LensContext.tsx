import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LensKey, TimeSpan } from '../data/types'

interface LensContextValue {
  lens: LensKey
  setLens: (lens: LensKey) => void
  timeSpan: TimeSpan
  setTimeSpan: (ts: TimeSpan) => void
}

const LensContext = createContext<LensContextValue>({
  lens: 'paid-ads',
  setLens: () => {},
  timeSpan: '7d',
  setTimeSpan: () => {},
})

export function LensProvider({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<LensKey>('paid-ads')
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('7d')
  return (
    <LensContext.Provider value={{ lens, setLens, timeSpan, setTimeSpan }}>
      {children}
    </LensContext.Provider>
  )
}

export function useLens() {
  return useContext(LensContext)
}
