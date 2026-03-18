import { useLens } from '../../context/LensContext'
import { LENSES } from '../../config/lenses'

export default function LensSwitcher() {
  const { lens, setLens } = useLens()

  return (
    <div className="border-b border-border bg-base/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-2">
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
    </div>
  )
}
