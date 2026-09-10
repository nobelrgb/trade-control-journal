import { Trade } from './types'

// ── Price-based R-Multiple utilities ─────────────────────────────────────────

export function calcInitialRisk(
  entry: number | undefined,
  sl: number | undefined,
  type: 'Long' | 'Short'
): number | null {
  if (entry == null || sl == null || entry === sl) return null
  const risk = type === 'Long' ? entry - sl : sl - entry
  return risk > 0 ? risk : null
}

export function calcPlannedRR(
  entry: number | undefined,
  sl: number | undefined,
  tp: number | undefined,
  type: 'Long' | 'Short'
): number | null {
  if (tp == null) return null
  const risk = calcInitialRisk(entry, sl, type)
  if (!risk) return null
  const reward = type === 'Long' ? tp - (entry ?? 0) : (entry ?? 0) - tp
  return reward > 0 ? reward / risk : null
}

export function calcRealizedR(
  entry: number | undefined,
  sl: number | undefined,
  exit: number | undefined,
  type: 'Long' | 'Short'
): number | null {
  if (exit == null) return null
  const risk = calcInitialRisk(entry, sl, type)
  if (!risk) return null
  const move = type === 'Long' ? exit - (entry ?? 0) : (entry ?? 0) - exit
  return move / risk
}

export function formatR(r: number | null | undefined, fallback = '—'): string {
  if (r == null) return fallback
  return `${r > 0 ? '+' : ''}${r.toFixed(2)}R`
}

// ── Outcome + Actual-R single source of truth ─────────────────────────────────

/** Floating-point tolerance for zero P&L */
export const OUTCOME_EPSILON = 0.000001

/**
 * Derive trade outcome from P&L — this is the ONE definition used everywhere.
 * P&L > ε  → Win
 * P&L < -ε → Loss
 * else      → Break Even
 */
export function deriveTradeOutcome(pnl: number): 'Win' | 'Loss' | 'Break Even' {
  if (pnl > OUTCOME_EPSILON) return 'Win'
  if (pnl < -OUTCOME_EPSILON) return 'Loss'
  return 'Break Even'
}

/**
 * Dollar-based Actual R.  Risk must be a positive dollar amount.
 * Returns 0 for invalid inputs instead of NaN / ±Infinity.
 */
export function calculateActualR(pnl: number, risk: number): number {
  if (!isFinite(pnl) || !isFinite(risk) || risk <= 0) return 0
  return pnl / risk
}

// ─────────────────────────────────────────────────────────────────────────────

export function calculateStats(trades: Trade[]) {
  if (trades.length === 0) return null

  // Derive wins/losses from P&L — never from stored status
  const wins     = trades.filter(t => t.pnl > OUTCOME_EPSILON)
  const losses   = trades.filter(t => t.pnl < -OUTCOME_EPSILON)
  const breakEvens = trades.filter(t => Math.abs(t.pnl) <= OUTCOME_EPSILON)

  const totalWinAmount  = wins.reduce((s, t) => s + t.pnl, 0)
  const totalLossAmount = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
  const totalPnL        = trades.reduce((s, t) => s + t.pnl, 0)

  // Win rate excludes break-even trades from the denominator
  const contested = wins.length + losses.length
  const winRate     = contested > 0 ? (wins.length / contested) * 100 : 0
  const avgWin      = wins.length   > 0 ? totalWinAmount  / wins.length   : 0
  const avgLoss     = losses.length > 0 ? totalLossAmount / losses.length : 0
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : Infinity
  const avgRR       = trades.reduce((s, t) => s + t.actualRR, 0) / trades.length

  const sorted = [...trades].sort((a, b) =>
    `${a.date}T${a.time}` > `${b.date}T${b.time}` ? 1 : -1
  )

  let maxWinStreak = 0, currentWinStreak = 0
  let maxLossStreak = 0, currentLossStreak = 0

  for (const t of sorted) {
    const outcome = deriveTradeOutcome(t.pnl)
    if (outcome === 'Win') {
      currentWinStreak++
      currentLossStreak = 0
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
    } else if (outcome === 'Loss') {
      currentLossStreak++
      currentWinStreak = 0
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
    } else {
      currentWinStreak = 0
      currentLossStreak = 0
    }
  }

  const bestTrade  = trades.reduce((b, t) => !b || t.pnl > b.pnl ? t : b, null as Trade | null)
  const worstTrade = trades.reduce((w, t) => !w || t.pnl < w.pnl ? t : w, null as Trade | null)

  return {
    totalPnL,
    totalWinAmount,
    totalLossAmount,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    avgRR,
    bestTrade,
    worstTrade,
    maxWinStreak,
    maxLossStreak,
    totalTrades: trades.length,
    wins:        wins.length,
    losses:      losses.length,
    breakEvens:  breakEvens.length,
  }
}

export function getDailyPnL(trades: Trade[]): number {
  const today = new Date().toISOString().slice(0, 10)
  return trades.filter(t => t.date === today).reduce((s, t) => s + t.pnl, 0)
}

export function getWeeklyPnL(trades: Trade[]): number {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return trades
    .filter(t => new Date(t.date) >= weekStart)
    .reduce((s, t) => s + t.pnl, 0)
}

