'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { Trade, MonthlyGoal, ViewType } from '@/lib/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { fetchTrades, insertTrade, updateTrade, deleteTrade, fetchGoal, upsertGoal, bulkInsertTrades } from '@/lib/db'
import { calculateStats } from '@/lib/calculations'
import { exportToCSV, importFromCSV } from '@/lib/csvUtils'
import { demoTrades } from '@/lib/demoData'
import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'
import TradeForm from '@/components/TradeForm'
import TradesTable from '@/components/TradesTable'
import Analytics from '@/components/Analytics'
import Discipline from '@/components/Discipline'
import AuthPage from '@/components/AuthPage'
import SetupPage from '@/components/SetupPage'
import { Download, Upload, CheckCircle, LogOut, Loader2 } from 'lucide-react'

const DEFAULT_MONTH = new Date().toISOString().slice(0, 7)

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [trades, setTrades] = useState<Trade[]>([])
  const [tradesLoading, setTradesLoading] = useState(false)
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoal>({ amount: 1000, month: DEFAULT_MONTH })
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch trades & goal when user logs in ───────────────────────────────────
  useEffect(() => {
    if (!user) { setTrades([]); return }

    const load = async () => {
      setTradesLoading(true)
      try {
        const [t, g] = await Promise.all([
          fetchTrades(user.id),
          fetchGoal(user.id, DEFAULT_MONTH),
        ])
        setTrades(t)
        if (g) setMonthlyGoal(g)
      } catch (err) {
        showToast('Error loading data', 'error')
        console.error(err)
      } finally {
        setTradesLoading(false)
      }
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Toast ───────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Trade actions ───────────────────────────────────────────────────────────
  const handleAddTrade = async (tradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    if (!user) return

    if (editingTrade) {
      const updated: Trade = { ...tradeData, id: editingTrade.id, createdAt: editingTrade.createdAt }
      try {
        await updateTrade(updated, user.id)
        setTrades(prev => prev.map(t => t.id === updated.id ? updated : t))
        showToast('Trade updated')
      } catch {
        showToast('Failed to update trade', 'error')
      }
      setEditingTrade(null)
    } else {
      const newTrade: Trade = {
        ...tradeData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      try {
        await insertTrade(newTrade, user.id)
        setTrades(prev => [newTrade, ...prev])
        showToast('Trade added')
      } catch {
        showToast('Failed to save trade', 'error')
      }
    }
    setActiveView('trades')
  }

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade)
    setActiveView('add-trade')
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    try {
      await deleteTrade(id, user.id)
      setTrades(prev => prev.filter(t => t.id !== id))
      showToast('Trade deleted')
    } catch {
      showToast('Failed to delete trade', 'error')
    }
  }

  const handleGoalUpdate = async (goal: MonthlyGoal) => {
    if (!user) return
    setMonthlyGoal(goal)
    try {
      await upsertGoal(user.id, goal)
    } catch {
      showToast('Failed to save goal', 'error')
    }
  }

  const handleLoadDemo = async () => {
    if (!user) return
    try {
      const existing = new Set(trades.map(t => t.id))
      const newTrades = demoTrades.filter(t => !existing.has(t.id))
      if (newTrades.length === 0) { showToast('Demo trades already loaded'); return }
      await bulkInsertTrades(newTrades, user.id)
      setTrades(prev => [...newTrades, ...prev])
      showToast(`Loaded ${newTrades.length} demo trades`)
    } catch {
      showToast('Failed to load demo data', 'error')
    }
  }

  // ── CSV ─────────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (trades.length === 0) { showToast('No trades to export', 'error'); return }
    exportToCSV(trades)
    showToast(`Exported ${trades.length} trades`)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setImportLoading(true)
    try {
      const imported = await importFromCSV(file)
      const existing = new Set(trades.map(t => t.id))
      const newTrades = imported.filter(t => !existing.has(t.id))
      if (newTrades.length > 0) {
        await bulkInsertTrades(newTrades, user.id)
        setTrades(prev => [...newTrades, ...prev])
      }
      showToast(`Imported ${newTrades.length} new trades`)
    } catch {
      showToast('Failed to import CSV', 'error')
    } finally {
      setImportLoading(false)
      if (importRef.current) importRef.current.value = ''
    }
  }

  const handleViewChange = (view: ViewType) => {
    if (view !== 'add-trade') setEditingTrade(null)
    setActiveView(view)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setTrades([])
    setActiveView('dashboard')
  }

  // ── Render states ───────────────────────────────────────────────────────────
  if (!isSupabaseConfigured) return <SetupPage />

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Connecting...</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  if (tradesLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Loading your trades...</p>
        </div>
      </div>
    )
  }

  const stats = calculateStats(trades)
  const totalPnL = stats?.totalPnL || 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navigation
        activeView={activeView}
        onViewChange={handleViewChange}
        totalPnL={totalPnL}
        userEmail={user.email || ''}
        onLogout={handleLogout}
      />

      <main className="lg:pl-56 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {trades.length === 0 && (
                <button
                  onClick={handleLoadDemo}
                  className="px-3 py-1.5 border border-amber-400/30 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-all text-xs font-medium"
                >
                  Load Demo Data
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2a2a2a] rounded-lg text-zinc-400 hover:text-white hover:border-[#3a3a3a] transition-all text-xs"
              >
                <Download size={13} />
                Export CSV
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2a2a2a] rounded-lg text-zinc-400 hover:text-white hover:border-[#3a3a3a] transition-all text-xs cursor-pointer">
                <Upload size={13} />
                {importLoading ? 'Importing...' : 'Import CSV'}
                <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </div>

          {/* Views */}
          {activeView === 'dashboard' && (
            <Dashboard
              trades={trades}
              monthlyGoal={monthlyGoal}
              onGoalUpdate={handleGoalUpdate}
              onAddTrade={() => handleViewChange('add-trade')}
            />
          )}
          {activeView === 'add-trade' && (
            <TradeForm
              onSubmit={handleAddTrade}
              onCancel={() => handleViewChange(editingTrade ? 'trades' : 'dashboard')}
              editingTrade={editingTrade}
            />
          )}
          {activeView === 'trades' && (
            <TradesTable trades={trades} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          {activeView === 'analytics' && <Analytics trades={trades} />}
          {activeView === 'discipline' && <Discipline trades={trades} />}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-24 lg:bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <CheckCircle size={15} />
          {toast.msg}
        </div>
      )}
    </div>
  )
}
