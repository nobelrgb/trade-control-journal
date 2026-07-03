'use client'

import { Trade } from '@/lib/types'
import {
  calculateStats,
  getSymbolStats,
  getLongShortStats,
  getBestAndWorstDays,
  getEquityCurve,
} from '@/lib/calculations'
import PerformanceChart from './PerformanceChart'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface AnalyticsProps {
  trades: Trade[]
}

function fmt(n: number, sign = false): string {
  const s = sign && n > 0 ? '+' : ''
  return s + n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1a1a1a] last:border-0">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className={`font-semibold text-sm ${accent || 'text-white'}`}>{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">{children}</h3>
  )
}

export default function Analytics({ trades }: AnalyticsProps) {
  const stats = calculateStats(trades)
  const symbolStats = getSymbolStats(trades)
  const { longs, shorts } = getLongShortStats(trades)
  const { bestDays, worstDays } = getBestAndWorstDays(trades)
  const chartData = getEquityCurve(trades)

  const rulesFollowed = trades.filter(t => t.followedRules)
  const rulesNotFollowed = trades.filter(t => !t.followedRules)

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="text-center">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p>No trades to analyze</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Detailed performance breakdown across {trades.length} trades</p>
      </div>

      {/* Performance Chart */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <SectionTitle>Equity Curve</SectionTitle>
        <div className="h-56">
          <PerformanceChart data={chartData} />
        </div>
      </div>

      {/* Core Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Performance Summary */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>Performance Summary</SectionTitle>
          <StatRow label="Total Trades" value={String(stats.totalTrades)} />
          <StatRow label="Wins" value={String(stats.wins)} accent="text-emerald-400" />
          <StatRow label="Losses" value={String(stats.losses)} accent="text-red-400" />
          <StatRow label="Break Evens" value={String(stats.breakEvens)} accent="text-zinc-400" />
          <StatRow label="Win Rate" value={`${stats.winRate.toFixed(1)}%`}
            accent={stats.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label="Net Profit" value={fmt(stats.totalPnL, true)}
            accent={stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        </div>

        {/* P&L Breakdown */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>P&L Breakdown</SectionTitle>
          <StatRow label="Total Gross Wins" value={fmt(stats.totalWinAmount)} accent="text-emerald-400" />
          <StatRow label="Total Gross Losses" value={`-${fmt(stats.totalLossAmount)}`} accent="text-red-400" />
          <StatRow label="Net Profit" value={fmt(stats.totalPnL, true)}
            accent={stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label="Profit Factor" value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
            accent={stats.profitFactor >= 1.5 ? 'text-emerald-400' : stats.profitFactor >= 1 ? 'text-amber-400' : 'text-red-400'} />
          <StatRow label="Avg Win" value={fmt(stats.avgWin)} accent="text-emerald-400" />
          <StatRow label="Avg Loss" value={fmt(stats.avgLoss)} accent="text-red-400" />
        </div>

        {/* Risk & Streaks */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>Risk & Streaks</SectionTitle>
          <StatRow label="Avg R:R (Actual)" value={`${stats.avgRR.toFixed(2)}R`}
            accent={stats.avgRR >= 1.5 ? 'text-emerald-400' : stats.avgRR >= 1 ? 'text-amber-400' : 'text-red-400'} />
          <StatRow label="Best Trade" value={fmt(stats.bestTrade?.pnl || 0, true)} accent="text-emerald-400" />
          <StatRow label="Worst Trade" value={fmt(stats.worstTrade?.pnl || 0, true)} accent="text-red-400" />
          <StatRow label="Max Win Streak" value={`${stats.maxWinStreak} in a row`} accent="text-emerald-400" />
          <StatRow label="Max Loss Streak" value={`${stats.maxLossStreak} in a row`} accent="text-red-400" />
        </div>
      </div>

      {/* Best & Worst Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-emerald-400" />
            <SectionTitle>Best Trading Days</SectionTitle>
          </div>
          {bestDays.length === 0 ? (
            <p className="text-zinc-600 text-sm">No data yet</p>
          ) : (
            <div className="space-y-0">
              {bestDays.map((d, i) => {
                const date = new Date(d.date + 'T12:00:00')
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                return (
                  <div key={d.date} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-400/10 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 text-sm">{dateStr}</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">+{fmt(d.pnl)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={14} className="text-red-400" />
            <SectionTitle>Worst Trading Days</SectionTitle>
          </div>
          {worstDays.length === 0 ? (
            <p className="text-zinc-600 text-sm">No data yet</p>
          ) : (
            <div className="space-y-0">
              {worstDays.map((d, i) => {
                const date = new Date(d.date + 'T12:00:00')
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                return (
                  <div key={d.date} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-red-400/10 text-red-400 text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 text-sm">{dateStr}</span>
                    </div>
                    <span className="text-red-400 font-bold text-sm">{fmt(d.pnl)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Symbol Performance */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <SectionTitle>Performance by Symbol</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Symbol', 'Trades', 'Wins', 'Losses', 'Win Rate', 'Net P&L'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-zinc-500 text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbolStats.map(s => (
                <tr key={s.symbol} className="border-b border-[#1a1a1a] hover:bg-white/2 transition-colors">
                  <td className="py-3 px-3 text-white font-semibold text-sm">{s.symbol}</td>
                  <td className="py-3 px-3 text-zinc-400 text-sm">{s.trades}</td>
                  <td className="py-3 px-3 text-emerald-400 text-sm">{s.wins}</td>
                  <td className="py-3 px-3 text-red-400 text-sm">{s.losses}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full max-w-16">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${s.winRate}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${s.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.winRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold text-sm ${s.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.pnl >= 0 ? '+' : ''}{fmt(s.pnl)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Long vs Short & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Long vs Short */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>Long vs Short</SectionTitle>
          {[
            { label: 'Long', data: longs, color: 'emerald', arrow: '↑' },
            { label: 'Short', data: shorts, color: 'red', arrow: '↓' },
          ].map(({ label, data, color, arrow }) => (
            <div key={label} className={`mb-4 last:mb-0 p-4 rounded-lg bg-${color}-400/5 border border-${color}-400/10`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-${color}-400 font-semibold text-sm`}>{arrow} {label}</span>
                <span className={`text-${color}-400 font-bold`}>
                  {data.pnl >= 0 ? '+' : ''}{fmt(data.pnl)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-zinc-600">Trades</p>
                  <p className="text-zinc-300 font-medium">{data.count}</p>
                </div>
                <div>
                  <p className="text-zinc-600">Win Rate</p>
                  <p className={`font-medium text-${color}-400`}>{data.winRate.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-zinc-600">Wins</p>
                  <p className="text-zinc-300 font-medium">{data.wins}/{data.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules Compliance */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>Rules Compliance</SectionTitle>
          {[
            { label: 'Followed Rules', trades: rulesFollowed, color: 'emerald', icon: '✓' },
            { label: 'Broke Rules', trades: rulesNotFollowed, color: 'red', icon: '✗' },
          ].map(({ label, trades: t, color, icon }) => {
            const pnl = t.reduce((s, x) => s + x.pnl, 0)
            const wins = t.filter(x => x.status === 'Win').length
            const wr = t.length > 0 ? (wins / t.length) * 100 : 0
            return (
              <div key={label} className={`mb-4 last:mb-0 p-4 rounded-lg bg-${color}-400/5 border border-${color}-400/10`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-${color}-400 font-semibold text-sm`}>{icon} {label}</span>
                  <span className={`font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-600">Trades</p>
                    <p className="text-zinc-300 font-medium">{t.length}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600">Win Rate</p>
                    <p className={`font-medium text-${color}-400`}>{wr.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-zinc-600">Wins</p>
                    <p className="text-zinc-300 font-medium">{wins}/{t.length}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
