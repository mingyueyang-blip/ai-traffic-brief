import type { AnomalyCandidate } from '../data/types'
import { ALERTS_MAX_COUNT } from '../config/thresholds'

export function getTopAlerts(
  anomalies: AnomalyCandidate[],
  count = ALERTS_MAX_COUNT
): AnomalyCandidate[] {
  return [...anomalies]
    .sort((a, b) => {
      const absA = Math.abs(a.usersChangePct)
      const absB = Math.abs(b.usersChangePct)
      if (absA !== absB) return absB - absA
      return b.currentUsers - a.currentUsers
    })
    .slice(0, count)
}

export function getTopDrops(anomalies: AnomalyCandidate[], count = ALERTS_MAX_COUNT): AnomalyCandidate[] {
  return [...anomalies]
    .filter(a => a.usersChangePct < 0)
    .sort((a, b) => a.usersChangePct - b.usersChangePct)
    .slice(0, count)
}

export function getTopRises(anomalies: AnomalyCandidate[], count = ALERTS_MAX_COUNT): AnomalyCandidate[] {
  return [...anomalies]
    .filter(a => a.usersChangePct > 0)
    .sort((a, b) => b.usersChangePct - a.usersChangePct)
    .slice(0, count)
}
