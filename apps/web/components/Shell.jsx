'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bell, BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, MessageCircle, Moon, Search, Shield, Sun, Trophy, User, X, Flame } from 'lucide-react';
import { languages } from '../lib/i18n';
import { useI18n } from './I18nProvider';
import { getSession, logout } from '../lib/api';
import AIAssistant from './AIAssistant';

export function Shell({ children }) {
  const { lang, setLang, theme, setTheme, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => { setUser(getSession()); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleLogout() {
    logout();
    setUser(null);
    router.push('/');
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { href: '/courses', label: t.navCourses, icon: BookOpen },
    ...(user ? [{ href: '/dashboard', label: t.navDashboard, icon: LayoutDashboard }] : []),
    ...(user ? [{ href: '/leaderboard', label: t.navLeaderboard, icon: Trophy }] : []),
    ...(user ? [{ href: '/achievements', label: 'Достижения', icon: Flame }] : []),
    ...(isTeacher ? [{ href: '/teacher', label: t.navTeacher, icon: User, accent: 'violet' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: t.navAdmin, icon: Shield, accent: 'rose' }] : [])
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_32%),radial-gradient(circle_at_top_right,#f5d0fe,transparent_28%)] dark:bg-slate-950 dark:bg-[radial-gradient(circle_at_top_left,#1e3a8a22,transparent_28%),radial-gradient(circle_at_top_right,#581c8722,transparent_24%)]">
      <header className="sticky top-0 z-50 border-b border-white/30 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-brand-600 dark:text-blue-300">
            <span className="rounded-2xl bg-brand-600 p-2 text-white"><GraduationCap size={20} /></span>
            <span className="hidden sm:block">OnlineTest LMS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  pathname.startsWith(link.href)
                    ? link.accent === 'violet'
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                      : link.accent === 'rose'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-blue-50 text-brand-600 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm dark:bg-slate-900">
                <Search size={16} className="text-slate-400" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-40 bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => setSearchOpen(false)}><X size={16} className="text-slate-400" /></button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                title={t.search}
              >
                <Search size={18} />
              </button>
            )}

            {/* Language selector - hidden on mobile */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="hidden sm:block rounded-full border-0 bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900 cursor-pointer"
            >
              {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>

            {/* Theme toggle - hidden on mobile */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:block rounded-full bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {/* Notifications - hidden on mobile (in bottom nav) */}
                <Link href="/notifications" className="hidden sm:block relative rounded-full bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Bell size={18} />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
                </Link>

                {/* Chat */}
                <Link href="/chat" className="hidden rounded-full bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 md:block">
                  <MessageCircle size={18} />
                </Link>

                {/* Profile */}
                <Link href="/profile" className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 md:flex">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate font-medium">{user.name}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title={t.logout}
                  className="hidden rounded-full bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 md:block"
                >
                  <LogOut size={18} className="text-rose-500" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm dark:bg-slate-900 sm:block">
                  {t.login}
                </Link>
                <Link href="/auth/register" className="hidden rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm sm:block">
                  {t.register}
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-900 lg:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/30 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <link.icon size={18} className="text-brand-600" />
                  {link.label}
                </Link>
              ))}
              {/* Language + Theme row in mobile menu */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="flex-1 rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-sm font-medium cursor-pointer focus:outline-none"
                >
                  {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Светлая' : 'Тёмная'}
                </button>
              </div>

              {user ? (
                <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link href="/profile" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                    <User size={18} className="text-brand-600" />{t.navProfile}
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                    <LogOut size={18} />{t.logout}
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                  <Link href="/auth/login" className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold dark:bg-slate-800">{t.login}</Link>
                  <Link href="/auth/register" className="flex-1 rounded-2xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white">{t.register}</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="pb-16 lg:pb-0">{children}</main>

      {/* Mobile bottom navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
          <div className="flex items-center justify-around px-2 py-2">
            {[
              { href: '/courses', icon: BookOpen, label: lang === 'ru' ? 'Курсы' : lang === 'kk' ? 'Курстар' : 'Courses' },
              { href: '/dashboard', icon: LayoutDashboard, label: lang === 'ru' ? 'Главная' : lang === 'kk' ? 'Басты' : 'Home' },
              { href: '/achievements', icon: Trophy, label: lang === 'ru' ? 'Награды' : lang === 'kk' ? 'Жетістік' : 'Awards' },
              { href: '/profile', icon: User, label: lang === 'ru' ? 'Профиль' : lang === 'kk' ? 'Профиль' : 'Profile' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
                  pathname.startsWith(item.href)
                    ? 'text-brand-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}>
                <item.icon size={20} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
                mobileOpen ? 'text-brand-600' : 'text-slate-400'
              }`}>
              <Menu size={20} />
              <span className="text-[10px] font-semibold">{lang === 'ru' ? 'Меню' : 'Menu'}</span>
            </button>
          </div>
        </nav>
      )}

      <AIAssistant />
      <footer className="mt-20 border-t border-slate-200/60 bg-white/50 py-10 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <div className="mb-4 flex justify-center gap-2">
            <span className="rounded-2xl bg-brand-600 p-2 text-white"><GraduationCap size={18} /></span>
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">OnlineTest LMS</p>
          <p className="mt-2">© {new Date().getFullYear()} — Modern university learning platform</p>
        </div>
      </footer>
    </div>
  );
}
