'use client'

import { ViewType } from '@/lib/types'
import {
  LayoutDashboard,
  PlusCircle,
  Table2,
  BarChart3,
  Shield,
  TrendingUp,
  LogOut,
  User,
} from 'lucide-react'

interface NavItem {
  id: ViewType
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'add-trade', label: 'Add Trade', icon: <PlusCircle size={18} /> },
  { id: 'trades', label: 'Trade Log', icon: <Table2 size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'discipline', label: 'Discipline', icon: <Shield size={18} /> },
]

interface NavigationProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  totalPnL: number
  userEmail?: string
  onLogout?: () => void
}

export default function Navigation({ activeView, onViewChange, totalPnL, userEmail, onLogout }: NavigationProps) {
  const isPositive = totalPnL >= 0

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-[#0d0d0d] border-r border-[#1e1e1e] fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Trade Control</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">Journal</p>
            </div>
          </div>
        </div>

        {/* P&L Summary */}
        <div className="px-4 py-3 border-b border-[#1e1e1e]">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Total P&L</p>
          <p className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{totalPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info + Logout */}
        {userEmail && (
          <div className="p-3 border-t border-[#1e1e1e] space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a]">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                <User size={12} className="text-amber-400" />
              </div>
              <p className="text-zinc-400 text-xs truncate flex-1">{userEmail}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d] border-t border-[#1e1e1e] flex">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all ${
              activeView === item.id ? 'text-amber-400' : 'text-zinc-500'
            }`}
          >
            {item.icon}
          </button>
        ))}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium text-zinc-500"
          >
            <LogOut size={18} />
          </button>
        )}
      </nav>
    </>
  )
}
