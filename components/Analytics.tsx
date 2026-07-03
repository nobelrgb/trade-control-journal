'use client'

import { Trade } from '@/lib/types'
import {
  calculateStats,
  getSymbolStats,
  getLongShortStats,
  getBestAndWorstDays,
  getEquityCurve,
} from '@/lib/calculations'
import { useLanguage } from '@/components/LanguageContext'
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
  const { t } = useLanguage()
  const a = t.analytics

  const stats = calculateStats(trades)
  const symbolStats = getSymbolStats(trades)
  const { longs, shorts } = getLongShortStats(trades)
  const { bestDays, worstDays } = getBestAndWorstDays(trades)
  const chartData = getEquityCurve(trades)

  const rulesFollowed = trades.filter(tr => tr.followedRules)
  const rulesNotFollowed = trades.filter(tr => !tr.followedRules)

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="text-center">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p>{a.noTrades}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">{a.title}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{a.subtitle(trades.length)}</p>
      </div>

      {/* Performance Chart */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <SectionTitle>{a.equityCurve}</SectionTitle>
        <div className="h-56">
          <PerformanceChart data={chartData} />
        </div>
      </div>

      {/* Core Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>{a.perfSummary}</SectionTitle>
          <StatRow label={a.totalTrades} value={String(stats.totalTrades)} />
          <StatRow label={a.wins} value={String(stats.wins)} accent="text-emerald-400" />
          <StatRow label={a.losses} value={String(stats.losses)} accent="text-red-400" />
          <StatRow label={a.breakEvens} value={String(stats.breakEvens)} accent="text-zinc-400" />
          <StatRow label={a.winRate} value={`${stats.winRate.toFixed(1)}%`} accent={stats.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label={a.netProfit} value={fmt(stats.totalPnL, true)} accent={stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        </div>

        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>{a.pnlBreakdown}</SectionTitle>
          <StatRow label={a.totalGrossWins} value={fmt(stats.totalWinAmount)} accent="text-emerald-400" />
          <StatRow label={a.totalGrossLosses} value={`-${fmt(stats.totalLossAmount)}`} accent="text-red-400" />
          <StatRow label={a.netProfit} value={fmt(stats.totalPnL, true)} accent={stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label={a.profitFactor} value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} accent={stats.profitFactor >= 1.5 ? 'text-emerald-400' : stats.profitFactor >= 1 ? 'text-amber-400' : 'text-red-400'} />
          <StatRow label={a.avgWin} value={fmt(stats.avgWin)} accent="text-emerald-400" />
          <StatRow label={a.avgLoss} value={fmt(stats.avgLoss)} accent="text-red-400" />
        </div>

        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>{a.riskStreaks}</SectionTitle>
          <StatRow label={a.avgRR} value={`${stats.avgRR.toFixed(2)}R`} accent={stats.avgRR >= 1.5 ? 'text-emerald-400' : stats.avgRR >= 1 ? 'text-amber-400' : 'text-red-400'} />
          <StatRow label={a.bestTrade} value={fmt(stats.bestTrade?.pnl || 0, true)} accent="text-emerald-400" />
          <StatRow label={a.worstTrade} value={fmt(stats.worstTrade?.pnl || 0, true)} accent="text-red-400" />
          <StatRow label={a.maxWinStreak} value={`${stats.maxWinStreak} ${a.inARow}`} accent="text-emerald-400" />
          <StatRow label={a.maxLossStreak} value={`${stats.maxLossStreak} ${a.inARow}`} accent="text-red-400" />
        </div>
      </div>

      {/* Best & Worst Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-emerald-400" />
            <SectionTitle>{a.bestDays}</SectionTitle>
          </div>
          {bestDays.length === 0 ? (
            <p className="text-zinc-600 text-sm">{a.noData}</p>
          ) : (
            <div className="space-y-0">
              {bestDays.map((dd, i) => {
                const date = new Date(dd.date + 'T12:00:00')
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                return (
                  <div key={dd.date} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-400/10 text-emerald-400 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                      <span className="text-zinc-300 text-sm">{dateStr}</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">+{fmt(dd.pnl)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={14} className="text-red-400" />
            <SectionTitle>{a.worstDays}</SectionTitle>
          </div>
          {worstDays.length === 0 ? (
            <p className="text-zinc-600 text-sm">{a.noData}</p>
          ) : (
            <div className="space-y-0">
              {worstDays.map((dd, i) => {
                const date = new Date(dd.date + 'T12:00:00')
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                return (
                  <div key={dd.date} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-red-400/10 text-red-400 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                      <span className="text-zinc-300 text-sm">{dateStr}</span>
                    </div>
                    <span className="text-red-400 font-bold text-sm">{fmt(dd.pnl)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Symbol Performance */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <SectionTitle>{a.bySymbol}</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Symbol', a.symTrades, a.symWins, a.symLosses, a.symWinRate, a.symNetPnL].map((h, i) => (
                  <th key={i} className="text-left py-2 px-3 text-zinc-500 text-xs font-medium uppercase tracking-wide">{h}</th>
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
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.winRate}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${s.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{s.winRate.toFixed(0)}%</span>
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
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>{a.longVsShort}</SectionTitle>
          {[
            { label: 'Long', data: longs, color: 'emerald', arrow: '↑' },
            { label: 'Short', data: shorts, color: 'red', arrow: '↓' },
          ].map(({ label, data, color, arrow }) => (
            <div key={label} className={`mb-4 last:mb-0 p-4 rounded-lg bg-${color}-400/5 border border-${color}-400/10`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-${color}-400 font-semibold text-sm`}>{arrow} {label}</span>
                <span className={`text-${color}-400 font-bold`}>{data.pnl >= 0 ? '+' : ''}{fmt(data.pnl)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><p className="text-zinc-600">{a.trades}</p><p className="text-zinc-300 font-medium">{data.count}</p></div>
                <div><p className="text-zinc-600">{a.symWinRate}</p><p className={`font-medium text-${color}-400`}>{data.winRate.toFixed(0)}%</p></div>
                <div><p className="text-zinc-600">{a.wins}</p><p className="text-zinc-300 font-medium">{data.wins}/{data.count}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <SectionTitle>{a.rulesCompliance}</SectionTitle>
          {[
            { label: a.followedRules, trades: rulesFollowed, color: 'emerald', icon: '✓' },
            { label: a.brokeRules, trades: rulesNotFollowed, color: 'red', icon: '✗' },
          ].map(({ label, trades: tr, color, icon }) => {
            const pnl = tr.reduce((s, x) => s + x.pnl, 0)
            const w = tr.filter(x => x.status === 'Win').length
            const wr = tr.length > 0 ? (w / tr.length) * 100 : 0
            return (
              <div key={label} className={`mb-4 last:mb-0 p-4 rounded-lg bg-${color}-400/5 border border-${color}-400/10`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-${color}-400 font-semibold text-sm`}>{icon} {label}</span>
                  <span className={`font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}{fmt(pnl)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-zinc-600">{a.trades}</p><p className="text-zinc-300 font-medium">{tr.length}</p></div>
                  <div><p className="text-zinc-600">{a.symWinRate}</p><p className={`font-medium text-${color}-400`}>{wr.toFixed(0)}%</p></div>
                  <div><p className="text-zinc-600">{a.wins}</p><p className="text-zinc-300 font-medium">{w}/{tr.length}</p></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
