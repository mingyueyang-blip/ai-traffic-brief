import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { TrendDataPoint } from '../../data/types'

interface TrendChartProps {
  data: TrendDataPoint[]
  usersLabel: string
}

function formatDate(date: string | number | React.ReactNode): string {
  return new Date(String(date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatK(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
  return String(value)
}

export default function TrendChart({ data, usersLabel }: TrendChartProps) {
  // Find yesterday's user count for the reference line
  const sorted = [...data].sort((a, b) => String(a.date).localeCompare(String(b.date)))
  const yesterdayUsers = sorted.length >= 2 ? sorted[sorted.length - 2].users : null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-semibold text-primary">{usersLabel} — 7-Day Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#555555"
              tick={{ fill: '#888888', fontSize: 12 }}
              axisLine={{ stroke: '#2A2A2A' }}
            />
            <YAxis
              stroke="#555555"
              tick={{ fill: '#888888', fontSize: 12 }}
              axisLine={{ stroke: '#2A2A2A' }}
              tickFormatter={formatK}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C1C',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                color: '#F0F0F0',
                fontSize: '12px',
              }}
              labelFormatter={formatDate}
              formatter={(value) => [
                `${Number(value).toLocaleString()} users`,
                usersLabel,
              ]}
            />
            {yesterdayUsers !== null && (
              <ReferenceLine
                y={yesterdayUsers}
                stroke="#888888"
                strokeDasharray="4 4"
                label={{
                  value: `Yesterday: ${formatK(yesterdayUsers)}`,
                  fill: '#888888',
                  fontSize: 11,
                  position: 'right',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="#2DD4BF"
              strokeWidth={2}
              fill="url(#usersGradient)"
              dot={(props) => {
                const { cx, cy, index } = props as { cx: number; cy: number; index: number }
                if (index === data.length - 1) {
                  return (
                    <circle
                      key="today"
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#2DD4BF"
                      stroke="#111111"
                      strokeWidth={2}
                    />
                  )
                }
                return <circle key={index} cx={cx} cy={cy} r={0} fill="transparent" />
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
