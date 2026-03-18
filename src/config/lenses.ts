import type { DimensionType, LensKey } from '../data/types'

export interface LensConfig {
  key: LensKey
  label: string
  shortLabel: string
  /** Human-readable label for the Users metric, e.g. "Paid Ads · Acquired Users" */
  usersLabel: string
  /** Title for the Distribution chart, e.g. "Ad Platform Breakdown" */
  distributionTitle: string
  /** utm_medium values to filter by. null = "no UTM" (organic). */
  mediumFilter: (string | null)[]
  /** Which dimension to break down in the Distribution chart */
  distributionDimension: DimensionType
  /** Which dimension tabs to show in Insights */
  visibleDimensions: DimensionType[]
}

export const LENSES: LensConfig[] = [
  {
    key: 'paid-ads',
    label: 'Paid Ads',
    shortLabel: 'Paid Ads',
    usersLabel: 'Paid Ads \u00B7 Acquired Users',
    distributionTitle: 'Ad Platform Breakdown',
    mediumFilter: ['cpc', 'paid-social', 'display', 'paid', 'paid_social', 'ads'],
    distributionDimension: 'source',
    visibleDimensions: ['source', 'campaign', 'content', 'country', 'device'],
  },
  {
    key: 'kol',
    label: 'KOL & Affiliate',
    shortLabel: 'KOL',
    usersLabel: 'KOL \u00B7 Acquired Users',
    distributionTitle: 'KOL Platform Mix',
    mediumFilter: ['influencer'],
    distributionDimension: 'source',
    visibleDimensions: ['source', 'campaign', 'content', 'country'],
  },
  {
    key: 'seo',
    label: 'SEO',
    shortLabel: 'SEO',
    usersLabel: 'SEO \u00B7 Organic Users',
    distributionTitle: 'Organic Traffic Sources',
    mediumFilter: [null, 'social'],
    distributionDimension: 'referring_domain',
    visibleDimensions: ['referring_domain', 'country', 'path', 'device'],
  },
  {
    key: 'growth-pm',
    label: 'Growth PM',
    shortLabel: 'Growth PM',
    usersLabel: 'Growth PM \u00B7 Referred Users',
    distributionTitle: 'Referral Channel Mix',
    mediumFilter: ['referral-program', 'link', 'email'],
    distributionDimension: 'source',
    visibleDimensions: ['source', 'share_type', 'path'],
  },
]

export const LENS_MAP = Object.fromEntries(LENSES.map(l => [l.key, l])) as Record<LensKey, LensConfig>
