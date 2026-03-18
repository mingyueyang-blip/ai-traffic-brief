import { useState } from 'react'
import type { BriefOutput } from '../../data/types'

interface FeishuPreviewProps {
  brief: BriefOutput
}

const weatherIcon: Record<string, string> = {
  Sunny: '☀️',
  Cloudy: '☁️',
  Storm: '⛈️',
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(0)}%`
}

export default function FeishuPreview({ brief }: FeishuPreviewProps) {
  const topDrops = brief.topDrops.slice(0, 3)
  const topRises = brief.topRises.slice(0, 3)

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">Preview of the Feishu / Slack brief card</p>

      {/* Brief Card */}
      <div className="rounded-lg border border-border bg-base p-5 space-y-4">
        {/* A. Title Area */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-semibold text-primary">AI Traffic Brief</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Last 24h</span>
            <span className="text-sm">{weatherIcon[brief.weather] ?? '☁️'} {brief.weather}</span>
          </div>
        </div>

        {/* B. Summary */}
        <p className="text-xs text-secondary">{brief.summary}</p>

        {/* C. Key Signals */}
        <div className="grid grid-cols-2 gap-3">
          {topDrops.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase text-storm">Top Drops</p>
              {topDrops.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-secondary truncate">{d.name}</span>
                  <span className="text-storm font-mono ml-2">{formatPct(d.usersChangePct)}</span>
                </div>
              ))}
            </div>
          )}
          {topRises.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase text-sunny">Top Rises</p>
              {topRises.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-secondary truncate">{r.name}</span>
                  <span className="text-sunny font-mono ml-2">{formatPct(r.usersChangePct)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* D. Alerts */}
        {brief.alerts.length > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-[10px] font-semibold uppercase text-cloudy">Alerts</p>
            {brief.alerts.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-secondary">{a.name} <span className="text-muted">({a.dimension})</span></span>
                <span className={`font-mono ${a.usersChangePct > 0 ? 'text-spike' : 'text-drop'}`}>
                  {formatPct(a.usersChangePct)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border pt-3">
          <p className="text-[10px] text-muted">Generated just now · Demo mode</p>
        </div>
      </div>

      {/* E. Subscription Block */}
      <SubscriptionBlock channels={['feishu', 'slack']} />
    </div>
  )
}

/* ── Inline Subscription Block ── */

function SubscriptionBlock({ channels }: { channels: string[] }) {
  const [channel, setChannel] = useState(channels[0])
  const [frequency, setFrequency] = useState('daily')
  const [enabled, setEnabled] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="rounded-lg border border-border/60 bg-surface/50 p-4 space-y-4">
      <p className="text-xs font-medium text-secondary">Subscription Settings</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Channel */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted">Channel</label>
          <select
            value={channel}
            onChange={e => setChannel(e.target.value)}
            className="w-full rounded-md border border-border bg-base px-2.5 py-1.5 text-xs text-primary outline-none focus:border-brand"
          >
            {channels.map(ch => (
              <option key={ch} value={ch}>{ch.charAt(0).toUpperCase() + ch.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted">Frequency</label>
          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            className="w-full rounded-md border border-border bg-base px-2.5 py-1.5 text-xs text-primary outline-none focus:border-brand"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="anomaly">On anomaly</option>
          </select>
        </div>
      </div>

      {/* Toggle + Save */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? 'bg-brand' : 'bg-border'}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'left-[18px]' : 'left-0.5'}`}
            />
          </button>
          <span className="text-xs text-secondary">{enabled ? 'Subscribed' : 'Off'}</span>
        </div>

        <button
          onClick={handleSave}
          className="rounded-md bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand/20"
        >
          Save
        </button>
      </div>

      {saved && (
        <p className="text-center text-[11px] text-brand">Preferences saved (demo mode)</p>
      )}
    </div>
  )
}
