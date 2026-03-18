import type { TrafficOverview, AnomalyCandidate, BriefOutput } from '../data/types'
import type { WeatherResult } from '../engine/weather'

export interface BriefGenerator {
  generateBrief(
    overview: TrafficOverview,
    anomalies: AnomalyCandidate[],
    weather: WeatherResult,
    lensLabel?: string,
  ): BriefOutput
}
