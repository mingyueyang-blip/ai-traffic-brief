import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import type { DistributionItem } from '../../data/types'

interface DistributionChartProps {
  data: DistributionItem[]
  dimensionLabel: string
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

export default function DistributionChart({ data, dimensionLabel }: DistributionChartProps) {
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
      <h3 className="mb-1 text-sm font-semibold text-primary">Distribution</h3>
      <p className="mb-4 text-xs text-muted">by {dimensionLabel}</p>
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
              formatter={(value, name) => [
                `${Number(value).toLocaleString()} users`,
                String(name),
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#888888' }}
              iconSize={8}
            />
            {segmentKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
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
