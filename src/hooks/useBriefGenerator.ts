import { useMemo } from 'react'
import type { TrafficOverview, AnomalyCandidate, BriefOutput } from '../data/types'
import type { WeatherResult } from '../engine/weather'
import { generator } from '../generator'

export function useBriefGenerator(
  overview: TrafficOverview,
  anomalies: AnomalyCandidate[],
  weather: WeatherResult,
): BriefOutput {
  return useMemo(
    () => generator.generateBrief(overview, anomalies, weather),
    [overview, anomalies, weather],
  )
}
