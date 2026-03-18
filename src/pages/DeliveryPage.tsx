import { useState } from 'react'
import { useTrafficData } from '../hooks/useTrafficData'
import { useAnomalyEngine } from '../hooks/useAnomalyEngine'
import { useBriefGenerator } from '../hooks/useBriefGenerator'
import FeishuPreview from '../components/delivery/FeishuPreview'
import EmailPreview from '../components/delivery/EmailPreview'

type TabKey = 'feishu' | 'email'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'feishu', label: 'Feishu / Slack Brief' },
  { key: 'email', label: 'Email Brief' },
]

export default function DeliveryPage() {
  const { overview, dimensions } = useTrafficData()
  const { anomalies, weather } = useAnomalyEngine(overview, dimensions)
  const brief = useBriefGenerator(overview, anomalies, weather)
  const [activeTab, setActiveTab] = useState<TabKey>('feishu')

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'border-brand text-brand'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl">
        {activeTab === 'feishu' && <FeishuPreview brief={brief} />}
        {activeTab === 'email' && <EmailPreview brief={brief} />}
      </div>
    </div>
  )
}
