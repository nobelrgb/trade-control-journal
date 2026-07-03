'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/components/LanguageContext'
import { TrendingUp, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const { t } = useLanguage()
  const a = t.auth

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess(a.accountCreated)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(
        msg.includes('Invalid login credentials') ? a.wrongCredentials :
        msg.includes('User already registered') ? a.alreadyRegistered :
        msg.includes('Password should be at least') ? a.passwordTooShort :
        msg
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm
    focus:outline-none focus:border-amber-400/60 transition-all placeholder:text-zinc-600
  `

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-emerald-400/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-4">
            <TrendingUp size={28} className="text-amber-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">Trade Control Journal</h1>
          <p className="text-zinc-500 text-sm mt-1">{a.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-xl bg-[#1a1a1a] p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#0d0d0d] text-white shadow-sm border border-[#2a2a2a]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {a.signIn}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-[#0d0d0d] text-white shadow-sm border border-[#2a2a2a]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {a.createAccount}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-1.5 block">{a.email}</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-3.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass + ' pl-11'}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-1.5 block">{a.password}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-3.5 text-zinc-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder={mode === 'register' ? a.passwordPlaceholder : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass + ' pl-11 pr-11'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <p className="text-emerald-400 text-sm">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? a.signingIn : a.creatingAccount}
                </>
              ) : (
                mode === 'login' ? a.signInBtn : a.createBtn
              )}
            </button>
          </form>

          <p className="text-zinc-600 text-xs text-center mt-5">
            {mode === 'login' ? (
              <>{a.noAccount} <button onClick={() => { setMode('register'); setError('') }} className="text-amber-400 hover:text-amber-300">{a.createOne}</button></>
            ) : (
              <>{a.haveAccount} <button onClick={() => { setMode('login'); setError('') }} className="text-amber-400 hover:text-amber-300">{a.signInLink}</button></>
            )}
          </p>
        </div>

        <p className="text-zinc-700 text-xs text-center mt-4">{a.privacy}</p>
      </div>
    </div>
  )
}
