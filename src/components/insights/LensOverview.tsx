import type { TrafficOverview } from '../../data/types'

interface LensOverviewProps {
  overview: TrafficOverview
  totalUsers: number
  lensLabel: string
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(1)}%`
}

export default function LensOverview({ overview, totalUsers, lensLabel }: LensOverviewProps) {
  const shareOfTotal = totalUsers > 0
    ? (overview.currentUsers / totalUsers * 100).toFixed(1)
    : '0.0'

  const pctColor = overview.usersChangePct > 0
    ? 'text-sunny'
    : overview.usersChangePct < -0.05
      ? 'text-storm'
      : 'text-cloudy'

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 text-xs font-medium text-secondary">{lensLabel}</div>
      <div className="flex items-baseline gap-6 flex-wrap">
        {/* Users */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            {overview.currentUsers.toLocaleString()}
          </span>
          <span className="text-sm text-muted">Users</span>
          <span className={`text-sm font-semibold ${pctColor}`}>
            {formatPct(overview.usersChangePct)}
          </span>
        </div>

        {/* Divider */}
        <span className="text-muted">·</span>

        {/* PV */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">
            {overview.currentPV.toLocaleString()}
          </span>
          <span className="text-sm text-muted">PV</span>
        </div>

        {/* Share of total */}
        <span className="text-muted">·</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-secondary">{shareOfTotal}%</span>
          <span className="text-xs text-muted">of total</span>
        </div>
      </div>
    </div>
  )
}
