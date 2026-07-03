'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartPoint {
  date: string
  fullDate: string
  dailyPnL: number
  cumulative: number
}

interface PerformanceChartProps {
  data: ChartPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: ChartPoint }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null
  const point = payload[0].payload
  const isPositive = point.cumulative >= 0

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className={`text-base font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{point.cumulative.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
      </p>
      <p className={`text-xs mt-0.5 ${point.dailyPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        Day: {point.dailyPnL >= 0 ? '+' : ''}{point.dailyPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
        No trade data to display
      </div>
    )
  }

  const isOverallPositive = data[data.length - 1]?.cumulative >= 0
  const gradientId = isOverallPositive ? 'greenGradient' : 'redGradient'
  const strokeColor = isOverallPositive ? '#34d399' : '#f87171'
  const gradientStart = isOverallPositive ? '#34d399' : '#f87171'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientStart} stopOpacity={0.15} />
            <stop offset="95%" stopColor={gradientStart} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#52525b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#52525b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke={strokeColor}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: strokeColor, stroke: '#0d0d0d', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
