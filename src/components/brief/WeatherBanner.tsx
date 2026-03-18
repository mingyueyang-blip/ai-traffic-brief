import type { WeatherStatus, TrafficOverview } from '../../data/types'

interface WeatherBannerProps {
  weather: WeatherStatus
  summary: string
  overview: TrafficOverview
}

const weatherConfig: Record<WeatherStatus, { icon: string; color: string; bgGlow: string }> = {
  Sunny: { icon: '☀️', color: 'text-sunny', bgGlow: 'bg-sunny/5 border-sunny/20' },
  Cloudy: { icon: '☁️', color: 'text-cloudy', bgGlow: 'bg-cloudy/5 border-cloudy/20' },
  Storm: { icon: '⛈️', color: 'text-storm', bgGlow: 'bg-storm/5 border-storm/20' },
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(1)}%`
}

export default function WeatherBanner({ weather, summary, overview }: WeatherBannerProps) {
  const config = weatherConfig[weather]

  return (
    <div className={`rounded-xl border p-5 ${config.bgGlow}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${config.color}`}>
                {weather}
              </span>
            </div>
            <p className="mt-1 text-sm text-secondary">{summary}</p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-muted">Users</p>
            <p className={`text-lg font-mono font-semibold ${overview.usersChangePct > 0 ? 'text-sunny' : 'text-storm'}`}>
              {formatPct(overview.usersChangePct)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Current</p>
            <p className="text-lg font-mono font-semibold text-primary">
              {overview.currentUsers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
