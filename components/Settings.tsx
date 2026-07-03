'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/components/LanguageContext'
import { Settings as SettingsIcon, Globe, Lock, Mail, Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

const inputClass = 'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors placeholder:text-zinc-600'
const labelClass = 'text-zinc-400 text-xs font-medium mb-1.5 block uppercase tracking-wide'

export default function Settings() {
  const { t, lang, setLang } = useLanguage()
  const s = t.settings

  const [pwForm, setPwForm] = useState({ newPw: '', confirmPw: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const [emailForm, setEmailForm] = useState({ newEmail: '' })
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (pwForm.newPw !== pwForm.confirmPw) { setPwMsg({ text: s.passwordMismatch, ok: false }); return }
    if (pwForm.newPw.length < 6) { setPwMsg({ text: s.passwordShort, ok: false }); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw })
      if (error) throw error
      setPwMsg({ text: s.passwordUpdated, ok: true })
      setPwForm({ newPw: '', confirmPw: '' })
    } catch (err: unknown) {
      setPwMsg({ text: err instanceof Error ? err.message : 'Error', ok: false })
    } finally {
      setPwLoading(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMsg(null)
    setEmailLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: emailForm.newEmail })
      if (error) throw error
      setEmailMsg({ text: s.emailUpdated, ok: true })
      setEmailForm({ newEmail: '' })
    } catch (err: unknown) {
      setEmailMsg({ text: err instanceof Error ? err.message : 'Error', ok: false })
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon size={22} className="text-amber-400" />
        <div>
          <h1 className="text-white text-2xl font-bold">{s.title}</h1>
        </div>
      </div>

      {/* Language */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-amber-400" />
          <h2 className="text-amber-400 text-xs font-semibold uppercase tracking-widest">{s.language}</h2>
        </div>
        <p className="text-zinc-400 text-sm mb-4">{s.languageDesc}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              lang === 'en'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                : 'border-[#2a2a2a] text-zinc-400 hover:border-[#3a3a3a] hover:text-white'
            }`}
          >
            {lang === 'en' && <Check size={14} />}
            {s.english}
          </button>
          <button
            onClick={() => setLang('he')}
            className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              lang === 'he'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                : 'border-[#2a2a2a] text-zinc-400 hover:border-[#3a3a3a] hover:text-white'
            }`}
          >
            {lang === 'he' && <Check size={14} />}
            {s.hebrew}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-amber-400" />
          <h2 className="text-amber-400 text-xs font-semibold uppercase tracking-widest">{s.changePassword}</h2>
        </div>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className={labelClass}>{s.newPassword}</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.newPw}
                onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                placeholder={s.passwordMin}
                minLength={6}
                required
                className={inputClass + ' pr-11'}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>{s.confirmPassword}</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.confirmPw}
              onChange={e => setPwForm(f => ({ ...f, confirmPw: e.target.value }))}
              placeholder="••••••••"
              required
              className={inputClass}
              autoComplete="new-password"
            />
          </div>

          {pwMsg && (
            <div className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
              pwMsg.ok
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {pwMsg.ok ? <Check size={14} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
              {pwMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="w-full py-2.5 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {pwLoading ? <><Loader2 size={14} className="animate-spin" />{s.updating}</> : s.updatePassword}
          </button>
        </form>
      </div>

      {/* Change Email */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={16} className="text-amber-400" />
          <h2 className="text-amber-400 text-xs font-semibold uppercase tracking-widest">{s.changeEmail}</h2>
        </div>
        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <label className={labelClass}>{s.newEmail}</label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={e => setEmailForm({ newEmail: e.target.value })}
              placeholder="new@email.com"
              required
              className={inputClass}
              autoComplete="email"
            />
          </div>

          {emailMsg && (
            <div className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
              emailMsg.ok
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {emailMsg.ok ? <Check size={14} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
              {emailMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={emailLoading}
            className="w-full py-2.5 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {emailLoading ? <><Loader2 size={14} className="animate-spin" />{s.updating}</> : s.updateEmail}
          </button>
        </form>
      </div>
    </div>
  )
}
