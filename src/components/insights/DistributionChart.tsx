import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import type { DistributionItem } from '../../data/types'

interface DistributionChartProps {
  data: DistributionItem[]
  title: string
}

// Color palette for stacked segments
const COLORS = [
  '#A3B54A', // brand
  '#2DD4BF', // teal
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#3B82F6', // blue
  '#EC4899', // pink
  '#10B981', // emerald
  '#F97316', // orange
  '#6366F1', // indigo
]

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DistributionChart({ data, title }: DistributionChartProps) {
  if (data.length === 0) return null

  // Transform data for stacked bar: two rows (Today / Yesterday), each segment = a distribution item
  const chartData = [
    {
      period: 'Today',
      ...Object.fromEntries(data.map(d => [d.name, d.currentUsers])),
    },
    {
      period: 'Yesterday',
      ...Object.fromEntries(data.map(d => [d.name, d.previousUsers])),
    },
  ]

  const segmentKeys = data.map(d => d.name)

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-semibold text-primary">{title}</h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 60, bottom: 0 }}
            barSize={24}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="period"
              stroke="#555555"
              tick={{ fill: '#888888', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C1C',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                color: '#F0F0F0',
                fontSize: '12px',
              }}
              formatter={(value, name) => {
                const item = data.find(d => d.name === name)
                const pct = item ? `${(item.currentPct * 100).toFixed(1)}%` : ''
                return [
                  `${Number(value).toLocaleString()} users (${pct})`,
                  String(name),
                ]
              }}
            />
            <Legend content={<CustomLegend />} />
            {segmentKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={COLORS[i % COLORS.length]}
                radius={i === segmentKeys.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
              >
                <Cell fill={COLORS[i % COLORS.length]} />
                <Cell fill={COLORS[i % COLORS.length]} fillOpacity={0.5} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
