import type { AnomalyCandidate } from '../../data/types'

interface KeySignalsSummaryProps {
  drops: AnomalyCandidate[]
  rises: AnomalyCandidate[]
  onSelectItem: (item: AnomalyCandidate) => void
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(0)}%`
}

function SignalList({ title, icon, items, colorClass, onSelect }: {
  title: string
  icon: string
  items: AnomalyCandidate[]
  colorClass: string
  onSelect: (item: AnomalyCandidate) => void
}) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-surface p-5">
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${colorClass}`}>
        <span>{icon}</span> {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-muted">None detected</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => onSelect(item)}
              className="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-border-hover hover:bg-elevated"
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-sm font-medium text-primary">{item.name}</span>
                <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-medium text-muted">
                  {item.dimension}
                </span>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted">
                  {item.previousUsers?.toLocaleString() ?? '?'} → {item.currentUsers?.toLocaleString() ?? '?'}
                </span>
                <span className={`font-mono text-sm font-semibold ${colorClass}`}>
                  {formatPct(item.usersChangePct)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function KeySignalsSummary({ drops, rises, onSelectItem }: KeySignalsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SignalList
        title="Drops / Risks"
        icon="▼"
        items={drops}
        colorClass="text-storm"
        onSelect={onSelectItem}
      />
      <SignalList
        title="Rises / Opportunities"
        icon="▲"
        items={rises}
        colorClass="text-sunny"
        onSelect={onSelectItem}
      />
    </div>
  )
}
