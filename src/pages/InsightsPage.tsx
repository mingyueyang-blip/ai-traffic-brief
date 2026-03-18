import { useState } from 'react'
import { useTrafficData } from '../hooks/useTrafficData'
import { useAnomalyEngine } from '../hooks/useAnomalyEngine'
import { useLens } from '../context/LensContext'
import { LENS_MAP } from '../config/lenses'
import { getTopDrops, getTopRises } from '../engine/alerts'
import type { DimensionItem } from '../data/types'
import LensOverview from '../components/insights/LensOverview'
import TrendChart from '../components/insights/TrendChart'
import DistributionChart from '../components/insights/DistributionChart'
import KeySignalsSummary from '../components/insights/KeySignalsSummary'
import DimensionMovers from '../components/insights/DimensionMovers'
import DrilldownPanel from '../components/insights/DrilldownPanel'
import SubscriptionOverview from '../components/insights/SubscriptionOverview'

export default function InsightsPage() {
  const { overview, trends, dimensions, distribution, totalUsers, subscription } = useTrafficData()
  const { anomalies } = useAnomalyEngine(overview, dimensions)
  const { lens } = useLens()
  const lensConfig = LENS_MAP[lens]
  const [selectedItem, setSelectedItem] = useState<DimensionItem | null>(null)

  const drops = getTopDrops(anomalies)
  const rises = getTopRises(anomalies)

  return (
    <div className="space-y-6">
      {/* Lens Overview — 3-card grid */}
      <LensOverview
        overview={overview}
        totalUsers={totalUsers}
        usersLabel={lensConfig.usersLabel}
      />

      {/* Trend Chart — Users only */}
      <TrendChart data={trends} usersLabel={lensConfig.usersLabel} />

      {/* Distribution Chart */}
      <DistributionChart
        data={distribution}
        title={lensConfig.distributionTitle}
      />

      {/* Subscription Overview — Growth PM only */}
      {lens === 'growth-pm' && subscription && (
        <SubscriptionOverview data={subscription} totalUsers={totalUsers} />
      )}

      {/* Key Signals */}
      <KeySignalsSummary
        drops={drops}
        rises={rises}
        onSelectItem={setSelectedItem}
      />

      {/* Dimension Movers + Drilldown — side by side */}
      <div className="flex gap-6">
        <div className="flex-[65] min-w-0">
          <DimensionMovers
            dimensions={dimensions}
            onSelectItem={setSelectedItem}
            selectedItem={selectedItem}
          />
        </div>
        <div className="flex-[35] min-w-0">
          <div className="sticky top-20">
            <DrilldownPanel item={selectedItem} />
          </div>
        </div>
      </div>
    </div>
  )
}
