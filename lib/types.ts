export interface Trade {
  id: string
  date: string
  time: string
  symbol: string
  type: 'Long' | 'Short'
  pnl: number
  risk: number
  plannedRR: number
  actualRR: number
  status: 'Win' | 'Loss' | 'Break Even'
  entryReason: string
  followedRules: boolean
  touchedAfterEntry: boolean
  notes: string
  screenshot?: string
  createdAt: string
}

export interface MonthlyGoal {
  amount: number
  month: string
}

export type ViewType = 'dashboard' | 'add-trade' | 'trades' | 'analytics' | 'discipline'
