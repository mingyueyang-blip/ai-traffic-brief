import type { TrafficOverview, AnomalyCandidate, BriefOutput } from '../data/types'
import type { WeatherResult } from '../engine/weather'
import type { BriefGenerator } from './types'
import { getTopAlerts, getTopDrops, getTopRises } from '../engine/alerts'

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(0)}%`
}

function generateHeadline(overview: TrafficOverview, weather: WeatherResult): string {
  const dir = overview.usersChangePct > 0 ? 'up' : 'down'
  const pct = Math.abs(overview.usersChangePct * 100).toFixed(0)

  switch (weather.status) {
    case 'Storm':
      return `Users ${dir} ${pct}% — multiple signals need attention`
    case 'Cloudy':
      return `Users ${dir} ${pct}% — some notable shifts detected`
    case 'Sunny':
      return `Users ${formatPct(overview.usersChangePct)} — steady, no anomalies`
  }
}

function generateSummary(overview: TrafficOverview, anomalies: AnomalyCandidate[], weather: WeatherResult, lensLabel?: string): string {
  const usersPct = formatPct(overview.usersChangePct)
  const drops = anomalies.filter(a => a.statusTag === 'Drop')
  const spikes = anomalies.filter(a => a.statusTag === 'Spike')
  const subject = lensLabel ? `${lensLabel} Users` : 'Unique Users'

  if (weather.status === 'Storm') {
    return `${subject} changed ${usersPct} in the last 24h. ${drops.length} significant drop${drops.length !== 1 ? 's' : ''} detected across dimensions.`
  }
  if (drops.length > 0 && spikes.length > 0) {
    return `${subject} changed ${usersPct}. Mixed signals: ${drops.length} drop${drops.length !== 1 ? 's' : ''} and ${spikes.length} rise${spikes.length !== 1 ? 's' : ''} worth noting.`
  }
  if (drops.length > 0) {
    return `${subject} changed ${usersPct} with ${drops.length} notable decline${drops.length !== 1 ? 's' : ''}.`
  }
  if (spikes.length > 0) {
    return `${subject} changed ${usersPct} with ${spikes.length} growth signal${spikes.length !== 1 ? 's' : ''}.`
  }
  return `${subject} changed ${usersPct}. No significant anomalies detected.`
}

function generateKeySignals(overview: TrafficOverview, anomalies: AnomalyCandidate[]): string[] {
  const signals: string[] = []

  signals.push(
    `Users: ${overview.previousUsers.toLocaleString()} → ${overview.currentUsers.toLocaleString()} (${formatPct(overview.usersChangePct)})`
  )

  const drops = anomalies.filter(a => a.statusTag === 'Drop').sort((a, b) => a.usersChangePct - b.usersChangePct)
  const spikes = anomalies.filter(a => a.statusTag === 'Spike').sort((a, b) => b.usersChangePct - a.usersChangePct)

  if (drops.length > 0) {
    signals.push(`Biggest drop: ${drops[0].name} (${formatPct(drops[0].usersChangePct)})`)
  }
  if (spikes.length > 0) {
    signals.push(`Biggest rise: ${spikes[0].name} (${formatPct(spikes[0].usersChangePct)})`)
  }

  if (anomalies.length > 0) {
    const dims = new Set(anomalies.map(a => a.dimension))
    signals.push(`${anomalies.length} anomalies across ${dims.size} dimension${dims.size !== 1 ? 's' : ''}`)
  }

  return signals.slice(0, 4)
}

function generateSuggestedChecks(anomalies: AnomalyCandidate[]): string[] {
  const checks: string[] = []
  const drops = anomalies.filter(a => a.statusTag === 'Drop').sort((a, b) => a.usersChangePct - b.usersChangePct)
  const spikes = anomalies.filter(a => a.statusTag === 'Spike').sort((a, b) => b.usersChangePct - a.usersChangePct)

  if (drops.length > 0) {
    checks.push(`Investigate ${drops[0].name} ${formatPct(drops[0].usersChangePct)} drop`)
  }
  if (spikes.length > 0) {
    checks.push(`Verify ${spikes[0].name} ${formatPct(spikes[0].usersChangePct)} spike quality`)
  }

  return checks.slice(0, 2)
}

export const templateGenerator: BriefGenerator = {
  generateBrief(
    overview: TrafficOverview,
    anomalies: AnomalyCandidate[],
    weather: WeatherResult,
    lensLabel?: string,
  ): BriefOutput {
    return {
      headline: generateHeadline(overview, weather),
      weather: weather.status,
      weatherSummary: weather.summary,
      summary: generateSummary(overview, anomalies, weather, lensLabel),
      keySignals: generateKeySignals(overview, anomalies),
      suggestedChecks: generateSuggestedChecks(anomalies),
      alerts: getTopAlerts(anomalies),
      topDrops: getTopDrops(anomalies),
      topRises: getTopRises(anomalies),
    }
  },
}
