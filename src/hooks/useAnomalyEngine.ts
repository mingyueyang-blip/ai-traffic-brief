import { useMemo } from 'react'
import type { TrafficOverview, DimensionBreakdown, AnomalyCandidate } from '../data/types'
import type { WeatherResult } from '../engine/weather'
import { detectAnomalies } from '../engine/anomaly'
import { determineWeather } from '../engine/weather'

interface AnomalyEngineResult {
  anomalies: AnomalyCandidate[]
  weather: WeatherResult
}

export function useAnomalyEngine(
  overview: TrafficOverview,
  dimensions: DimensionBreakdown[],
): AnomalyEngineResult {
  return useMemo(() => {
    const allItems = dimensions.flatMap(d => d.items)
    const anomalies = detectAnomalies(allItems)
    const weather = determineWeather(overview, anomalies)
    return { anomalies, weather }
  }, [overview, dimensions])
}
