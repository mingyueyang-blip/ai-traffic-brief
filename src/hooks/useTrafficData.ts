import { useMemo } from 'react'
import { useLens } from '../context/LensContext'
import type { TrafficOverview, TrendDataPoint, DimensionBreakdown, DistributionItem, SubscriptionData, AllLensData } from '../data/types'

// import.meta.glob won't fail if the file doesn't exist yet
const modules = import.meta.glob('../data/posthog/latest.json', { eager: true })
const posthogRaw = Object.values(modules)[0] as AllLensData | undefined

export interface TrafficData {
  overview: TrafficOverview
  trends: TrendDataPoint[]
  dimensions: DimensionBreakdown[]
  distribution: DistributionItem[]
  totalUsers: number
  subscription?: SubscriptionData
}

const EMPTY_DATA: TrafficData = {
  overview: {
    currentPV: 0, previousPV: 0,
    currentUsers: 0, previousUsers: 0,
    pvChangePct: 0, usersChangePct: 0,
  },
  trends: [],
  dimensions: [],
  distribution: [],
  totalUsers: 0,
}

export function useTrafficData(): TrafficData {
  const { lens } = useLens()

  return useMemo(() => {
    if (posthogRaw?.lenses?.[lens]) {
      const d = posthogRaw.lenses[lens]
      return {
        overview: d.overview,
        trends: d.trends,
        dimensions: d.dimensions,
        distribution: d.distribution,
        totalUsers: d.totalUsers,
        subscription: d.subscription,
      }
    }

    console.warn('No PostHog data found. Run `pnpm fetch-data` to fetch real data.')
    return EMPTY_DATA
  }, [lens])
}
