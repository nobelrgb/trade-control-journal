import { supabase } from './supabase'
import { Trade, MonthlyGoal } from './types'

// ── Mapping ──────────────────────────────────────────────────────────────────

function toDb(trade: Trade, userId: string) {
  return {
    id: trade.id,
    user_id: userId,
    date: trade.date,
    time: trade.time,
    symbol: trade.symbol,
    type: trade.type,
    pnl: trade.pnl,
    risk: trade.risk,
    planned_rr: trade.plannedRR,
    actual_rr: trade.actualRR,
    status: trade.status,
    entry_reason: trade.entryReason,
    followed_rules: trade.followedRules,
    touched_after_entry: trade.touchedAfterEntry,
    notes: trade.notes,
    screenshot: trade.screenshot || null,
    created_at: trade.createdAt,
  }
}

function fromDb(row: Record<string, unknown>): Trade {
  return {
    id: row.id as string,
    date: row.date as string,
    time: row.time as string,
    symbol: row.symbol as string,
    type: row.type as 'Long' | 'Short',
    pnl: Number(row.pnl),
    risk: Number(row.risk),
    plannedRR: Number(row.planned_rr),
    actualRR: Number(row.actual_rr),
    status: row.status as Trade['status'],
    entryReason: (row.entry_reason as string) || '',
    followedRules: Boolean(row.followed_rules),
    touchedAfterEntry: Boolean(row.touched_after_entry),
    notes: (row.notes as string) || '',
    screenshot: (row.screenshot as string) || undefined,
    createdAt: (row.created_at as string) || '',
  }
}

// ── Trades ────────────────────────────────────────────────────────────────────

export async function fetchTrades(userId: string): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []).map(row => fromDb(row as Record<string, unknown>))
}

export async function insertTrade(trade: Trade, userId: string): Promise<void> {
  const { error } = await supabase.from('trades').insert(toDb(trade, userId))
  if (error) throw new Error(error.message)
}

export async function updateTrade(trade: Trade, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trades')
    .update(toDb(trade, userId))
    .eq('id', trade.id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function deleteTrade(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function bulkInsertTrades(trades: Trade[], userId: string): Promise<void> {
  const rows = trades.map(t => toDb(t, userId))
  const { error } = await supabase.from('trades').insert(rows)
  if (error) throw new Error(error.message)
}

// ── Monthly Goal ──────────────────────────────────────────────────────────────

export async function fetchGoal(userId: string, month: string): Promise<MonthlyGoal | null> {
  const { data, error } = await supabase
    .from('monthly_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  if (error || !data) return null
  return { amount: Number(data.amount), month: data.month as string }
}

export async function upsertGoal(userId: string, goal: MonthlyGoal): Promise<void> {
  const { error } = await supabase.from('monthly_goals').upsert(
    { user_id: userId, amount: goal.amount, month: goal.month },
    { onConflict: 'user_id,month' }
  )
  if (error) throw new Error(error.message)
}
