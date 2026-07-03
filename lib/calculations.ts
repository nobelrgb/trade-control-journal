import { Trade } from './types'

export function calculateStats(trades: Trade[]) {
  if (trades.length === 0) return null

  const wins = trades.filter(t => t.status === 'Win')
  const losses = trades.filter(t => t.status === 'Loss')
  const breakEvens = trades.filter(t => t.status === 'Break Even')

  const totalWinAmount = wins.reduce((s, t) => s + t.pnl, 0)
  const totalLossAmount = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0)

  const winRate = (wins.length / trades.length) * 100
  const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0
  const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : Infinity
  const avgRR = trades.reduce((s, t) => s + t.actualRR, 0) / trades.length

  const sorted = [...trades].sort((a, b) =>
    `${a.date}T${a.time}` > `${b.date}T${b.time}` ? 1 : -1
  )

  let maxWinStreak = 0, currentWinStreak = 0
  let maxLossStreak = 0, currentLossStreak = 0

  for (const t of sorted) {
    if (t.status === 'Win') {
      currentWinStreak++
      currentLossStreak = 0
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
    } else if (t.status === 'Loss') {
      currentLossStreak++
      currentWinStreak = 0
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
    } else {
      currentWinStreak = 0
      currentLossStreak = 0
    }
  }

  const bestTrade = trades.reduce((b, t) => !b || t.pnl > b.pnl ? t : b, null as Trade | null)
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
    wins: wins.length,
    losses: losses.length,
    breakEvens: breakEvens.length,
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
    if (t.status === 'Win') s.wins++
    else if (t.status === 'Loss') s.losses++
  }

  return Array.from(map.entries())
    .map(([symbol, stats]) => ({
      symbol,
      ...stats,
      winRate: (stats.wins / stats.trades) * 100,
    }))
    .sort((a, b) => b.pnl - a.pnl)
}

export function getLongShortStats(trades: Trade[]) {
  const longs = trades.filter(t => t.type === 'Long')
  const shorts = trades.filter(t => t.type === 'Short')

  const calc = (arr: Trade[]) => ({
    count: arr.length,
    wins: arr.filter(t => t.status === 'Win').length,
    pnl: arr.reduce((s, t) => s + t.pnl, 0),
    winRate: arr.length > 0 ? (arr.filter(t => t.status === 'Win').length / arr.length) * 100 : 0,
  })

  return { longs: calc(longs), shorts: calc(shorts) }
}

export function getBestAndWorstDays(trades: Trade[]) {
  const dailyMap = new Map<string, number>()
  for (const t of trades) {
    dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + t.pnl)
  }

  const days = Array.from(dailyMap.entries())
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => b.pnl - a.pnl)

  return {
    bestDays: days.slice(0, 5),
    worstDays: days.slice(-5).reverse(),
  }
}

export function getDisciplineStats(trades: Trade[]) {
  const followed = trades.filter(t => t.followedRules)
  const notFollowed = trades.filter(t => !t.followedRules)

  const followedPnL = followed.reduce((s, t) => s + t.pnl, 0)
  const notFollowedPnL = notFollowed.reduce((s, t) => s + t.pnl, 0)
  const followedWins = followed.filter(t => t.status === 'Win').length
  const notFollowedWins = notFollowed.filter(t => t.status === 'Win').length
  const followedWinRate = followed.length > 0 ? (followedWins / followed.length) * 100 : 0
  const notFollowedWinRate = notFollowed.length > 0 ? (notFollowedWins / notFollowed.length) * 100 : 0

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
    followedCount: followed.length,
    notFollowedCount: notFollowed.length,
    followedPnL,
    notFollowedPnL,
    followedWinRate,
    notFollowedWinRate,
    followedWins,
    notFollowedLosses: notFollowed.filter(t => t.status === 'Loss').length,
    message,
  }
}
