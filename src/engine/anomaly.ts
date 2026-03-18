import type { DimensionItem, AnomalyCandidate, Severity, StatusTag } from '../data/types'
import { ANOMALY_CHANGE_THRESHOLD, MIN_USERS_THRESHOLD, DIMENSION_TOP_COUNT } from '../config/thresholds'

function getSeverity(changePct: number, currentUsers: number): Severity {
  const absChange = Math.abs(changePct)
  if (absChange > 0.5 && currentUsers >= 100) return 'high'
  if (absChange > 0.3 && currentUsers >= 50) return 'medium'
  return 'low'
}

function getStatusTag(changePct: number): StatusTag {
  if (changePct > ANOMALY_CHANGE_THRESHOLD) return 'Spike'
  if (changePct < -ANOMALY_CHANGE_THRESHOLD) return 'Drop'
  return 'Watch'
}

function buildDescription(item: DimensionItem): string {
  const direction = item.usersChangePct > 0 ? 'increased' : 'decreased'
  const pct = Math.abs(item.usersChangePct * 100).toFixed(0)
  return `${item.name} users ${direction} ${pct}% (${item.previousUsers.toLocaleString()} → ${item.currentUsers.toLocaleString()})`
}

export function detectAnomalies(items: DimensionItem[]): AnomalyCandidate[] {
  return items
    .filter(item => {
      if (item.currentUsers < MIN_USERS_THRESHOLD && item.previousUsers < MIN_USERS_THRESHOLD) return false
      const changePct = item.previousUsers === 0
        ? (item.currentUsers > 0 ? 1 : 0)
        : item.usersChangePct
      return Math.abs(changePct) > ANOMALY_CHANGE_THRESHOLD
    })
    .map(item => ({
      ...item,
      severity: getSeverity(item.usersChangePct, item.currentUsers),
      statusTag: getStatusTag(item.usersChangePct),
      description: buildDescription(item),
    }))
}

export function getTopRising(items: DimensionItem[], count = DIMENSION_TOP_COUNT): DimensionItem[] {
  return [...items]
    .filter(i => i.usersChangePct > 0)
    .sort((a, b) => b.usersChangePct - a.usersChangePct)
    .slice(0, count)
}

export function getTopDropping(items: DimensionItem[], count = DIMENSION_TOP_COUNT): DimensionItem[] {
  return [...items]
    .filter(i => i.usersChangePct < 0)
    .sort((a, b) => a.usersChangePct - b.usersChangePct)
    .slice(0, count)
}
