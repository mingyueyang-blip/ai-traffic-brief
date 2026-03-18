import { useState } from 'react'
import type { DimensionBreakdown, DimensionItem, DimensionType } from '../../data/types'
import { DIMENSIONS } from '../../config/dimensions'
import { getTopRising, getTopDropping } from '../../engine/anomaly'

interface DimensionMoversProps {
  dimensions: DimensionBreakdown[]
  onSelectItem: (item: DimensionItem) => void
  selectedItem: DimensionItem | null
}

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
  const [activeTab, setActiveTab] = useState<DimensionType>('country')

  const currentDimension = dimensions.find(d => d.dimension === activeTab)
  const items = currentDimension?.items ?? []
  const rising = getTopRising(items)
  const dropping = getTopDropping(items)

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      {/* Dimension tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {DIMENSIONS.map(({ key, shortLabel }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? 'bg-brand-glow text-brand'
                : 'text-secondary hover:text-primary hover:bg-elevated'
            }`}
          >
            {shortLabel}
          </button>
        ))}
      </div>

      {/* Two-column rising/dropping */}
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
    </div>
  )
}
