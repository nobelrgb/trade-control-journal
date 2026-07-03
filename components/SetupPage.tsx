'use client'

import { TrendingUp, Database, Key, ExternalLink, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    num: 1,
    title: 'Create a free Supabase account',
    desc: 'Go to supabase.com and sign up for free',
    action: 'Open Supabase',
    link: 'https://supabase.com',
  },
  {
    num: 2,
    title: 'Create a new project',
    desc: 'Click "New Project" → give it a name → choose a database password → click Create',
    action: null,
    link: null,
  },
  {
    num: 3,
    title: 'Run the SQL setup',
    desc: 'In your Supabase project → go to SQL Editor → paste the contents of supabase-setup.sql → click Run',
    action: null,
    link: null,
  },
  {
    num: 4,
    title: 'Get your API keys',
    desc: 'Go to Project Settings → API → copy "Project URL" and "anon/public" key',
    action: null,
    link: null,
  },
  {
    num: 5,
    title: 'Create .env.local file',
    desc: 'In the trade-control-journal folder, create a file called .env.local with your keys (see example below)',
    action: null,
    link: null,
  },
  {
    num: 6,
    title: 'Restart the app',
    desc: 'Stop the server (Ctrl+C) and run npm run dev again',
    action: null,
    link: null,
  },
]

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-4">
            <TrendingUp size={28} className="text-amber-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">One-Time Setup Required</h1>
          <p className="text-zinc-500 text-sm mt-1">Connect your Supabase account to enable login and data storage</p>
        </div>

        {/* Steps */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-6 mb-4 space-y-4">
          {steps.map(step => (
            <div key={step.num} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 text-xs font-bold">{step.num}</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{step.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                {step.action && step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {step.action} <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* .env.local example */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Key size={14} className="text-amber-400" />
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">.env.local contents</p>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-xs text-zinc-300 border border-[#2a2a2a]">
            <p className="text-zinc-500"># Paste your Supabase values below:</p>
            <p className="mt-1">NEXT_PUBLIC_SUPABASE_URL=<span className="text-amber-400">https://xxxxx.supabase.co</span></p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=<span className="text-amber-400">eyJhbGciOiJIUzI1NiIsInR5cCI6...</span></p>
          </div>
          <p className="text-zinc-600 text-xs mt-2">
            Save this file in: <span className="text-zinc-400">trade-control-journal\.env.local</span>
          </p>
        </div>

        {/* Tip */}
        <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-xl p-4">
          <div className="flex gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-emerald-400 text-xs font-semibold mb-1">Tip: Disable email confirmation</p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                In Supabase → Authentication → Settings → turn off &quot;Enable email confirmations&quot; so you can log in immediately without verifying email.
              </p>
            </div>
          </div>
        </div>

        <p className="text-zinc-700 text-xs text-center mt-5">
          Supabase free tier is more than enough for personal trading journal use
        </p>
      </div>
    </div>
  )
}
