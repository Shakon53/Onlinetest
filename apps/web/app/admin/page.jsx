'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity, Award, Ban, BarChart3, BookOpen, ChevronRight,
  GraduationCap, Shield, TrendingUp, UserCheck, Users
} from 'lucide-react';
import { Shell } from '../../components/Shell';
import { getSession, apiRequest } from '../../lib/api';
import { courses, getLessons } from '../../lib/data';

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({ users: 0, courses: 0, lessons: 0, certs: 0, lessonsPassed: 0, students: 0, teachers: 0, admins: 2 });

  useEffect(() => {
    const user = getSession();
    if (!user) { router.replace('/auth/login'); return; }
    if (user.role !== 'admin') { router.replace('/dashboard'); return; }
    setReady(true);
    const totalLessons = courses.reduce((s, c) => s + getLessons(c.id).length, 0);
    // Fetch real user stats from backend
    apiRequest('/admin/users')
      .then((data) => {
        const allUsers = data.users || [];
        const students = allUsers.filter(u => u.role === 'student').length;
        const teachers = allUsers.filter(u => u.role === 'teacher').length;
        const admins   = allUsers.filter(u => u.role === 'admin').length;
        setStats(prev => ({ ...prev, users: allUsers.length, students, teachers, admins, courses: courses.length, lessons: totalLessons }));
      })
      .catch(() => {
        setStats(prev => ({ ...prev, courses: courses.length, lessons: totalLessons }));
      });
  }, [router]);

  if (!ready) return null;

  const quickStats = [
    { label: 'Всего пользователей', value: stats.users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', sub: `${stats.students} студ. · ${stats.teachers} преп. · ${stats.admins} адм.` },
    { label: 'Курсов в системе', value: stats.courses, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30', sub: `${stats.lessons} уроков всего` },
    { label: 'Сертификатов выдано', value: stats.certs, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', sub: 'экзаменов успешно сдано' },
    { label: 'Уроков пройдено', value: stats.lessonsPassed, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', sub: 'суммарно по всем студентам' },
  ];

  const panels = [
    { href: '/admin/users', icon: Users, label: 'Управление пользователями', desc: `${stats.users} пользователей — просмотр, блокировка, управление ролями.`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Аналитика платформы', desc: 'Тренды регистраций, процент завершения, распределение ролей.', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { href: '/courses', icon: BookOpen, label: 'Все курсы', desc: `${stats.courses} курсов · ${stats.lessons} уроков — просмотр контента.`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { href: '/admin/users', icon: Ban, label: 'Блокировка пользователей', desc: 'Ограничение доступа для нарушителей правил платформы.', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
    { href: '/leaderboard', icon: TrendingUp, label: 'Рейтинг студентов', desc: 'Топ студентов по очкам, курсам и результатам экзаменов.', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { href: '/admin/analytics', icon: Activity, label: 'Активность системы', desc: 'Просмотр активности пользователей и событий платформы.', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
  ];

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl bg-rose-600 p-3 text-white shadow-lg">
            <Shield size={26} />
          </div>
          <div>
            <h1 className="text-4xl font-black">Панель администратора</h1>
            <p className="text-slate-500">Полный контроль платформы</p>
          </div>
        </div>

        {/* Real stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((s) => (
            <div key={s.label} className={`glass rounded-3xl p-5 ${s.bg}`}>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <p className={`mt-2 text-4xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Role distribution */}
        <div className="mb-8 glass rounded-3xl p-6">
          <h2 className="mb-4 text-lg font-bold">Распределение по ролям</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 p-4 flex items-center gap-4">
              <div className="rounded-xl bg-rose-100 dark:bg-rose-900/40 p-3"><Shield className="text-rose-600" size={22} /></div>
              <div><p className="text-3xl font-black text-rose-600">{stats.admins}</p><p className="text-sm text-slate-500">Администраторов</p></div>
            </div>
            <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 p-4 flex items-center gap-4">
              <div className="rounded-xl bg-violet-100 dark:bg-violet-900/40 p-3"><GraduationCap className="text-violet-600" size={22} /></div>
              <div><p className="text-3xl font-black text-violet-600">{stats.teachers}</p><p className="text-sm text-slate-500">Преподавателей</p></div>
            </div>
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-4 flex items-center gap-4">
              <div className="rounded-xl bg-blue-100 dark:bg-blue-900/40 p-3"><UserCheck className="text-blue-600" size={22} /></div>
              <div><p className="text-3xl font-black text-blue-600">{stats.students}</p><p className="text-sm text-slate-500">Студентов</p></div>
            </div>
          </div>
        </div>

        {/* Action panels */}
        <h2 className="mb-4 text-xl font-bold">Быстрые действия</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {panels.map((item) => (
            <Link key={item.href + item.label} href={item.href} className="glass card-hover rounded-3xl p-6 block group">
              <div className={`mb-4 inline-flex rounded-2xl p-3 ${item.bg}`}>
                <item.icon className={item.color} size={22} />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold">{item.label}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
                <ChevronRight className="mt-1 flex-shrink-0 text-slate-400 transition-colors group-hover:text-brand-600" size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
