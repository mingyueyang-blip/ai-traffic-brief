export type DimensionType = 'country' | 'source' | 'medium' | 'campaign' | 'content' | 'device' | 'path' | 'share_type' | 'referring_domain'

export interface TrafficOverview {
  currentPV: number
  previousPV: number
  currentUsers: number
  previousUsers: number
  pvChangePct: number
  usersChangePct: number
}

export interface DimensionItem {
  name: string
  dimension: DimensionType
  currentPV: number
  previousPV: number
  currentUsers: number
  previousUsers: number
  pvChangePct: number
  usersChangePct: number
}

export interface TrendDataPoint {
  date: string       // 'YYYY-MM-DD'
  pv: number
  users: number
}

// Weather: only 3 states (Opportunity removed)
export type WeatherStatus = 'Sunny' | 'Cloudy' | 'Storm'

export type Severity = 'high' | 'medium' | 'low'
export type StatusTag = 'Spike' | 'Drop' | 'Watch'

export interface AnomalyCandidate extends DimensionItem {
  severity: Severity
  statusTag: StatusTag
  description: string
}

export interface BriefOutput {
  headline: string
  weather: WeatherStatus
  weatherSummary: string
  summary: string
  keySignals: string[]
  suggestedChecks: string[]
  alerts: AnomalyCandidate[]
  topDrops: AnomalyCandidate[]
  topRises: AnomalyCandidate[]
}

export interface DimensionBreakdown {
  dimension: DimensionType
  label: string
  items: DimensionItem[]
}

// ── Lens Architecture ──────────────────────────────────

export type LensKey = 'paid-ads' | 'kol' | 'seo' | 'growth-pm'

export interface DistributionItem {
  name: string
  currentUsers: number
  previousUsers: number
  currentPct: number
  previousPct: number
}

export interface SubscriptionCountry {
  country: string
  currentUsers: number
  previousUsers: number
}

export interface SubscriptionData {
  currentUsers: number
  previousUsers: number
  changePct: number
  byCountry: SubscriptionCountry[]
}

export interface LensData {
  overview: TrafficOverview
  trends: TrendDataPoint[]
  dimensions: DimensionBreakdown[]
  distribution: DistributionItem[]
  totalUsers: number
  subscription?: SubscriptionData
}

export interface AllLensData {
  fetchedAt: string
  lenses: Record<LensKey, LensData>
}
