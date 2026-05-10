'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, GraduationCap, LogOut, Moon, Search, Sun, User } from 'lucide-react';
import { languages } from '../lib/i18n';
import { useI18n } from './I18nProvider';
import { getSession, logout } from '../lib/api';

export function Shell({ children }) {
  const { lang, setLang, theme, setTheme, t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    router.push('/');
  }

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

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
            {user && <Link href="/dashboard">{t.navDashboard}</Link>}
            {isTeacher && <Link href="/teacher" className="text-violet-600 dark:text-violet-400">{t.navTeacher}</Link>}
            {isAdmin && <Link href="/admin" className="text-rose-600 dark:text-rose-400">{t.navAdmin}</Link>}
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
            {user ? (
              <>
                <button className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-900"><Bell size={18} /></button>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900">
                  <User size={16} className="text-brand-600" />
                  <span className="max-w-[100px] truncate font-medium">{user.name}</span>
                </div>
                <button onClick={handleLogout} title="Выйти" className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                  <LogOut size={18} className="text-rose-500" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm dark:bg-slate-900">{t.login}</Link>
                <Link href="/auth/register" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">{t.register}</Link>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
