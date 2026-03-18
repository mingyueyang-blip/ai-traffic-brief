import { useTrafficData } from '../hooks/useTrafficData'
import { useAnomalyEngine } from '../hooks/useAnomalyEngine'
import { useBriefGenerator } from '../hooks/useBriefGenerator'
import WeatherBanner from '../components/brief/WeatherBanner'
import AISummaryCard from '../components/brief/TodaysBrief'

export default function BriefPage() {
  const { overview, dimensions } = useTrafficData()
  const { anomalies, weather } = useAnomalyEngine(overview, dimensions)
  const brief = useBriefGenerator(overview, anomalies, weather)

  return (
    <div className="space-y-6">
      <WeatherBanner
        weather={brief.weather}
        summary={brief.weatherSummary}
        overview={overview}
      />
      <AISummaryCard brief={brief} />
    </div>
  )
}
