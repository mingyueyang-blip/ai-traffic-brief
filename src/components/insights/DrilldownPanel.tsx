import type { DimensionItem } from '../../data/types'
import { DIMENSIONS } from '../../config/dimensions'

interface DrilldownPanelProps {
  item: DimensionItem | null
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(1)}%`
}

function Metric({ label, current, previous, changePct }: {
  label: string
  current: number
  previous: number
  changePct: number
}) {
  return (
    <div className="rounded-lg border border-border bg-base p-3">
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-lg font-semibold text-primary">{current.toLocaleString()}</span>
        <span className={`text-sm font-mono font-medium ${changePct > 0 ? 'text-sunny' : changePct < 0 ? 'text-storm' : 'text-muted'}`}>
          {formatPct(changePct)}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted">was {previous.toLocaleString()}</p>
    </div>
  )
}

export default function DrilldownPanel({ item }: DrilldownPanelProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Select an item to view details</p>
      </div>
    )
  }

  const dimensionLabel = DIMENSIONS.find(d => d.key === item.dimension)?.label ?? item.dimension

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-muted">{dimensionLabel}</p>
        <h3 className="text-lg font-semibold text-primary">{item.name}</h3>
      </div>

      {/* Metrics — Users primary */}
      <div className="space-y-3">
        <Metric
          label="Unique Users"
          current={item.currentUsers}
          previous={item.previousUsers}
          changePct={item.usersChangePct}
        />
      </div>

      {/* Interpretation hints */}
      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Interpretation</p>
        <ul className="space-y-1.5">
          {item.usersChangePct > 0.3 && (
            <li className="text-xs text-secondary">
              Significant growth — verify if driven by campaign or organic growth
            </li>
          )}
          {item.usersChangePct < -0.3 && (
            <li className="text-xs text-secondary">
              Notable decline — check for technical issues or paused campaigns
            </li>
          )}
          {Math.abs(item.usersChangePct) <= 0.3 && (
            <li className="text-xs text-secondary">
              Within normal range — no immediate action needed
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
