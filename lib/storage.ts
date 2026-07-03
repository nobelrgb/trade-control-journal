import { Trade, MonthlyGoal } from './types'
import { demoTrades } from './demoData'

const TRADES_KEY = 'tcj_trades'
const GOAL_KEY = 'tcj_monthly_goal'
const INITIALIZED_KEY = 'tcj_initialized'

export function loadTrades(): Trade[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(TRADES_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Trade[]
  } catch {
    return []
  }
}

export function saveTrades(trades: Trade[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades))
}

export function loadGoal(): MonthlyGoal {
  if (typeof window === 'undefined') return defaultGoal()
  const raw = localStorage.getItem(GOAL_KEY)
  if (!raw) return defaultGoal()
  try {
    return JSON.parse(raw) as MonthlyGoal
  } catch {
    return defaultGoal()
  }
}

export function saveGoal(goal: MonthlyGoal): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal))
}

function defaultGoal(): MonthlyGoal {
  const now = new Date()
  return {
    amount: 1000,
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  }
}

export function initializeDemoData(): Trade[] {
  if (typeof window === 'undefined') return demoTrades
  const isInitialized = localStorage.getItem(INITIALIZED_KEY)
  if (!isInitialized) {
    saveTrades(demoTrades)
    localStorage.setItem(INITIALIZED_KEY, 'true')
    return demoTrades
  }
  return loadTrades()
}
