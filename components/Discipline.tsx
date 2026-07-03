'use client'

import { Trade } from '@/lib/types'
import { getDisciplineStats } from '@/lib/calculations'
import { Shield, CheckCircle, XCircle, MessageSquare, TrendingUp } from 'lucide-react'

interface DisciplineProps {
  trades: Trade[]
}

function fmt(n: number, sign = false): string {
  const s = sign && n > 0 ? '+' : ''
  return s + n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

export default function Discipline({ trades }: DisciplineProps) {
  const d = getDisciplineStats(trades)
  const totalTrades = trades.length

  const overallDisciplineRate = totalTrades > 0 ? (d.followedCount / totalTrades) * 100 : 0
  const isDisciplined = overallDisciplineRate >= 70

  const messageType: 'positive' | 'warning' | 'neutral' =
    d.followedPnL > 0 && d.notFollowedPnL <= 0 ? 'positive' :
    d.followedWinRate > d.notFollowedWinRate ? 'positive' :
    d.notFollowedCount > d.followedCount ? 'warning' :
    'neutral'

  const messageStyle = {
    positive: 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400',
    warning: 'bg-red-400/5 border-red-400/20 text-red-400',
    neutral: 'bg-amber-400/5 border-amber-400/20 text-amber-400',
  }

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="text-center">
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p>No trades to analyze</p>
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
          Trading Discipline
        </h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Track how well you follow your trading rules and their impact on performance
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Discipline Score</p>
            <p className={`text-5xl font-black ${overallDisciplineRate >= 70 ? 'text-emerald-400' : overallDisciplineRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {overallDisciplineRate.toFixed(0)}%
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              {d.followedCount} of {totalTrades} trades followed your rules
            </p>
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

        {/* Score Bar */}
        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              overallDisciplineRate >= 70 ? 'bg-emerald-500' : overallDisciplineRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallDisciplineRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
          <span>Undisciplined</span>
          <span>70% = Good</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Smart Message */}
      <div className={`border rounded-xl p-5 ${messageStyle[messageType]}`}>
        <div className="flex gap-3 items-start">
          <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm mb-1">System Insight</p>
            <p className="text-sm opacity-90 leading-relaxed">{d.message}</p>
          </div>
        </div>
      </div>

      {/* Two Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Followed Rules */}
        <div className="bg-[#111111] border border-emerald-400/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-emerald-400" />
            <h3 className="text-emerald-400 font-semibold text-sm">Trades Following Rules</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className="text-emerald-400 text-2xl font-bold">{d.followedCount}</p>
              <p className="text-zinc-500 text-xs mt-0.5">Trades</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${d.followedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.followedPnL >= 0 ? '+' : ''}{fmt(d.followedPnL)}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">Net P&L</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">Win Rate</span>
              <span className={`font-semibold text-sm ${d.followedWinRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.followedWinRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">Wins</span>
              <span className="text-emerald-400 font-semibold text-sm">{d.followedWins}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">Losses</span>
              <span className="text-red-400 font-semibold text-sm">
                {d.followedCount - d.followedWins - (trades.filter(t => t.followedRules && t.status === 'Break Even').length)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400 text-sm">Avg P&L per trade</span>
              <span className={`font-semibold text-sm ${d.followedCount > 0 && d.followedPnL / d.followedCount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.followedCount > 0 ? fmt(d.followedPnL / d.followedCount, true) : '$0'}
              </span>
            </div>
          </div>
        </div>

        {/* Broke Rules */}
        <div className="bg-[#111111] border border-red-400/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-red-400" />
            <h3 className="text-red-400 font-semibold text-sm">Trades Breaking Rules</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className="text-red-400 text-2xl font-bold">{d.notFollowedCount}</p>
              <p className="text-zinc-500 text-xs mt-0.5">Trades</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${d.notFollowedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.notFollowedPnL >= 0 ? '+' : ''}{fmt(d.notFollowedPnL)}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">Net P&L</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">Win Rate</span>
              <span className={`font-semibold text-sm ${d.notFollowedWinRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.notFollowedWinRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">Wins</span>
              <span className="text-emerald-400 font-semibold text-sm">
                {trades.filter(t => !t.followedRules && t.status === 'Win').length}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1e1e1e]">
              <span className="text-zinc-400 text-sm">Losses</span>
              <span className="text-red-400 font-semibold text-sm">{d.notFollowedLosses}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400 text-sm">Avg P&L per trade</span>
              <span className={`font-semibold text-sm ${d.notFollowedCount > 0 && d.notFollowedPnL / d.notFollowedCount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.notFollowedCount > 0 ? fmt(d.notFollowedPnL / d.notFollowedCount, true) : '$0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* P&L Comparison Visual */}
      {d.followedCount > 0 && d.notFollowedCount > 0 && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">P&L Impact Comparison</p>
          {[
            { label: '✓ With Rules', pnl: d.followedPnL, color: 'bg-emerald-500' },
            { label: '✗ Without Rules', pnl: d.notFollowedPnL, color: 'bg-red-500' },
          ].map(({ label, pnl, color }) => {
            const maxAbs = Math.max(Math.abs(d.followedPnL), Math.abs(d.notFollowedPnL), 1)
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
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${width}%`, opacity: pnl < 0 ? 0.6 : 1 }}
                  />
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
          <p className="text-2xl font-bold text-emerald-400">
            {d.followedWinRate.toFixed(0)}%
          </p>
          <p className="text-zinc-500 text-xs mt-1">Win rate when following rules</p>
        </div>
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <Shield size={20} className="mx-auto mb-2 text-amber-400" />
          <p className="text-2xl font-bold text-amber-400">
            {overallDisciplineRate.toFixed(0)}%
          </p>
          <p className="text-zinc-500 text-xs mt-1">Overall discipline rate</p>
        </div>
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 text-center">
          <XCircle size={20} className="mx-auto mb-2 text-red-400" />
          <p className="text-2xl font-bold text-red-400">
            {d.notFollowedWinRate.toFixed(0)}%
          </p>
          <p className="text-zinc-500 text-xs mt-1">Win rate when breaking rules</p>
        </div>
      </div>
    </div>
  )
}
