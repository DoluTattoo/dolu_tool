import { Context, createContext, useContext, useEffect, useState } from 'react'
import { fetchNui } from '../utils/fetchNui'

export type Locale = Record<string, string>

// Wrap the locale table so any missing key resolves to an empty string instead
// of `undefined`, keeping the UI safe even if a translation is absent.
const createLocale = (data?: Record<string, string> | null): Locale =>
  new Proxy(data ?? {}, {
    get: (target, key) => target[key as string] ?? '',
  }) as Locale

const LocaleCtx = createContext<Locale | null>(null)

const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => createLocale())

  useEffect(() => {
    fetchNui<Record<string, string>>('loadLocale').then((data) => setLocale(createLocale(data)))
  }, [])

  return <LocaleCtx.Provider value={locale}>{children}</LocaleCtx.Provider>
}

export default LocaleProvider

export const useLocales = () => ({
  locale: useContext(LocaleCtx as Context<Locale>),
})
