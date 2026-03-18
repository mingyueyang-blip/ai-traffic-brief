export type DimensionType = 'country' | 'source' | 'medium' | 'campaign' | 'content' | 'device' | 'path'

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

// New streamlined brief output
export interface BriefOutput {
  headline: string
  weather: WeatherStatus
  weatherSummary: string
  summary: string              // 1-2 sentence AI summary
  keySignals: string[]         // 3-4 bullet points
  suggestedChecks: string[]    // max 2, short
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

export type LensKey = 'all' | 'paid-ads' | 'kol' | 'seo' | 'growth-pm'

export interface DistributionItem {
  name: string
  currentUsers: number
  previousUsers: number
  currentPct: number    // today's share (0-1)
  previousPct: number   // yesterday's share (0-1)
}

export interface LensData {
  overview: TrafficOverview
  trends: TrendDataPoint[]
  dimensions: DimensionBreakdown[]
  distribution: DistributionItem[]
  totalUsers: number  // site-wide total Users (for share calculation)
}

export interface AllLensData {
  fetchedAt: string
  lenses: Record<LensKey, LensData>
}
