import { useMemo } from 'react'
import type { TrafficOverview, AnomalyCandidate, BriefOutput } from '../data/types'
import type { WeatherResult } from '../engine/weather'
import { generator } from '../generator'
import { useLens } from '../context/LensContext'
import { LENS_MAP } from '../config/lenses'

export function useBriefGenerator(
  overview: TrafficOverview,
  anomalies: AnomalyCandidate[],
  weather: WeatherResult,
): BriefOutput {
  const { lens } = useLens()
  const lensLabel = lens === 'all' ? undefined : LENS_MAP[lens].label

  return useMemo(
    () => generator.generateBrief(overview, anomalies, weather, lensLabel),
    [overview, anomalies, weather, lensLabel],
  )
}
