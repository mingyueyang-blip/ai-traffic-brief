import { useLens } from '../../context/LensContext'
import { LENSES } from '../../config/lenses'
import type { TimeSpan } from '../../data/types'

const TIME_OPTIONS: { key: TimeSpan; label: string }[] = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

export default function LensSwitcher() {
  const { lens, setLens, timeSpan, setTimeSpan } = useLens()

  return (
    <div className="border-b border-border bg-base/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        {/* Lens tabs — left */}
        <div className="flex gap-1">
          {LENSES.map(({ key, shortLabel }) => (
            <button
              key={key}
              onClick={() => setLens(key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                lens === key
                  ? 'bg-brand/20 text-brand border border-brand/30'
                  : 'text-secondary hover:text-primary hover:bg-elevated border border-transparent'
              }`}
            >
              {shortLabel}
            </button>
          ))}
        </div>

        {/* Time span toggle — right */}
        <div className="flex rounded-md border border-border overflow-hidden">
          {TIME_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeSpan(key)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                timeSpan === key
                  ? 'bg-elevated text-primary'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
