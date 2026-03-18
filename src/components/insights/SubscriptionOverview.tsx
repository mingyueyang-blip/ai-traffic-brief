import type { SubscriptionData } from '../../data/types'

interface SubscriptionOverviewProps {
  data: SubscriptionData
  totalUsers: number
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(1)}%`
}

export default function SubscriptionOverview({ data, totalUsers }: SubscriptionOverviewProps) {
  const conversionRate = totalUsers > 0
    ? data.currentUsers / totalUsers
    : 0

  const pctColor = data.changePct > 0
    ? 'text-sunny'
    : data.changePct < -0.05
      ? 'text-storm'
      : 'text-cloudy'

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-semibold text-primary">Subscribed Users</h3>

      <div className="mb-5 flex items-baseline gap-6 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            {data.currentUsers.toLocaleString()}
          </span>
          <span className={`text-sm font-semibold ${pctColor}`}>
            {formatPct(data.changePct)}
          </span>
        </div>
        <span className="text-muted">·</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-muted">vs yesterday</span>
          <span className="text-sm text-secondary">{data.previousUsers.toLocaleString()}</span>
        </div>
        <span className="text-muted">·</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-secondary">
            {(conversionRate * 100).toFixed(2)}%
          </span>
          <span className="text-xs text-muted">conversion</span>
        </div>
      </div>

      {data.byCountry.length > 0 && (
        <>
          <h4 className="mb-2 text-xs font-medium text-secondary">Top Countries</h4>
          <div className="space-y-1.5">
            {data.byCountry.slice(0, 5).map((c) => (
              <div key={c.country} className="flex items-center justify-between rounded-lg px-3 py-1.5">
                <span className="text-sm text-primary">{c.country}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    {c.previousUsers.toLocaleString()} → {c.currentUsers.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.currentUsers === 0 && data.previousUsers === 0 && (
        <p className="text-xs text-muted">No subscription events in the last 2 days.</p>
      )}
    </div>
  )
}
