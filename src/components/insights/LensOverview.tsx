import type { TrafficOverview } from '../../data/types'

interface LensOverviewProps {
  overview: TrafficOverview
  totalUsers: number
  usersLabel: string
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(1)}%`
}

function MetricCard({ title, current, previous, changePct, suffix }: {
  title: string
  current: number
  previous: number
  changePct: number
  suffix?: string
}) {
  const pctColor = changePct > 0
    ? 'text-sunny'
    : changePct < -0.05
      ? 'text-storm'
      : 'text-cloudy'

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-2 text-xs font-medium text-secondary">{title}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">
          {current.toLocaleString()}{suffix}
        </span>
        <span className={`text-sm font-semibold ${pctColor}`}>
          {formatPct(changePct)}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted">
        vs yesterday {previous.toLocaleString()}{suffix}
      </div>
    </div>
  )
}

export default function LensOverview({ overview, totalUsers, usersLabel }: LensOverviewProps) {
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
      />
      <MetricCard
        title="Page Views"
        current={overview.currentPV}
        previous={overview.previousPV}
        changePct={overview.pvChangePct}
      />
      <MetricCard
        title="Share of Total"
        current={Math.round(shareOfTotal * 1000) / 10}
        previous={Math.round(prevShareOfTotal * 1000) / 10}
        changePct={sharePctChange}
        suffix="%"
      />
    </div>
  )
}
