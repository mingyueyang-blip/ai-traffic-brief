import type { DimensionType, LensKey } from '../data/types'

export interface LensConfig {
  key: LensKey
  label: string
  shortLabel: string
  usersLabel: string
  distributionTitle: string
  mediumFilter: (string | null)[]
  distributionDimension: DimensionType
  visibleDimensions: DimensionType[]
  /** Tooltip definitions for the 3 metric cards */
  tooltips: {
    users: string
    pv: string
    share: string
  }
  /** PostHog insight link (placeholder) */
  posthogUrl: string
}

const PH = 'https://us.posthog.com/project/59325/insights/new'

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
    tooltips: {
      users: "Unique visitors with utm_medium IN ('cpc', 'paid-social', 'display', 'paid', 'paid_social', 'ads')",
      pv: "Total $pageview events matching the Paid Ads medium filter",
      share: "Paid Ads users \u00F7 all site visitors",
    },
    posthogUrl: `${PH}?insight=TRENDS&events=[{"id":"$pageview"}]&properties=[{"key":"utm_medium","value":["cpc","paid-social","display"],"operator":"exact","type":"event"}]`,
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
    tooltips: {
      users: "Unique visitors with utm_medium = 'influencer'",
      pv: "Total $pageview events from influencer traffic",
      share: "KOL users \u00F7 all site visitors",
    },
    posthogUrl: `${PH}?insight=TRENDS&events=[{"id":"$pageview"}]&properties=[{"key":"utm_medium","value":"influencer","operator":"exact","type":"event"}]`,
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
    tooltips: {
      users: "Unique visitors with no utm_medium (organic) or utm_medium = 'social'",
      pv: "Total $pageview events from organic / social traffic",
      share: "SEO users \u00F7 all site visitors",
    },
    posthogUrl: `${PH}?insight=TRENDS&events=[{"id":"$pageview"}]&properties=[{"key":"utm_medium","value":"is_not_set","operator":"is_not_set","type":"event"}]`,
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
    tooltips: {
      users: "Unique visitors with utm_medium IN ('referral-program', 'link', 'email')",
      pv: "Total $pageview events from referral / link / email traffic",
      share: "Growth PM users \u00F7 all site visitors",
    },
    posthogUrl: `${PH}?insight=TRENDS&events=[{"id":"$pageview"}]&properties=[{"key":"utm_medium","value":["referral-program","link","email"],"operator":"exact","type":"event"}]`,
  },
]

export const LENS_MAP = Object.fromEntries(LENSES.map(l => [l.key, l])) as Record<LensKey, LensConfig>
