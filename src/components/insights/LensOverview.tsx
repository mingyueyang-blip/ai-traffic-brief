import { useState } from 'react'
import type { TrafficOverview } from '../../data/types'
import { useLens } from '../../context/LensContext'

interface LensOverviewProps {
  overview: TrafficOverview
  totalUsers: number
  usersLabel: string
  tooltips: { users: string; pv: string; share: string }
  posthogUrl: string
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(1)}%`
}

function MetricCard({ title, current, previous, changePct, suffix, tooltip, posthogUrl }: {
  title: string
  current: number
  previous: number
  changePct: number
  suffix?: string
  tooltip: string
  posthogUrl: string
}) {
  const [showTip, setShowTip] = useState(false)
  const { timeSpan } = useLens()
  const prevLabel = timeSpan === '7d' ? 'prev 7d' : 'prev 30d'

  const pctColor = changePct > 0
    ? 'text-sunny'
    : changePct < -0.05
      ? 'text-storm'
      : 'text-cloudy'

  return (
    <div className="relative rounded-xl border border-border bg-surface p-5">
      {/* Title row with info icon */}
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-xs font-medium text-secondary">{title}</span>
        <button
          className="relative text-muted hover:text-secondary transition-colors"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.93 12.33H7.07V7.07h1.86v5.26ZM8 5.93a1.07 1.07 0 1 1 0-2.14 1.07 1.07 0 0 1 0 2.14Z"/>
          </svg>
          {showTip && (
            <div className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border border-border bg-elevated p-3 shadow-lg">
              <p className="mb-2 text-xs leading-relaxed text-secondary">{tooltip}</p>
              <a
                href={posthogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
              >
                View in PostHog <span className="text-[10px]">↗</span>
              </a>
            </div>
          )}
        </button>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">
          {current.toLocaleString()}{suffix}
        </span>
        <span className={`text-sm font-semibold ${pctColor}`}>
          {formatPct(changePct)}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted">
        vs {prevLabel} {previous.toLocaleString()}{suffix}
      </div>
    </div>
  )
}

export default function LensOverview({ overview, totalUsers, usersLabel, tooltips, posthogUrl }: LensOverviewProps) {
  const shareOfTotal = totalUsers > 0
    ? overview.currentUsers / totalUsers
    : 0
  const prevShareOfTotal = totalUsers > 0
    ? overview.previousUsers / totalUsers
    : 0
  const sharePctChange = prevShareOfTotal > 0
    ? (shareOfTotal - prevShareOfTotal) / prevShareOfTotal
    : 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard
        title={usersLabel}
        current={overview.currentUsers}
        previous={overview.previousUsers}
        changePct={overview.usersChangePct}
        tooltip={tooltips.users}
        posthogUrl={posthogUrl}
      />
      <MetricCard
        title="Page Views"
        current={overview.currentPV}
        previous={overview.previousPV}
        changePct={overview.pvChangePct}
        tooltip={tooltips.pv}
        posthogUrl={posthogUrl}
      />
      <MetricCard
        title="Share of Total"
        current={Math.round(shareOfTotal * 1000) / 10}
        previous={Math.round(prevShareOfTotal * 1000) / 10}
        changePct={sharePctChange}
        suffix="%"
        tooltip={tooltips.share}
        posthogUrl={posthogUrl}
      />
    </div>
  )
}
