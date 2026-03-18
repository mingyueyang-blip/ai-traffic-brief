import type { DimensionType } from '../data/types'

export interface DimensionConfig {
  key: DimensionType
  label: string
  shortLabel: string
}

export const DIMENSIONS: DimensionConfig[] = [
  { key: 'country', label: 'Country', shortLabel: 'Country' },
  { key: 'source', label: 'UTM Source', shortLabel: 'Source' },
  { key: 'medium', label: 'UTM Medium', shortLabel: 'Medium' },
  { key: 'campaign', label: 'UTM Campaign', shortLabel: 'Campaign' },
  { key: 'content', label: 'UTM Content', shortLabel: 'Content' },
  { key: 'device', label: 'Device Type', shortLabel: 'Device' },
  { key: 'path', label: 'Path Name', shortLabel: 'Path' },
  { key: 'share_type', label: 'Share Type', shortLabel: 'Share Type' },
  { key: 'referring_domain', label: 'Referring Domain', shortLabel: 'Referrer' },
]
