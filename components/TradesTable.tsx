'use client'

import { useState, useMemo } from 'react'
import { Trade } from '@/lib/types'
import { useLanguage } from '@/components/LanguageContext'
import { Search, Edit2, Trash2, Image, ChevronUp, ChevronDown, X } from 'lucide-react'

interface TradesTableProps {
  trades: Trade[]
  onEdit: (trade: Trade) => void
  onDelete: (id: string) => void
}

type SortField = 'date' | 'symbol' | 'pnl' | 'risk' | 'actualRR' | 'status'
type SortDir = 'asc' | 'desc'
type DateFilter = 'all' | 'today' | 'week' | 'month'

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

export default function TradesTable({ trades, onEdit, onDelete }: TradesTableProps) {
  const { t } = useLanguage()
  const tb = t.table

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [symbolFilter, setSymbolFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const weekStart = (() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    return d.toISOString().slice(0, 10)
  })()
  const monthStart = new Date().toISOString().slice(0, 7)

  const symbols = useMemo(() => [...new Set(trades.map(tr => tr.symbol))].sort(), [trades])

  const filtered = useMemo(() => {
    let result = [...trades]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(tr =>
        tr.symbol.toLowerCase().includes(q) ||
        tr.entryReason.toLowerCase().includes(q) ||
        tr.notes.toLowerCase().includes(q) ||
        tr.date.includes(q)
      )
    }

    if (dateFilter === 'today') result = result.filter(tr => tr.date === today)
    else if (dateFilter === 'week') result = result.filter(tr => tr.date >= weekStart)
    else if (dateFilter === 'month') result = result.filter(tr => tr.date.startsWith(monthStart))

    if (statusFilter !== 'all') result = result.filter(tr => tr.status === statusFilter)
    if (typeFilter !== 'all') result = result.filter(tr => tr.type === typeFilter)
    if (symbolFilter !== 'all') result = result.filter(tr => tr.symbol === symbolFilter)

    result.sort((a, b) => {
      let av: string | number = a[sortField as keyof Trade] as string | number
      let bv: string | number = b[sortField as keyof Trade] as string | number
      if (sortField === 'date') {
        av = `${a.date}T${a.time}`
        bv = `${b.date}T${b.time}`
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [trades, search, dateFilter, statusFilter, typeFilter, symbolFilter, sortField, sortDir, today, weekStart, monthStart])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-zinc-600 opacity-50" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-amber-400" />
      : <ChevronDown size={12} className="text-amber-400" />
  }

  const rowColor = (tr: Trade) => {
    if (tr.status === 'Win') return 'hover:bg-emerald-400/5'
    if (tr.status === 'Loss') return 'hover:bg-red-400/5'
    return 'hover:bg-zinc-400/5'
  }

  const pnlColor = (pnl: number) => pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-zinc-400'

  const statusBadge = (s: Trade['status']) => {
    if (s === 'Win') return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
    if (s === 'Loss') return 'bg-red-400/10 text-red-400 border-red-400/20'
    return 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20'
  }

  const selectClass = 'bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-amber-400/50 cursor-pointer'

  const totalPnL = filtered.reduce((s, tr) => s + tr.pnl, 0)
  const wins = filtered.filter(tr => tr.status === 'Win').length
  const losses = filtered.filter(tr => tr.status === 'Loss').length

  const cols = [
    { label: tb.colDate, field: 'date' as SortField },
    { label: tb.colSymbol, field: 'symbol' as SortField },
    { label: tb.colType, field: null },
    { label: tb.colPnL, field: 'pnl' as SortField },
    { label: tb.colRisk, field: 'risk' as SortField },
    { label: tb.colPlannedRR, field: null },
    { label: tb.colActualRR, field: 'actualRR' as SortField },
    { label: tb.colStatus, field: 'status' as SortField },
    { label: tb.colRules, field: null },
    { label: tb.colActions, field: null },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">{tb.title}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {tb.tradesOf(filtered.length, trades.length)}
            {filtered.length > 0 && (
              <span className={`ml-2 font-medium ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                · {totalPnL >= 0 ? '+' : ''}{fmt(totalPnL)}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-emerald-400 font-medium">{wins}W</span>
          <span className="text-zinc-600">/</span>
          <span className="text-red-400 font-medium">{losses}L</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder={tb.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-amber-400/50 placeholder:text-zinc-600"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-zinc-500 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateFilter)} className={selectClass}>
            <option value="all">{tb.allDates}</option>
            <option value="today">{tb.todayFilter}</option>
            <option value="week">{tb.thisWeekFilter}</option>
            <option value="month">{tb.thisMonthFilter}</option>
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">{tb.allStatus}</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Break Even">Break Even</option>
          </select>

          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectClass}>
            <option value="all">{tb.longShort}</option>
            <option value="Long">{tb.longOnly}</option>
            <option value="Short">{tb.shortOnly}</option>
          </select>

          <select value={symbolFilter} onChange={e => setSymbolFilter(e.target.value)} className={selectClass}>
            <option value="all">{tb.allSymbols}</option>
            {symbols.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {(search || dateFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || symbolFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setDateFilter('all'); setStatusFilter('all'); setTypeFilter('all'); setSymbolFilter('all') }}
              className="px-3 py-2 border border-[#2a2a2a] rounded-lg text-zinc-500 hover:text-white text-xs transition-colors"
            >
              {tb.clearAll}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-12 text-center">
          <p className="text-zinc-500 text-sm">{tb.noMatch}</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {cols.map(({ label, field }) => (
                    <th
                      key={label}
                      className={`text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-zinc-300 select-none' : ''}`}
                      onClick={() => field && handleSort(field)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {field && <SortIcon field={field} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(trade => (
                  <tr key={trade.id} className={`border-b border-[#1a1a1a] transition-colors ${rowColor(trade)}`}>
                    <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                      <div>{formatDate(trade.date)}</div>
                      <div className="text-zinc-600 text-[10px] mt-0.5">{trade.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{trade.symbol}</span>
                        {trade.screenshot && (
                          <button
                            onClick={() => setScreenshotModal(trade.screenshot!)}
                            className="text-zinc-600 hover:text-amber-400 transition-colors"
                          >
                            <Image size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${trade.type === 'Long' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.type === 'Long' ? '↑ Long' : '↓ Short'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${pnlColor(trade.pnl)}`}>
                        {trade.pnl >= 0 ? '+' : ''}{fmt(trade.pnl)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmt(trade.risk)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{trade.plannedRR.toFixed(1)}R</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${trade.actualRR >= 1 ? 'text-emerald-400' : trade.actualRR < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                        {trade.actualRR >= 0 ? '+' : ''}{trade.actualRR.toFixed(2)}R
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-medium border ${statusBadge(trade.status)}`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium ${trade.followedRules ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.followedRules ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(trade)}
                          className="text-zinc-500 hover:text-amber-400 transition-colors"
                          title="Edit trade"
                        >
                          <Edit2 size={14} />
                        </button>
                        {deleteConfirm === trade.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { onDelete(trade.id); setDeleteConfirm(null) }}
                              className="text-xs text-red-400 hover:text-red-300 font-medium"
                            >
                              {tb.confirm}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-zinc-500 hover:text-zinc-300"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(trade.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setScreenshotModal(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setScreenshotModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-zinc-300"
            >
              <X size={24} />
            </button>
            <img src={screenshotModal} alt="Trade screenshot" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
