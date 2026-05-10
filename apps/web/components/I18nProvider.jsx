'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dictionary } from '../lib/i18n';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedLang = localStorage.getItem('lms_lang');
    const savedTheme = localStorage.getItem('lms_theme');
    if (savedLang && dictionary[savedLang]) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('lms_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value = useMemo(() => ({ lang, setLang, theme, setTheme, t: dictionary[lang] }), [lang, theme]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
