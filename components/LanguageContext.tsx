'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Lang, translations, T } from '@/lib/i18n'

interface LanguageContextType {
  lang: Lang
  t: T
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: translations.en,
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('tcj_lang') as Lang | null
    if (saved === 'en' || saved === 'he') setLangState(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('tcj_lang', lang)
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
