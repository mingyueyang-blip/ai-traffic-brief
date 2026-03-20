import { useState } from 'react'
import type { AnomalyCandidate } from '../../data/types'
import { useLens } from '../../context/LensContext'

interface KeySignalsSummaryProps {
  drops: AnomalyCandidate[]
  rises: AnomalyCandidate[]
  onSelectItem: (item: AnomalyCandidate) => void
}

const DEFAULT_SHOW = 5

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(0)}%`
}

/** Generate a fake sparkline array based on current/previous values and direction */
function generateFakeTrend(current: number, previous: number, span: number): number[] {
  const points: number[] = []
  const isRising = current >= previous
  const diff = current - previous
  for (let i = 0; i < span; i++) {
    const progress = i / (span - 1)
    // Smooth interpolation with jitter
    const base = previous + diff * progress
    const jitter = base * (0.92 + Math.random() * 0.16)
    points.push(Math.max(0, Math.round(jitter)))
  }
  // Ensure last point matches current
  points[points.length - 1] = current
  if (!isRising) {
    // For drops, start higher
    points[0] = Math.round(previous * (1 + Math.random() * 0.1))
  }
  return points
}

/** Tiny SVG sparkline */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const w = 48
  const h = 16
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 2) - 1
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SignalList({ title, icon, items, colorClass, sparkColor, onSelect }: {
  title: string
  icon: string
  items: AnomalyCandidate[]
  colorClass: string
  sparkColor: string
  onSelect: (item: AnomalyCandidate) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { timeSpan } = useLens()
  const spanPoints = timeSpan === '30d' ? 30 : 7
  const visible = expanded ? items : items.slice(0, DEFAULT_SHOW)
  const hasMore = items.length > DEFAULT_SHOW

  return (
    <div className="flex-1 rounded-xl border border-border bg-surface p-5">
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${colorClass}`}>
        <span>{icon}</span> {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-muted">None detected</p>
      ) : (
        <>
          <div className="space-y-2">
            {visible.map((item, i) => (
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
                  <MiniSparkline
                    data={generateFakeTrend(item.currentUsers, item.previousUsers, spanPoints)}
                    color={sparkColor}
                  />
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
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 w-full border-t border-dashed border-border pt-2 text-center text-xs font-medium text-muted hover:text-secondary transition-colors"
            >
              {expanded ? 'Show less' : `Show all ${items.length} items`}
            </button>
          )}
        </>
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
        sparkColor="#EF4444"
        onSelect={onSelectItem}
      />
      <SignalList
        title="Rises / Opportunities"
        icon="▲"
        items={rises}
        colorClass="text-sunny"
        sparkColor="#A3B54A"
        onSelect={onSelectItem}
      />
    </div>
  )
}
