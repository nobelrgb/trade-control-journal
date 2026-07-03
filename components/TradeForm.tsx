'use client'

import { useState, useRef, useEffect } from 'react'
import { Trade } from '@/lib/types'
import { Upload, X, ChevronDown } from 'lucide-react'

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'createdAt'>) => void
  onCancel?: () => void
  editingTrade?: Trade | null
}

const SYMBOLS = ['XAUUSD', 'NQ', 'BTC', 'EURUSD', 'GBPUSD', 'ES', 'CL', 'ETH', 'USDJPY', 'AUDUSD']

const defaultForm = {
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  symbol: '',
  type: 'Long' as 'Long' | 'Short',
  pnl: '',
  risk: '',
  plannedRR: '',
  actualRR: '',
  status: 'Win' as 'Win' | 'Loss' | 'Break Even',
  entryReason: '',
  followedRules: true,
  touchedAfterEntry: false,
  notes: '',
  screenshot: '',
}

interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  labelTrue?: string
  labelFalse?: string
}

function Toggle({ value, onChange, labelTrue = 'Yes', labelFalse = 'No' }: ToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-[#2a2a2a]">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-2 text-sm font-medium transition-all ${
          value ? 'bg-emerald-500/20 text-emerald-400 border-r border-[#2a2a2a]' : 'text-zinc-500 hover:text-zinc-300 border-r border-[#2a2a2a]'
        }`}
      >
        {labelTrue}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-2 text-sm font-medium transition-all ${
          !value ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        {labelFalse}
      </button>
    </div>
  )
}

const inputClass = 'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors placeholder:text-zinc-600'
const labelClass = 'text-zinc-400 text-xs font-medium mb-1.5 block uppercase tracking-wide'

export default function TradeForm({ onSubmit, onCancel, editingTrade }: TradeFormProps) {
  const [form, setForm] = useState(defaultForm)
  const [symbolSearch, setSymbolSearch] = useState('')
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false)
  const [previewImg, setPreviewImg] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingTrade) {
      setForm({
        date: editingTrade.date,
        time: editingTrade.time,
        symbol: editingTrade.symbol,
        type: editingTrade.type,
        pnl: String(editingTrade.pnl),
        risk: String(editingTrade.risk),
        plannedRR: String(editingTrade.plannedRR),
        actualRR: String(editingTrade.actualRR),
        status: editingTrade.status,
        entryReason: editingTrade.entryReason,
        followedRules: editingTrade.followedRules,
        touchedAfterEntry: editingTrade.touchedAfterEntry,
        notes: editingTrade.notes,
        screenshot: editingTrade.screenshot || '',
      })
      setSymbolSearch(editingTrade.symbol)
      setPreviewImg(editingTrade.screenshot || '')
    }
  }, [editingTrade])

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  const filteredSymbols = SYMBOLS.filter(s =>
    s.toLowerCase().includes(symbolSearch.toLowerCase())
  )

  const handleSymbolSelect = (s: string) => {
    set('symbol', s)
    setSymbolSearch(s)
    setShowSymbolDropdown(false)
  }

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      set('screenshot', result)
      setPreviewImg(result)
    }
    reader.readAsDataURL(file)
  }

  const autoCalcRR = () => {
    const pnlVal = parseFloat(form.pnl)
    const riskVal = parseFloat(form.risk)
    if (!isNaN(pnlVal) && !isNaN(riskVal) && riskVal !== 0) {
      set('actualRR', (pnlVal / riskVal).toFixed(2))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.symbol || !form.date || !form.pnl || !form.risk) return

    onSubmit({
      date: form.date,
      time: form.time,
      symbol: form.symbol,
      type: form.type,
      pnl: parseFloat(form.pnl),
      risk: parseFloat(form.risk),
      plannedRR: parseFloat(form.plannedRR) || 0,
      actualRR: parseFloat(form.actualRR) || 0,
      status: form.status,
      entryReason: form.entryReason,
      followedRules: form.followedRules,
      touchedAfterEntry: form.touchedAfterEntry,
      notes: form.notes,
      screenshot: form.screenshot || undefined,
    })

    if (!editingTrade) {
      setForm({ ...defaultForm, date: form.date })
      setSymbolSearch('')
      setPreviewImg('')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">{editingTrade ? 'Edit Trade' : 'Add New Trade'}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Record your trade details for accurate tracking</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Basics */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">Trade Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Time * (24h)</label>
              <input
                type="text"
                required
                placeholder="16:30"
                maxLength={5}
                value={form.time}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9:]/g, '')
                  if (val.length === 2 && !val.includes(':') && form.time.length === 1) {
                    val = val + ':'
                  }
                  set('time', val)
                }}
                onBlur={e => {
                  const val = e.target.value
                  if (val && !val.includes(':') && val.length <= 2) {
                    set('time', val.padStart(2, '0') + ':00')
                  }
                }}
                className={inputClass}
              />
            </div>
            <div className="col-span-2 md:col-span-1 relative">
              <label className={labelClass}>Symbol *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="XAUUSD, NQ, BTC..."
                  value={symbolSearch}
                  onChange={e => {
                    setSymbolSearch(e.target.value)
                    set('symbol', e.target.value)
                    setShowSymbolDropdown(true)
                  }}
                  onFocus={() => setShowSymbolDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSymbolDropdown(false), 150)}
                  className={inputClass + ' pr-8'}
                />
                <ChevronDown size={14} className="absolute right-3 top-3 text-zinc-500 pointer-events-none" />
              </div>
              {showSymbolDropdown && filteredSymbols.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden">
                  {filteredSymbols.map(s => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => handleSymbolSelect(s)}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-amber-400/10 hover:text-amber-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Direction *</label>
              <div className="flex rounded-lg overflow-hidden border border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => set('type', 'Long')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                    form.type === 'Long' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                  } border-r border-[#2a2a2a]`}
                >
                  Long ↑
                </button>
                <button
                  type="button"
                  onClick={() => set('type', 'Short')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                    form.type === 'Short' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Short ↓
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section: P&L and Risk */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">P&L & Risk Management</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>P&L ($) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="450 or -200"
                  value={form.pnl}
                  onChange={e => set('pnl', e.target.value)}
                  onBlur={autoCalcRR}
                  className={inputClass + ' pl-7'}
                />
              </div>
              <p className="text-zinc-600 text-[10px] mt-1">Use negative for loss</p>
            </div>
            <div>
              <label className={labelClass}>Risk ($) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="150"
                  value={form.risk}
                  onChange={e => set('risk', e.target.value)}
                  onBlur={autoCalcRR}
                  className={inputClass + ' pl-7'}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Planned R:R</label>
              <input
                type="number"
                step="0.1"
                placeholder="2.0"
                value={form.plannedRR}
                onChange={e => set('plannedRR', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Actual R:R</label>
              <input
                type="number"
                step="0.01"
                placeholder="Auto-calculated"
                value={form.actualRR}
                onChange={e => set('actualRR', e.target.value)}
                className={inputClass}
              />
              <p className="text-zinc-600 text-[10px] mt-1">Auto-fills from P&L ÷ Risk</p>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4">
            <label className={labelClass}>Outcome *</label>
            <div className="flex gap-2">
              {(['Win', 'Loss', 'Break Even'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    form.status === s
                      ? s === 'Win'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : s === 'Loss'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40'
                      : 'border-[#2a2a2a] text-zinc-500 hover:border-[#3a3a3a] hover:text-zinc-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Entry Analysis */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">Entry Analysis</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Entry Reason</label>
              <textarea
                rows={2}
                placeholder="Describe your entry setup and reason..."
                value={form.entryReason}
                onChange={e => set('entryReason', e.target.value)}
                className={inputClass + ' resize-none'}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Followed Trading Rules?</label>
                <Toggle
                  value={form.followedRules}
                  onChange={v => set('followedRules', v)}
                  labelTrue="Yes ✓"
                  labelFalse="No ✗"
                />
              </div>
              <div>
                <label className={labelClass}>Touched Trade After Entry?</label>
                <Toggle
                  value={form.touchedAfterEntry}
                  onChange={v => set('touchedAfterEntry', v)}
                  labelTrue="Yes (modified)"
                  labelFalse="No (hands off)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Notes & Screenshot */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">Notes & Screenshot</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Personal Notes</label>
              <textarea
                rows={3}
                placeholder="Reflections, lessons learned, what you did well or could improve..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                className={inputClass + ' resize-none'}
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className={labelClass}>Trade Screenshot</label>
              {previewImg ? (
                <div className="relative">
                  <img
                    src={previewImg}
                    alt="Trade screenshot"
                    className="w-full h-48 object-contain bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]"
                  />
                  <button
                    type="button"
                    onClick={() => { setPreviewImg(''); set('screenshot', '') }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-[#2a2a2a] rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-amber-400/40 hover:text-amber-400/60 transition-all"
                >
                  <Upload size={20} />
                  <span className="text-sm">Click to upload screenshot</span>
                  <span className="text-xs">PNG, JPG, WebP</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshot}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-3 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors text-sm"
          >
            {editingTrade ? 'Save Changes' : 'Add Trade'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-[#2a2a2a] text-zinc-400 rounded-lg hover:border-[#3a3a3a] hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
