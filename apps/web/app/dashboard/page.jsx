'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award, BarChart3, BookOpen, CheckCircle2, ChevronRight, Medal,
  Star, TrendingUp, Users, Shield, GraduationCap, PenLine,
  Flame, Trophy, Settings, UserCheck, FileText, LayoutDashboard
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { getSession } from '../../lib/api';
import { courses, getLessons } from '../../lib/data';

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const totalLessons = courses.reduce((s, c) => s + getLessons(c.id).length, 0);
  const LOCAL_DEMO = ['admin1@lms.kz','admin2@lms.kz','teacher1@lms.kz','teacher2@lms.kz'];
  const storedUsers = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('lms_registered_users') || '[]') : [];
  const totalUsers = LOCAL_DEMO.length + storedUsers.length;

  const stats = [
    { label: 'Всего пользователей', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Всего курсов', value: courses.length, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Уроков в системе', value: totalLessons, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Статус системы', value: 'Активна', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  ];

  const quickLinks = [
    { href: '/admin/users', icon: Users, label: 'Пользователи', desc: 'Управление аккаунтами', color: 'from-blue-500 to-blue-700' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Аналитика', desc: 'Статистика платформы', color: 'from-violet-500 to-violet-700' },
    { href: '/admin', icon: Settings, label: 'Панель администратора', desc: 'Настройки системы', color: 'from-rose-500 to-rose-700' },
    { href: '/courses', icon: BookOpen, label: 'Каталог курсов', desc: 'Просмотр всех курсов', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 py-5 sm:py-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30">
          <Shield className="text-rose-600" size={28} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Панель администратора</p>
          <h1 className="text-2xl sm:text-3xl font-black">Добро пожаловать, <span className="text-rose-600">{user.name}</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`glass rounded-3xl p-4 sm:p-5 ${s.bg}`}>
            <s.icon className={`mb-2 ${s.color}`} size={22} />
            <p className="text-xs sm:text-sm text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-black mb-4">Быстрый доступ</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href}
            className="glass card-hover rounded-3xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${l.color} flex items-center justify-center flex-shrink-0`}>
              <l.icon className="text-white" size={22} />
            </div>
            <div>
              <p className="font-bold text-sm">{l.label}</p>
              <p className="text-xs text-slate-500">{l.desc}</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-400" />
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-black mb-4">Курсы платформы</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(c => {
          const ct = c.translations?.ru;
          const lessonsCount = getLessons(c.id).length;
          return (
            <div key={c.id} className="glass rounded-3xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${c.image})` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{ct?.title}</p>
                  <p className="text-xs text-slate-500">{ct?.teacher}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{lessonsCount} уроков</span>
                <span className="flex items-center gap-1 text-amber-500"><Star size={12} fill="currentColor" />{c.rating}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── TEACHER DASHBOARD ─────────────────────────────────────────────────────────
function TeacherDashboard({ user }) {
  const myCourses = courses.filter(c => {
    const t = c.translations?.ru;
    const name = user.name?.toLowerCase() || '';
    return t?.teacher?.toLowerCase().includes(name.split(' ')[0]?.toLowerCase() || '');
  });
  const displayCourses = myCourses.length > 0 ? myCourses : courses.slice(0, 2);

  const quickLinks = [
    { href: '/teacher/create', icon: PenLine, label: 'Создать курс', desc: 'Новый курс или урок', color: 'from-violet-500 to-violet-700' },
    { href: '/teacher', icon: LayoutDashboard, label: 'Панель преподавателя', desc: 'Управление контентом', color: 'from-blue-500 to-blue-700' },
    { href: '/courses', icon: BookOpen, label: 'Все курсы', desc: 'Каталог курсов', color: 'from-amber-500 to-orange-600' },
    { href: '/leaderboard', icon: Trophy, label: 'Рейтинг', desc: 'Успехи студентов', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 py-5 sm:py-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <GraduationCap className="text-violet-600" size={28} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Панель преподавателя</p>
          <h1 className="text-2xl sm:text-3xl font-black">Добро пожаловать, <span className="text-violet-600">{user.name}</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6">
        {[
          { label: 'Всего курсов', value: courses.length, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
          { label: 'Мои курсы', value: displayCourses.length, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Уроков создано', value: courses.reduce((s, c) => s + getLessons(c.id).length, 0), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Роль', value: 'Teacher', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        ].map(s => (
          <div key={s.label} className={`glass rounded-3xl p-4 sm:p-5 ${s.bg}`}>
            <s.icon className={`mb-2 ${s.color}`} size={22} />
            <p className="text-xs sm:text-sm text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-black mb-4">Быстрый доступ</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href}
            className="glass card-hover rounded-3xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${l.color} flex items-center justify-center flex-shrink-0`}>
              <l.icon className="text-white" size={22} />
            </div>
            <div>
              <p className="font-bold text-sm">{l.label}</p>
              <p className="text-xs text-slate-500">{l.desc}</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-400" />
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-black mb-4">Курсы платформы</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(c => {
          const ct = c.translations?.ru;
          return (
            <div key={c.id} className="glass rounded-3xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-cover flex-shrink-0" style={{ backgroundImage: `url(${c.image})` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{ct?.title}</p>
                  <p className="text-xs text-slate-500 truncate">{ct?.teacher}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Link href={`/courses/${c.id}`} className="flex-1 text-center rounded-xl bg-brand-600 text-white text-xs font-semibold py-1.5 hover:bg-brand-500">Просмотр</Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── STUDENT DASHBOARD ─────────────────────────────────────────────────────────
function StudentDashboard({ user, lang, t }) {
  const [courseProgress, setCourseProgress] = useState({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const prog = {};
    courses.forEach(c => {
      const p = JSON.parse(localStorage.getItem(`progress_${c.id}`) || '{}');
      const lessons = getLessons(c.id);
      const passed = lessons.filter(l => p[l.id]?.passed).length;
      prog[c.id] = { passed, total: lessons.length, pct: lessons.length ? Math.round((passed / lessons.length) * 100) : 0 };
    });
    setCourseProgress(prog);
    setStreak(parseInt(localStorage.getItem('streak_count') || '0'));
  }, []);

  const totalPassed = Object.values(courseProgress).reduce((s, p) => s + p.passed, 0);
  const totalLessons = Object.values(courseProgress).reduce((s, p) => s + p.total, 0);
  const overallPct = totalLessons ? Math.round((totalPassed / totalLessons) * 100) : 0;
  const completedCourses = courses.filter(c => courseProgress[c.id]?.pct === 100).length;

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 py-5 sm:py-10">
      <div className="mb-5 sm:mb-8 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-slate-500 text-sm">{t.navDashboard}</p>
          <h1 className="text-xl sm:text-3xl font-black truncate">
            Привет, <span className="text-brand-600">{user.name?.split(' ')[0]}</span>! 👋
          </h1>
        </div>
        <Link href="/courses" className="flex-shrink-0 flex items-center gap-2 rounded-2xl bg-brand-600 px-3 sm:px-5 py-2 sm:py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-500">
          <BookOpen size={16} /><span className="hidden sm:inline">{t.navCourses}</span><span className="sm:hidden">Курсы</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6">
        {[
          { label: 'Пройдено уроков', value: `${totalPassed}/${totalLessons}`, icon: BookOpen, color: 'text-brand-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Общий прогресс', value: `${overallPct}%`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
          { label: 'Серия дней', value: `${streak} 🔥`, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { label: 'Курсов завершено', value: completedCourses, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        ].map(card => (
          <div key={card.label} className={`glass rounded-3xl p-4 sm:p-5 ${card.bg}`}>
            <card.icon className={`mb-2 ${card.color}`} size={22} />
            <p className="text-xs sm:text-sm text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl sm:text-3xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">{t.navCourses}</h2>
        <Link href="/courses" className="text-sm font-semibold text-brand-600 hover:underline">Все курсы →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(c => {
          const content = c.translations[lang] || c.translations.ru;
          const p = courseProgress[c.id] || { pct: 0, passed: 0, total: 0 };
          const examResult = typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem(`exam_${c.id}`) || 'null') : null;
          return (
            <Link key={c.id} href={`/courses/${c.id}`} className="glass card-hover rounded-3xl p-5 block">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="h-12 w-12 rounded-2xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${c.image})` }} />
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  examResult?.passed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                  : p.pct === 100 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                }`}>
                  {examResult?.passed ? '🎓 Сдан' : p.pct === 100 ? '📝 Экзамен' : t.denied}
                </span>
              </div>
              <h3 className="font-bold leading-snug text-sm">{content.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{content.teacher}</p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-500">{t.progress}</span>
                  <span className="font-bold">{p.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className={`h-2 rounded-full transition-all ${p.pct === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                    style={{ width: `${p.pct}%` }} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-amber-500"><Star size={12} fill="currentColor" />{c.rating}</span>
                <span className="text-xs font-semibold text-brand-600">{p.pct > 0 ? t.continue : 'Начать'} →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/auth/login'); return; }
    setUser(session);
  }, [router]);

  if (!user) return null;

  return (
    <Shell>
      {user.role === 'admin' && <AdminDashboard user={user} />}
      {user.role === 'teacher' && <TeacherDashboard user={user} />}
      {(user.role === 'student' || !user.role) && <StudentDashboard user={user} lang={lang} t={t} />}
    </Shell>
  );
}
