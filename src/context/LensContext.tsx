import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LensKey } from '../data/types'

interface LensContextValue {
  lens: LensKey
  setLens: (lens: LensKey) => void
}

const LensContext = createContext<LensContextValue>({
  lens: 'all',
  setLens: () => {},
})

export function LensProvider({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<LensKey>('all')
  return (
    <LensContext.Provider value={{ lens, setLens }}>
      {children}
    </LensContext.Provider>
  )
}

export function useLens() {
  return useContext(LensContext)
}
