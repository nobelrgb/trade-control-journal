'use client'

import { useState } from 'react'
import { MonthlyGoal } from '@/lib/types'
import { useLanguage } from '@/components/LanguageContext'
import { Target, Edit3, Check, X } from 'lucide-react'

interface MonthlyGoalProps {
  goal: MonthlyGoal
  currentPnL: number
  onUpdate: (goal: MonthlyGoal) => void
}

export default function MonthlyGoalCard({ goal, currentPnL, onUpdate }: MonthlyGoalProps) {
  const { t } = useLanguage()
  const g = t.goal

  const [editing, setEditing] = useState(false)
  const [inputAmount, setInputAmount] = useState(String(goal.amount))
  const [inputMonth, setInputMonth] = useState(goal.month)

  const progress = goal.amount > 0 ? Math.min((currentPnL / goal.amount) * 100, 100) : 0
  const isAhead = currentPnL >= goal.amount
  const progressClamped = Math.max(0, progress)

  const handleSave = () => {
    const amount = parseFloat(inputAmount)
    if (isNaN(amount) || amount <= 0) return
    onUpdate({ amount, month: inputMonth })
    setEditing(false)
  }

  const handleCancel = () => {
    setInputAmount(String(goal.amount))
    setInputMonth(goal.month)
    setEditing(false)
  }

  const monthLabel = new Date(goal.month + '-01T12:00:00').toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const statusText = isAhead
    ? g.achieved((currentPnL - goal.amount).toLocaleString())
    : currentPnL < 0
    ? g.atLoss(Math.abs(currentPnL + goal.amount).toLocaleString())
    : g.remaining((goal.amount - currentPnL).toLocaleString())

  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-amber-400" />
          <span className="text-white font-semibold text-sm">{g.title}</span>
          <span className="text-zinc-500 text-xs">{monthLabel}</span>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="text-zinc-500 hover:text-amber-400 transition-colors">
            <Edit3 size={14} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
            <button onClick={handleCancel} className="text-red-400 hover:text-red-300"><X size={14} /></button>
          </div>
        )}
      </div>

      {editing && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-zinc-500 text-xs mb-1 block">{g.goalAmount}</label>
            <input
              type="number"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-400/50"
            />
          </div>
          <div>
            <label className="text-zinc-500 text-xs mb-1 block">{g.month}</label>
            <input
              type="month"
              value={inputMonth}
              onChange={e => setInputMonth(e.target.value)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-400/50"
            />
          </div>
        </div>
      )}

      <div className="flex items-end justify-between mb-2.5">
        <div>
          <span className={`text-2xl font-bold ${currentPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentPnL >= 0 ? '+' : ''}
            {currentPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </span>
          <span className="text-zinc-500 text-sm ml-2">
            / {goal.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </span>
        </div>
        <span className={`text-lg font-bold ${isAhead ? 'text-amber-400' : 'text-zinc-400'}`}>
          {progressClamped.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAhead ? 'bg-amber-400' : currentPnL >= 0 ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          style={{ width: `${progressClamped}%` }}
        />
        {progressClamped > 0 && (
          <div
            className={`absolute top-0 h-full rounded-full opacity-30 blur-sm ${
              isAhead ? 'bg-amber-400' : currentPnL >= 0 ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressClamped}%` }}
          />
        )}
      </div>

      <p className={`text-xs mt-2 ${isAhead ? 'text-amber-400' : 'text-zinc-500'}`}>
        {statusText}
      </p>
    </div>
  )
}