export function getMonthlyPnL(trades: Trade[], month?: string): number {
  const m = month || new Date().toISOString().slice(0, 7)
  return trades.filter(t => t.date.startsWith(m)).reduce((s, t) => s + t.pnl, 0)
}

export function getEquityCurve(trades: Trade[]) {
  const sorted = [...trades].sort((a, b) =>
    `${a.date}T${a.time}` > `${b.date}T${b.time}` ? 1 : -1
  )

  const dailyMap = new Map<string, number>()
  for (const t of sorted) {
    dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + t.pnl)
  }

  const days = Array.from(dailyMap.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1))
  let cumulative = 0

  const points = days.map(([date, pnl]) => {
    cumulative += pnl
    const d = new Date(date + 'T12:00:00')
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      fullDate: date,
      dailyPnL: pnl,
      cumulative,
    }
  })

  // Always prepend a $0 start point so there's always a line (not just a dot)
  if (points.length > 0) {
    points.unshift({ date: 'Start', fullDate: '', dailyPnL: 0, cumulative: 0 })
  }

  return points
}

export function getSymbolStats(trades: Trade[]) {
  const map = new Map<string, { wins: number; losses: number; pnl: number; trades: number }>()

  for (const t of trades) {
    if (!map.has(t.symbol)) {
      map.set(t.symbol, { wins: 0, losses: 0, pnl: 0, trades: 0 })
    }
    const s = map.get(t.symbol)!
    s.trades++
    s.pnl += t.pnl
    const outcome = deriveTradeOutcome(t.pnl)
    if (outcome === 'Win')  s.wins++
    else if (outcome === 'Loss') s.losses++
  }

  return Array.from(map.entries())
    .map(([symbol, stats]) => ({
      symbol,
      ...stats,
      // Win rate excludes break-evens
      winRate: (stats.wins + stats.losses) > 0
        ? (stats.wins / (stats.wins + stats.losses)) * 100
        : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl)
}

export function getLongShortStats(trades: Trade[]) {
  const longs  = trades.filter(t => t.type === 'Long')
  const shorts = trades.filter(t => t.type === 'Short')

  const calc = (arr: Trade[]) => {
    const wins   = arr.filter(t => t.pnl > OUTCOME_EPSILON).length
    const losses = arr.filter(t => t.pnl < -OUTCOME_EPSILON).length
    return {
      count:   arr.length,
      wins,
      pnl:     arr.reduce((s, t) => s + t.pnl, 0),
      winRate: (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0,
    }
  }

  return { longs: calc(longs), shorts: calc(shorts) }
}

export function getBestAndWorstDays(trades: Trade[]) {
  // Aggregate by date first — never classify days by stored trade outcome
  const dailyMap = new Map<string, number>()
  for (const t of trades) {
    dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + t.pnl)
  }

  const days = Array.from(dailyMap.entries())
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => b.pnl - a.pnl)

  return {
    bestDays:  days.slice(0, 5),
    worstDays: days.slice(-5).reverse(),
  }
}

export function getDisciplineStats(trades: Trade[]) {
  const followed    = trades.filter(t => t.followedRules)
  const notFollowed = trades.filter(t => !t.followedRules)

  const followedPnL    = followed.reduce((s, t)    => s + t.pnl, 0)
  const notFollowedPnL = notFollowed.reduce((s, t) => s + t.pnl, 0)

  // Derive wins / losses from P&L
  const followedWins       = followed.filter(t    => t.pnl > OUTCOME_EPSILON).length
  const followedLosses     = followed.filter(t    => t.pnl < -OUTCOME_EPSILON).length
  const notFollowedWins    = notFollowed.filter(t => t.pnl > OUTCOME_EPSILON).length
  const notFollowedLosses  = notFollowed.filter(t => t.pnl < -OUTCOME_EPSILON).length

  // Win rate excludes break-evens from denominator
  const followedContested    = followedWins    + followedLosses
  const notFollowedContested = notFollowedWins + notFollowedLosses
  const followedWinRate    = followedContested    > 0 ? (followedWins    / followedContested)    * 100 : 0
  const notFollowedWinRate = notFollowedContested > 0 ? (notFollowedWins / notFollowedContested) * 100 : 0

  let message = ''
  if (followed.length > 0 && notFollowed.length > 0) {
    if (followedPnL > 0 && notFollowedPnL < 0) {
      message = 'Your rule-based trades are profitable while rule-breaks are losing money. Trust your system.'
    } else if (followedWinRate > notFollowedWinRate + 10) {
      message = 'Your win rate is significantly higher when following your rules. Stay disciplined!'
    } else if (followedPnL > notFollowedPnL) {
      message = 'Your rule-based trades outperform trades outside your plan. Keep sticking to the plan.'
    } else {
      message = 'Focus on consistency. Every trade must follow your rules for long-term edge.'
    }
  } else if (notFollowed.length === 0) {
    message = 'Excellent! All your trades follow your rules. This is the foundation of consistent profitability.'
  } else {
    message = 'No rule-based trades recorded yet. Start applying your trading rules consistently.'
  }

  return {
    followedCount:      followed.length,
    notFollowedCount:   notFollowed.length,
    followedPnL,
    notFollowedPnL,
    followedWinRate,
    notFollowedWinRate,
    followedWins,
    followedLosses,
    notFollowedWins,
    notFollowedLosses,
    message,
  }
}
