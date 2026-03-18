import { useMemo } from 'react'
import type { TrafficOverview, TrendDataPoint, DimensionBreakdown } from '../data/types'

// import.meta.glob won't fail if the file doesn't exist yet
const modules = import.meta.glob('../data/posthog/latest.json', { eager: true })
const posthogRaw = Object.values(modules)[0] as Record<string, unknown> | undefined

interface TrafficData {
  overview: TrafficOverview
  trends: TrendDataPoint[]
  dimensions: DimensionBreakdown[]
}

const EMPTY_DATA: TrafficData = {
  overview: {
    currentPV: 0, previousPV: 0,
    currentUsers: 0, previousUsers: 0,
    pvChangePct: 0, usersChangePct: 0,
  },
  trends: [],
  dimensions: [],
}

export function useTrafficData(): TrafficData {
  return useMemo(() => {
    if (posthogRaw) {
      return {
        overview: posthogRaw.overview as TrafficOverview,
        trends: posthogRaw.trends as TrendDataPoint[],
        dimensions: posthogRaw.dimensions as DimensionBreakdown[],
      }
    }

    console.warn('No PostHog data found. Run `pnpm fetch-data` to fetch real data.')
    return EMPTY_DATA
  }, [])
}
