import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { localize, type Locale } from './translate.ts';
export { localize, translate, type Locale } from './translate.ts';
const Context = createContext({
  locale: 'en' as Locale,
  setLocale: (_locale: Locale) => {},
  tr: <T,>(value: T): T => value,
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem('aesthetic-dna-locale') === 'zh' ? 'zh' : 'en';
    } catch {
      return 'en';
    }
  });
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title =
      locale === 'en' ? 'Aesthetic DNA — How you see the world' : '审美 DNA · 你的目光，自有主张';
    try {
      localStorage.setItem('aesthetic-dna-locale', locale);
    } catch {}
  }, [locale]);
  return (
    <Context.Provider value={{ locale, setLocale, tr: <T,>(value: T) => localize(locale, value) }}>
      {children}
    </Context.Provider>
  );
}
export const useI18n = () => useContext(Context);
