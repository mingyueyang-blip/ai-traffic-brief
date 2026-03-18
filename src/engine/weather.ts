import type { TrafficOverview, AnomalyCandidate, WeatherStatus } from '../data/types'
import { WEATHER_RULES } from '../config/thresholds'

export interface WeatherResult {
  status: WeatherStatus
  summary: string
}

export function determineWeather(
  overview: TrafficOverview,
  anomalies: AnomalyCandidate[]
): WeatherResult {
  const { usersChangePct } = overview
  const anomalyCount = anomalies.length
  const absChange = Math.abs(usersChangePct)

  // Priority: Storm > Cloudy > Sunny

  // Storm
  if (
    usersChangePct < WEATHER_RULES.stormDropThreshold ||
    anomalyCount >= WEATHER_RULES.stormAnomalyCount
  ) {
    const reason = usersChangePct < WEATHER_RULES.stormDropThreshold
      ? `Users dropped ${Math.abs(usersChangePct * 100).toFixed(0)}%`
      : `${anomalyCount} anomalies detected`
    return {
      status: 'Storm',
      summary: `${reason}. Immediate attention recommended.`,
    }
  }

  // Cloudy
  const [cloudyMin, cloudyMax] = WEATHER_RULES.cloudyChangeRange
  const [anomalyMin, anomalyMax] = WEATHER_RULES.cloudyAnomalyRange
  if (
    (absChange >= cloudyMin && absChange <= cloudyMax) ||
    (anomalyCount >= anomalyMin && anomalyCount <= anomalyMax)
  ) {
    return {
      status: 'Cloudy',
      summary: `Users changed ${usersChangePct > 0 ? '+' : ''}${(usersChangePct * 100).toFixed(0)}% with ${anomalyCount} notable shift${anomalyCount !== 1 ? 's' : ''}.`,
    }
  }

  // Sunny
  return {
    status: 'Sunny',
    summary: `Traffic is steady. Users changed ${usersChangePct > 0 ? '+' : ''}${(usersChangePct * 100).toFixed(0)}%, no significant anomalies.`,
  }
}
