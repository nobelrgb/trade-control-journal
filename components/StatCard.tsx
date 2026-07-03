'use client'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: 'green' | 'red' | 'gold' | 'neutral' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

const accentClasses = {
  green: 'text-emerald-400',
  red: 'text-red-400',
  gold: 'text-amber-400',
  neutral: 'text-zinc-400',
  blue: 'text-blue-400',
}

export default function StatCard({ label, value, sub, accent = 'neutral', size = 'md', icon }: StatCardProps) {
  const valueSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl'

  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        {icon && <span className="text-zinc-600">{icon}</span>}
      </div>
      <p className={`${valueSize} font-bold ${accentClasses[accent]} leading-none`}>{value}</p>
      {sub && <p className="text-zinc-600 text-xs mt-1.5">{sub}</p>}
    </div>
  )
}
