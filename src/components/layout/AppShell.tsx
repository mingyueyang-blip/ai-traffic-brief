import type { ReactNode } from 'react'
import Header from './Header'
import LensSwitcher from './LensSwitcher'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base">
      <Header />
      <LensSwitcher />
      <main className="mx-auto max-w-6xl px-6 py-6">
        {children}
      </main>
    </div>
  )
}
