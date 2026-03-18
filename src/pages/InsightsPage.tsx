import { useState } from 'react'
import { useTrafficData } from '../hooks/useTrafficData'
import { useAnomalyEngine } from '../hooks/useAnomalyEngine'
import { getTopDrops, getTopRises } from '../engine/alerts'
import type { DimensionItem } from '../data/types'
import KeySignalsSummary from '../components/insights/KeySignalsSummary'
import TrendChart from '../components/insights/TrendChart'
import DimensionMovers from '../components/insights/DimensionMovers'
import DrilldownPanel from '../components/insights/DrilldownPanel'

export default function InsightsPage() {
  const { overview, trends, dimensions } = useTrafficData()
  const { anomalies } = useAnomalyEngine(overview, dimensions)
  const [selectedItem, setSelectedItem] = useState<DimensionItem | null>(null)

  const drops = getTopDrops(anomalies)
  const rises = getTopRises(anomalies)

  return (
    <div className="space-y-6">
      {/* Key Signals Summary at top */}
      <KeySignalsSummary
        drops={drops}
        rises={rises}
        onSelectItem={setSelectedItem}
      />

      {/* Main content: left-right split */}
      <div className="flex gap-6">
        {/* Left panel — ~65% */}
        <div className="flex-[65] min-w-0 space-y-6">
          <TrendChart data={trends} />
          <DimensionMovers
            dimensions={dimensions}
            onSelectItem={setSelectedItem}
            selectedItem={selectedItem}
          />
        </div>

        {/* Right panel — ~35% */}
        <div className="flex-[35] min-w-0">
          <div className="sticky top-20">
            <DrilldownPanel item={selectedItem} />
          </div>
        </div>
      </div>
    </div>
  )
}
