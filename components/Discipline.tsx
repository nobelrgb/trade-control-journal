'use client'

import { Trade } from '@/lib/types'
import { getDisciplineStats } from '@/lib/calculations'
import { useLanguage } from '@/components/LanguageContext'
import { Shield, CheckCircle, XCircle, MessageSquare, TrendingUp } from 'lucide-react'

interface DisciplineProps {
  trades: Trade[]
}

function fmt(n: number, sign = false): string {
  const s = sign && n > 0 ? '+' : ''
  return s + n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

export default function Discipline({ trades }: DisciplineProps) {
  const { t } = useLanguage()
  const d = t.discipline

  const stats = getDisciplineStats(trades)
  const totalTrades = trades.length

  const overallDisciplineRate = totalTrades > 0 ? (stats.followedCount / totalTrades) * 100 : 0

  const messageStyle = {
    positive: 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400',
    warning: 'bg-red-400/5 border-red-400/20 text-red-400',
    neutral: 'bg-amber-400/5 border-amber-400/20 text-amber-400',
  }

  const messageType: 'positive' | 'warning' | 'neutral' =
    stats.followedPnL > 0 && stats.notFollowedPnL <= 0 ? 'positive' :
    stats.followedWinRate > stats.notFollowedWinRate ? 'positive' :
    stats.notFollowedCount > stats.followedCount ? 'warning' :
    'neutral'

  // Compute translated message based on same conditions as getDisciplineStats
  let message = d.msg4
  if (stats.followedCount > 0 && stats.notFollowedCount > 0) {
    if (stats.followedPnL > 0 && stats.notFollowedPnL < 0) message = d.msg1
    else if (stats.followedWinRate > stats.notFollowedWinRate + 10) message = d.msg2
    else if (stats.followedPnL > stats.notFollowedPnL) message = d.msg3
    else message = d.msg4
  } else if (stats.notFollowedCount === 0 && stats.followedCount > 0) {
    message = d.msg5
  } else {
    message = d.msg6
  }

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="text-center">
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p>{d.noTrades}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <Shield size={22} className="text-amber-400" />
          {d.title}
        </h1>
        <p className="text-zinc-500 text-sm mt-0.5">{d.subtitle}</p>
      </div>

      {/* Overall Score */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">{d.disciplineScore}</p>
            <p className={`text-5xl font-black ${overallDisciplineRate >= 70 ? 'text-emerald-400' : overallDisciplineRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {overallDisciplineRate.toFixed(0)}%
            </p>
            <p className="text-zinc-500 text-sm mt-1">{d.scoreSub(stats.followedCount, totalTrades)}</p>
          </div>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a1a" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={overallDisciplineRate >= 70 ? '#34d399' : overallDisciplineRate >= 50 ? '#fbbf24' : '#f87171'}
                strokeWidth="3"
                strokeDasharray={`${overallDisciplineRate} ${100 - overallDisciplineRate}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield size={24} className={overallDisciplineRate >= 70 ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
          </div>
        </div>

        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              overallDisciplineRate >= 70 ? 'bg-emerald-500' : overallDisciplineRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallDisciplineRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
          <span>{d.undisciplined}</span>
          <span>{d.good}</span>
          <span>{d.excellent}</span>
        </div>
      </div>

      {/* Smart Message */}
      <div className={`border rounded-xl p-5 ${messageStyle[messageType]}`}>
        <div className="flex gap-3 items-start">
          <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-1">{d.systemInsight}</p>
            <p className="text-sm opacity-90 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>

      {/* Two Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Followed Rules */}
        <div className="bg-[#111111] border border-emerald-400/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-emerald-400" />
            <h3 className="text-emerald-400 font-semibold text-sm">{d.followingRules}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className="text-emerald-400 text-2xl font-bold">{stats.followedCount}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{d.trades}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${stats.followedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.followedPnL >= 0 ? '+' : ''}{fmt(stats.followedPnL)}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">{d.netPnL}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">{d.winRate}</span>
              <span className={`font-semibold text-sm ${stats.followedWinRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.followedWinRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">{d.wins}</span>
              <span className="text-emerald-400 font-semibold text-sm">{stats.followedWins}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">{d.losses}</span>
              <span className="text-red-400 font-semibold text-sm">
                {stats.followedCount - stats.followedWins - (trades.filter(tr => tr.followedRules && tr.status === 'Break Even').length)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400 text-sm">{d.avgPerTrade}</span>
              <span className={`font-semibold text-sm ${stats.followedCount > 0 && stats.followedPnL / stats.followedCount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.followedCount > 0 ? fmt(stats.followedPnL / stats.followedCount, true) : '$0'}
              </span>
            </div>
          </div>
        </div>

        {/* Broke Rules */}
        <div className="bg-[#111111] border border-red-400/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-red-400" />
            <h3 className="text-red-400 font-semibold text-sm">{d.breakingRules}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className="text-red-400 text-2xl font-bold">{stats.notFollowedCount}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{d.trades}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${stats.notFollowedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.notFollowedPnL >= 0 ? '+' : ''}{fmt(stats.notFollowedPnL)}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">{d.netPnL}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">{d.winRate}</span>
              <span className={`font-semibold text-sm ${stats.notFollowedWinRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.notFollowedWinRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">{d.wins}</span>
              <span className="text-emerald-400 font-semibold text-sm">{trades.filter(tr => !tr.followedRules && tr.status === 'Win').length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">{d.losses}</span>
              <span className="text-red-400 font-semibold text-sm">{stats.notFollowedLosses}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400 text-sm">{d.avgPerTrade}</span>
              <span className={`font-semibold text-sm ${stats.notFollowedCount > 0 && stats.notFollowedPnL / stats.notFollowedCount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.notFollowedCount > 0 ? fmt(stats.notFollowedPnL / stats.notFollowedCount, true) : '$0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* P&L Comparison Visual */}
      {stats.followedCount > 0 && stats.notFollowedCount > 0 && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">{d.pnlComparison}</p>
          {[
            { label: d.withRules, pnl: stats.followedPnL, color: 'bg-emerald-500' },
            { label: d.withoutRules, pnl: stats.notFollowedPnL, color: 'bg-red-500' },
          ].map(({ label, pnl, color }) => {
            const maxAbs = Math.max(Math.abs(stats.followedPnL), Math.abs(stats.notFollowedPnL), 1)
            const width = (Math.abs(pnl) / maxAbs) * 100
            return (
              <div key={label} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-zinc-300 text-sm">{label}</span>
                  <span className={`font-bold text-sm ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                  </span>
                </div>
                <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${width}%`, opacity: pnl < 0 ? 0.6 : 1 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Key Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <TrendingUp size={20} className="mx-auto mb-2 text-emerald-400" />
          <p className="text-2xl font-bold text-emerald-400">{stats.followedWinRate.toFixed(0)}%</p>
          <p className="text-zinc-500 text-xs mt-1">{d.winRateFollowed}</p>
        </div>
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <Shield size={20} className="mx-auto mb-2 text-amber-400" />
          <p className="text-2xl font-bold text-amber-400">{overallDisciplineRate.toFixed(0)}%</p>
          <p className="text-zinc-500 text-xs mt-1">{d.overallDiscipline}</p>
        </div>
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <XCircle size={20} className="mx-auto mb-2 text-red-400" />
          <p className="text-2xl font-bold text-red-400">{stats.notFollowedWinRate.toFixed(0)}%</p>
          <p className="text-zinc-500 text-xs mt-1">{d.winRateBroken}</p>
        </div>
      </div>
    </div>
  )
}
