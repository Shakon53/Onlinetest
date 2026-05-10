'use client';

import Link from 'next/link';
import { Bell, GraduationCap, Moon, Search, Sun } from 'lucide-react';
import { languages } from '../lib/i18n';
import { useI18n } from './I18nProvider';

export function Shell({ children }) {
  const { lang, setLang, theme, setTheme, t } = useI18n();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_32%),radial-gradient(circle_at_top_right,#f5d0fe,transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,#1e3a8a,transparent_28%),radial-gradient(circle_at_top_right,#581c87,transparent_24%)]">
      <header className="sticky top-0 z-50 border-b border-white/30 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-600 dark:text-blue-300">
            <span className="rounded-2xl bg-brand-600 p-2 text-white"><GraduationCap size={22} /></span>
            {t.platform}
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <Link href="/courses">{t.navCourses}</Link>
            <Link href="/dashboard">{t.navDashboard}</Link>
            <Link href="/teacher">{t.navTeacher}</Link>
            <Link href="/admin">{t.navAdmin}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900 lg:flex">
              <Search size={16} />
              <span className="text-slate-500">{t.search}</span>
            </div>
            <select value={lang} onChange={(event) => setLang(event.target.value)} className="rounded-full border-0 bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900">
              {languages.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
            </select>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-900">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-900"><Bell size={18} /></button>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
