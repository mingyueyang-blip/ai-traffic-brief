import { useState, useEffect } from 'react'
import type { DimensionBreakdown, DimensionItem, DimensionType } from '../../data/types'
import { DIMENSIONS } from '../../config/dimensions'
import { useLens } from '../../context/LensContext'
import { LENS_MAP } from '../../config/lenses'
import { getTopRising, getTopDropping } from '../../engine/anomaly'
import DimensionBarChart from './DimensionBarChart'

interface DimensionMoversProps {
  dimensions: DimensionBreakdown[]
  onSelectItem: (item: DimensionItem) => void
  selectedItem: DimensionItem | null
}

type ViewMode = 'list' | 'chart'

function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${(pct * 100).toFixed(0)}%`
}

function ItemRow({ item, isSelected, onSelect }: {
  item: DimensionItem
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
        isSelected
          ? 'bg-brand-glow border border-brand/30'
          : 'hover:bg-elevated border border-transparent'
      }`}
    >
      <div className="min-w-0 flex items-center gap-3">
        <span className="truncate text-sm text-primary">{item.name}</span>
        <span className="text-xs text-muted">{item.currentUsers.toLocaleString()}</span>
      </div>
      <span className={`ml-2 shrink-0 font-mono text-sm font-semibold ${item.usersChangePct > 0 ? 'text-sunny' : 'text-storm'}`}>
        {formatPct(item.usersChangePct)}
      </span>
    </button>
  )
}

export default function DimensionMovers({ dimensions, onSelectItem, selectedItem }: DimensionMoversProps) {
  const { lens } = useLens()
  const lensConfig = LENS_MAP[lens]

  // Filter dimensions to only those visible in the current Lens
  const visibleDims = DIMENSIONS.filter(d => lensConfig.visibleDimensions.includes(d.key))
  const [activeTab, setActiveTab] = useState<DimensionType>(visibleDims[0]?.key ?? 'country')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Reset active tab when Lens changes and current tab is no longer visible
  useEffect(() => {
    if (!visibleDims.some(d => d.key === activeTab)) {
      setActiveTab(visibleDims[0]?.key ?? 'country')
    }
  }, [lens])

  const effectiveTab = visibleDims.some(d => d.key === activeTab)
    ? activeTab
    : visibleDims[0]?.key ?? 'country'

  const currentDimension = dimensions.find(d => d.dimension === effectiveTab)
  const items = currentDimension?.items ?? []
  const rising = getTopRising(items)
  const dropping = getTopDropping(items)

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      {/* Header: Dimension tabs + View toggle */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex gap-1 overflow-x-auto">
          {visibleDims.map(({ key, shortLabel }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                effectiveTab === key
                  ? 'bg-brand-glow text-brand'
                  : 'text-secondary hover:text-primary hover:bg-elevated'
              }`}
            >
              {shortLabel}
            </button>
          ))}
        </div>

        {/* List / Chart toggle */}
        <div className="flex shrink-0 rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-elevated text-primary'
                : 'text-muted hover:text-secondary'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-elevated text-primary'
                : 'text-muted hover:text-secondary'
            }`}
          >
            Chart
          </button>
        </div>
      </div>

      {/* Content: List or Chart view */}
      {viewMode === 'chart' ? (
        <DimensionBarChart items={items} onSelectItem={onSelectItem} />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-sunny">
              <span>▲</span> Rising
            </h4>
            <div className="space-y-1.5">
              {rising.map(item => (
                <ItemRow
                  key={item.name}
                  item={item}
                  isSelected={selectedItem?.name === item.name && selectedItem?.dimension === item.dimension}
                  onSelect={() => onSelectItem(item)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-storm">
              <span>▼</span> Dropping
            </h4>
            <div className="space-y-1.5">
              {dropping.map(item => (
                <ItemRow
                  key={item.name}
                  item={item}
                  isSelected={selectedItem?.name === item.name && selectedItem?.dimension === item.dimension}
                  onSelect={() => onSelectItem(item)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
