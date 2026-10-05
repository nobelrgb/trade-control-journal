'use client'

import { useMemo, useState } from 'react'
import { Trade } from '@/lib/types'
import { useLanguage } from '@/components/LanguageContext'
import { ChevronLeft, ChevronRight, Image, Edit2, Trash2, X } from 'lucide-react'

interface TradeCalendarProps {
  trades: Trade[]
  onEdit: (trade: Trade) => void
  onDelete: (id: string) => void
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

export default function TradeCalendar({ trades, onEdit, onDelete }: TradeCalendarProps) {
  const { t, lang } = useLanguage()
  const c = t.calendar

  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() } // month: 0-indexed
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, Trade[]>()
    for (const tr of trades) {
      const list = map.get(tr.date) ?? []
      list.push(tr)
      map.set(tr.date, list)
    }
    return map
  }, [trades])

  const monthStr = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`

  const monthStats = useMemo(() => {
    const monthTrades = trades.filter(tr => tr.date.startsWith(monthStr))
    const totalPnL = monthTrades.reduce((s, tr) => s + tr.pnl, 0)
    const wins = monthTrades.filter(tr => tr.status === 'Win').length
    const losses = monthTrades.filter(tr => tr.status === 'Loss').length
    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0
    return { totalTrades: monthTrades.length, totalPnL, wins, losses, winRate }
  }, [trades, monthStr])

  // ── Grid construction ─────────────────────────────────────────────────────
  const firstOfMonth = new Date(cursor.year, cursor.month, 1)
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const leadingBlanks = firstOfMonth.getDay() // 0 = Sunday

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const dateKey = (day: number) => `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const goPrevMonth = () => {
    setCursor(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 })
  }
  const goNextMonth = () => {
    setCursor(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 })
  }
  const goToday = () => {
    const d = new Date()
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
    setSelectedDate(todayStr())
  }

  const monthLabel = firstOfMonth.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' })
  const weekdayLabels = lang === 'he' ? WEEKDAYS_HE : WEEKDAYS_EN

  const dayCellClasses = (pnl: number | null, hasTrades: boolean, isToday: boolean, isSelected: boolean) => {
    const base = 'relative rounded-xl border p-2.5 h-24 text-left transition-colors cursor-default flex flex-col'
    let tone = 'bg-[#111111] border-[#1e1e1e]'
    if (hasTrades && pnl !== null) {
      if (pnl > 0) tone = 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/15'
      else if (pnl < 0) tone = 'bg-red-500/10 border-red-500/25 hover:bg-red-500/15'
      else tone = 'bg-zinc-500/10 border-zinc-500/25 hover:bg-zinc-500/15'
    }
    const ring = isSelected ? 'ring-2 ring-amber-400' : isToday ? 'ring-1 ring-amber-400/50' : ''
    return `${base} ${tone} ${ring} ${hasTrades ? 'cursor-pointer' : ''}`
  }

  const selectedTrades = selectedDate ? byDate.get(selectedDate) ?? [] : []

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-white font-semibold text-sm capitalize">{monthLabel}</h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              {c.tradesCount(monthStats.totalTrades)}
              {monthStats.totalTrades > 0 && (
                <>
                  {' · '}
                  <span className={monthStats.totalPnL >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                    {monthStats.totalPnL >= 0 ? '+' : ''}{fmt(monthStats.totalPnL)}
                  </span>
                  {' · '}
                  <span className="text-zinc-400">{monthStats.winRate.toFixed(0)}% {c.winRateShort}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="px-3 py-1.5 border border-[#2a2a2a] rounded-lg text-zinc-400 hover:text-white hover:border-[#3a3a3a] transition-colors text-xs font-medium"
            >
              {c.today}
            </button>
            <div className="flex items-center rounded-lg border border-[#2a2a2a] overflow-hidden">
              <button onClick={goPrevMonth} className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-[#1a1a1a] transition-colors" aria-label="Previous month">
                <ChevronLeft size={15} />
              </button>
              <button onClick={goNextMonth} className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-[#1a1a1a] transition-colors border-l border-[#2a2a2a]" aria-label="Next month">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-2 px-1">
        {weekdayLabels.map(w => (
          <div key={w} className="text-center text-zinc-600 text-[10px] font-medium uppercase tracking-wide">{w}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {week.map((day, di) => {
              if (day === null) return <div key={di} className="h-24" />
              const key = dateKey(day)
              const dayTrades = byDate.get(key) ?? []
              const pnl = dayTrades.length > 0 ? dayTrades.reduce((s, tr) => s + tr.pnl, 0) : null
              const isToday = key === todayStr()
              const isSelected = key === selectedDate

              return (
                <button
                  key={di}
                  type="button"
                  disabled={dayTrades.length === 0}
                  onClick={() => setSelectedDate(isSelected ? null : key)}
                  className={dayCellClasses(pnl, dayTrades.length > 0, isToday, isSelected)}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-amber-400' : 'text-zinc-500'}`}>{day}</span>
                  {dayTrades.length > 0 && pnl !== null && (
                    <div className="mt-auto">
                      <div className={`text-sm font-bold leading-tight ${pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-zinc-300'}`}>
                        {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                      </div>
                      <div className="text-zinc-600 text-[10px] mt-0.5">{c.tradesCount(dayTrades.length)}</div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Day detail panel */}
      {selectedDate && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold text-sm">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <button onClick={() => setSelectedDate(null)} className="text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {selectedTrades.length === 0 ? (
            <p className="text-zinc-500 text-sm">{c.noTradesDay}</p>
          ) : (
            <div className="space-y-2">
              {selectedTrades.map(trade => (
                <div key={trade.id} className="flex items-center justify-between gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-white font-semibold text-sm">{trade.symbol}</span>
                    <span className={`text-xs font-medium ${trade.type === 'Long' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.type === 'Long' ? '↑ Long' : '↓ Short'}
                    </span>
                    {trade.screenshot && <Image size={13} className="text-zinc-600 shrink-0" />}
                    <span className="text-zinc-600 text-xs truncate hidden sm:inline">{trade.entryReason}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-bold text-sm ${trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{fmt(trade.pnl)}
                    </span>
                    <button onClick={() => onEdit(trade)} className="text-zinc-500 hover:text-amber-400 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    {deleteConfirm === trade.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { onDelete(trade.id); setDeleteConfirm(null) }} className="text-xs text-red-400 hover:text-red-300 font-medium">
                          {c.confirm}
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs text-zinc-500 hover:text-zinc-300">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(trade.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
