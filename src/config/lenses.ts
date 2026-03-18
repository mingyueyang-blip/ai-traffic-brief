import type { DimensionType, LensKey } from '../data/types'

export interface LensConfig {
  key: LensKey
  label: string
  shortLabel: string
  /** utm_medium values to filter by. Empty = no filter (All). null = "no UTM" (organic). */
  mediumFilter: (string | null)[]
  /** Which dimension to break down in the Distribution chart */
  distributionDimension: DimensionType
  /** Which dimension tabs to show in Insights */
  visibleDimensions: DimensionType[]
}

export const LENSES: LensConfig[] = [
  {
    key: 'all',
    label: 'All Traffic',
    shortLabel: 'All',
    mediumFilter: [],
    distributionDimension: 'medium',
    visibleDimensions: ['country', 'source', 'medium', 'campaign', 'content', 'device', 'path'],
  },
  {
    key: 'paid-ads',
    label: 'Paid Ads',
    shortLabel: 'Paid Ads',
    mediumFilter: ['cpc', 'paid-social', 'display'],
    distributionDimension: 'medium',
    visibleDimensions: ['source', 'campaign', 'content', 'country', 'device'],
  },
  {
    key: 'kol',
    label: 'KOL & Affiliate',
    shortLabel: 'KOL',
    mediumFilter: ['influencer'],
    distributionDimension: 'source',
    visibleDimensions: ['source', 'campaign', 'content', 'country'],
  },
  {
    key: 'seo',
    label: 'SEO',
    shortLabel: 'SEO',
    mediumFilter: [null, 'social'],
    distributionDimension: 'country',
    visibleDimensions: ['source', 'country', 'path', 'device'],
  },
  {
    key: 'growth-pm',
    label: 'Growth PM',
    shortLabel: 'Growth PM',
    mediumFilter: ['referral-program', 'link', 'email'],
    distributionDimension: 'medium',
    visibleDimensions: ['source', 'content', 'path'],
  },
]

export const LENS_MAP = Object.fromEntries(LENSES.map(l => [l.key, l])) as Record<LensKey, LensConfig>
