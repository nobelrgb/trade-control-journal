'use client'

import { Trade, MonthlyGoal } from '@/lib/types'
import {
  calculateStats,
  getDailyPnL,
  getWeeklyPnL,
  getMonthlyPnL,
  getEquityCurve,
} from '@/lib/calculations'
import StatCard from './StatCard'
import PerformanceChart from './PerformanceChart'
import MonthlyGoalCard from './MonthlyGoal'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Percent,
  Award,
  AlertCircle,
} from 'lucide-react'

interface DashboardProps {
  trades: Trade[]
  monthlyGoal: MonthlyGoal
  onGoalUpdate: (goal: MonthlyGoal) => void
  onAddTrade: () => void
}

function fmt(n: number, showSign = false): string {
  const sign = showSign && n > 0 ? '+' : ''
  return sign + n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

export default function Dashboard({ trades, monthlyGoal, onGoalUpdate, onAddTrade }: DashboardProps) {
  const stats = calculateStats(trades)
  const daily = getDailyPnL(trades)
  const weekly = getWeeklyPnL(trades)
  const monthly = getMonthlyPnL(trades, monthlyGoal.month)
  const chartData = getEquityCurve(trades)

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center">
          <TrendingUp size={32} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-white text-xl font-bold mb-2">No trades yet</h2>
          <p className="text-zinc-500 text-sm">Add your first trade to see your performance dashboard</p>
        </div>
        <button
          onClick={onAddTrade}
          className="px-6 py-2.5 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-300 transition-colors text-sm"
        >
          Add First Trade
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{trades.length} total trades recorded</p>
        </div>
        <button
          onClick={onAddTrade}
          className="px-4 py-2 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-300 transition-colors text-sm"
        >
          + Add Trade
        </button>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="col-span-2 bg-[#111111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Total P&L</p>
          <p className={`text-4xl font-black ${stats!.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(stats!.totalPnL, true)}
          </p>
          <div className="flex gap-4 mt-3">
            <span className="text-zinc-500 text-xs">
              <span className="text-emerald-500 font-medium">{stats!.wins}W</span>
              {' / '}
              <span className="text-red-500 font-medium">{stats!.losses}L</span>
              {stats!.breakEvens > 0 && <span className="text-zinc-400 font-medium"> / {stats!.breakEvens}BE</span>}
            </span>
          </div>
        </div>

        <StatCard
          label="Today"
          value={fmt(daily, true)}
          accent={daily >= 0 ? 'green' : 'red'}
          icon={<Activity size={14} />}
        />
        <StatCard
          label="This Week"
          value={fmt(weekly, true)}
          accent={weekly >= 0 ? 'green' : 'red'}
          icon={<TrendingUp size={14} />}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="This Month"
          value={fmt(monthly, true)}
          accent={monthly >= 0 ? 'green' : 'red'}
          size="sm"
        />
        <StatCard
          label="Win Rate"
          value={`${stats!.winRate.toFixed(1)}%`}
          accent={stats!.winRate >= 50 ? 'green' : 'red'}
          icon={<Percent size={14} />}
          size="sm"
        />
        <StatCard
          label="Avg Win"
          value={fmt(stats!.avgWin)}
          accent="green"
          size="sm"
        />
        <StatCard
          label="Avg Loss"
          value={fmt(stats!.avgLoss)}
          accent="red"
          size="sm"
        />
        <StatCard
          label="Best Trade"
          value={fmt(stats!.bestTrade?.pnl || 0, true)}
          sub={stats!.bestTrade?.symbol}
          accent="green"
          icon={<Award size={14} />}
          size="sm"
        />
        <StatCard
          label="Worst Trade"
          value={fmt(stats!.worstTrade?.pnl || 0, true)}
          sub={stats!.worstTrade?.symbol}
          accent="red"
          icon={<AlertCircle size={14} />}
          size="sm"
        />
      </div>

      {/* Chart + Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Equity Curve</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Cumulative P&L over time</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-500 text-xs">Cumulative P&L</span>
            </div>
          </div>
          <div className="h-48">
            <PerformanceChart data={chartData} />
          </div>
        </div>

        {/* Monthly Goal */}
        <MonthlyGoalCard
          goal={monthlyGoal}
          currentPnL={monthly}
          onUpdate={onGoalUpdate}
        />
      </div>

      {/* Quick Stats Bottom Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Profit Factor"
          value={stats!.profitFactor === Infinity ? '∞' : stats!.profitFactor.toFixed(2)}
          accent={stats!.profitFactor >= 1.5 ? 'green' : stats!.profitFactor >= 1 ? 'gold' : 'red'}
          sub="Total wins / Total losses"
          size="sm"
        />
        <StatCard
          label="Avg R:R"
          value={stats!.avgRR.toFixed(2)}
          accent={stats!.avgRR >= 1.5 ? 'green' : stats!.avgRR >= 1 ? 'gold' : 'red'}
          sub="Actual R:R average"
          size="sm"
        />
        <StatCard
          label="Win Streak"
          value={`${stats!.maxWinStreak}`}
          sub="Max consecutive wins"
          accent="green"
          size="sm"
        />
        <StatCard
          label="Loss Streak"
          value={`${stats!.maxLossStreak}`}
          sub="Max consecutive losses"
          accent="red"
          size="sm"
        />
      </div>
    </div>
  )
}
