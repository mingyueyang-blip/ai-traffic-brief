import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TrendDataPoint } from '../../data/types'

interface TrendChartProps {
  data: TrendDataPoint[]
}

function formatDate(date: string | number | React.ReactNode): string {
  return new Date(String(date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-semibold text-primary">7-Day Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A3B54A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#A3B54A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.2} />
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
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#888888' }}
            />
            <Area
              type="monotone"
              dataKey="pv"
              name="PV"
              stroke="#A3B54A"
              strokeWidth={2}
              fill="url(#pvGradient)"
            />
            <Area
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="#2DD4BF"
              strokeWidth={2}
              fill="url(#usersGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
