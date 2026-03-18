import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { DimensionItem } from '../../data/types'

interface DimensionBarChartProps {
  items: DimensionItem[]
  onSelectItem: (item: DimensionItem) => void
}

export default function DimensionBarChart({ items, onSelectItem }: DimensionBarChartProps) {
  const top10 = items.slice(0, 10)

  const chartData = top10.map(item => ({
    name: item.name.length > 20 ? item.name.slice(0, 18) + '\u2026' : item.name,
    fullName: item.name,
    current: item.currentUsers,
    previous: item.previousUsers,
    changePct: item.usersChangePct,
  }))

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: 100, bottom: 5 }}
          barGap={2}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={95}
            stroke="#555555"
            tick={{ fill: '#888888', fontSize: 11 }}
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
              name === 'current' ? 'Today' : 'Yesterday',
            ]}
            labelFormatter={(label) => String(label)}
          />
          <ReferenceLine x={0} stroke="#2A2A2A" />
          <Bar
            dataKey="previous"
            name="Yesterday"
            fill="#555555"
            barSize={10}
            radius={[0, 2, 2, 0]}
          />
          <Bar
            dataKey="current"
            name="Today"
            barSize={10}
            radius={[0, 2, 2, 0]}
            onClick={(_data, index) => {
              if (typeof index === 'number' && top10[index]) {
                onSelectItem(top10[index])
              }
            }}
            cursor="pointer"
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.changePct >= 0 ? '#4ADE80' : '#EF4444'}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
