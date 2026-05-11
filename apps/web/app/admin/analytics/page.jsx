'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Award, BookOpen, GraduationCap, Shield, TrendingUp, UserCheck, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '../../../components/Shell';
import { getSession, apiRequest } from '../../../lib/api';
import { courses, getLessons } from '../../../lib/data';

function buildRealData() {
  if (typeof window === 'undefined') return null;
  const registered = JSON.parse(localStorage.getItem('lms_registered_users') || '[]');
  const allUsers = [
    { role: 'admin', email: 'admin1@lms.kz', name: 'Администратор 1', createdAt: '2025-01-01' },
    { role: 'admin', email: 'admin2@lms.kz', name: 'Администратор 2', createdAt: '2025-01-01' },
    { role: 'teacher', email: 'teacher1@lms.kz', name: 'Преподаватель 1', createdAt: '2025-01-01' },
    { role: 'teacher', email: 'teacher2@lms.kz', name: 'Преподаватель 2', createdAt: '2025-01-01' },
    ...registered
  ];

  const students = allUsers.filter(u => u.role === 'student').length;
  const teachers = allUsers.filter(u => u.role === 'teacher').length;
  const admins = allUsers.filter(u => u.role === 'admin').length;
  const totalLessons = courses.reduce((s, c) => s + getLessons(c.id).length, 0);

  // Certificates and lessons passed
  let certs = 0, lessonsPassed = 0;
  const coursePassMap = {};
  courses.forEach(c => { coursePassMap[c.id] = { passed: 0, total: getLessons(c.id).length }; });

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.includes('::exam_')) {
      try { const v = JSON.parse(localStorage.getItem(key)); if (v?.passed) certs++; } catch {}
    }
    if (key.includes('::progress_')) {
      try {
        const prog = JSON.parse(localStorage.getItem(key));
        const courseId = key.split('::progress_')[1];
        const passed = Object.values(prog).filter(p => p?.passed).length;
        lessonsPassed += passed;
        if (coursePassMap[courseId]) coursePassMap[courseId].passed += passed;
      } catch {}
    }
  }

  // Build completion rate per course
  const completionData = courses.map(c => {
    const map = coursePassMap[c.id];
    const totalPossible = map.total * Math.max(1, students);
    const pct = totalPossible > 0 ? Math.min(100, Math.round((map.passed / totalPossible) * 100)) : 0;
    return { name: (c.translations?.ru?.title || c.id).slice(0, 18), rate: pct };
  });

  // Build enrollment trend from registration dates
  const monthMap = {};
  allUsers.forEach(u => {
    if (!u.createdAt) return;
    const m = u.createdAt.slice(0, 7); // YYYY-MM
    monthMap[m] = (monthMap[m] || 0) + 1;
  });
  const months = Object.keys(monthMap).sort();
  let cumulative = 0;
  const enrollmentData = months.map(m => {
    cumulative += monthMap[m];
    return { month: m.slice(5, 7) + '/' + m.slice(2, 4), users: cumulative };
  });

  // Recent registrations
  const recentUsers = [...allUsers]
    .filter(u => u.createdAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const rolePie = [
    { name: 'Студенты', value: students || 0, color: '#2f7df6' },
    { name: 'Преподаватели', value: teachers, color: '#7c3aed' },
    { name: 'Администраторы', value: admins, color: '#e11d48' },
  ].filter(r => r.value > 0);

  return {
    totalUsers: allUsers.length, students, teachers, admins,
    totalCourses: courses.length, totalLessons, certs, lessonsPassed,
    completionData, enrollmentData, rolePie, recentUsers
  };
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'admin') { router.replace('/auth/login'); return; }
    setReady(true);
    // Try backend first, fall back to localStorage
    apiRequest('/admin/users')
      .then((res) => {
        if (res.users?.length) {
          const base = buildRealData() || {};
          const students = res.users.filter(u => u.role === 'student').length;
          const teachers = res.users.filter(u => u.role === 'teacher').length;
          const admins   = res.users.filter(u => u.role === 'admin').length;
          const totalLessons = courses.reduce((s, c) => s + getLessons(c.id).length, 0);
          const recentUsers = [...res.users].sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,6);
          const rolePie = [
            { name: 'Студенты', value: students, color: '#2f7df6' },
            { name: 'Преподаватели', value: teachers, color: '#7c3aed' },
            { name: 'Администраторы', value: admins, color: '#e11d48' },
          ].filter(r => r.value > 0);
          setData({ ...base, totalUsers: res.users.length, students, teachers, admins, totalLessons, rolePie, recentUsers });
        } else {
          setData(buildRealData());
        }
      })
      .catch(() => setData(buildRealData()));
  }, [router]);

  if (!ready || !data) return null;

  const { totalUsers, totalCourses, totalLessons, certs, lessonsPassed,
    completionData, enrollmentData, rolePie, recentUsers, students, teachers, admins } = data;

  const avgCompletion = completionData.length
    ? Math.round(completionData.reduce((s, c) => s + c.rate, 0) / completionData.length) : 0;

  const cards = [
    { label: 'Всего пользователей', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'from-blue-500 to-blue-700' },
    { label: 'Курсов / Уроков', value: `${totalCourses} / ${totalLessons}`, icon: BookOpen, color: 'text-violet-600', bg: 'from-violet-500 to-violet-700' },
    { label: 'Сертификатов выдано', value: certs, icon: Award, color: 'text-emerald-600', bg: 'from-emerald-500 to-emerald-700' },
    { label: 'Ср. завершение', value: `${avgCompletion}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'from-amber-500 to-amber-700' },
  ];

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin" className="rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-slate-50">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">Аналитика платформы</h1>
            <p className="text-slate-500">Live platform statistics</p>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="glass rounded-3xl p-5">
              <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${card.bg} p-3 text-white`}>
                <card.icon size={20} />
              </div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`mt-1 text-4xl font-black ${card.color}`}>{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrollment trend - real data */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-1 text-xl font-bold">Регистрации пользователей</h2>
            <p className="mb-4 text-xs text-slate-400">Суммарно по дате регистрации</p>
            {enrollmentData.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={enrollmentData}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2f7df6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2f7df6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#2f7df6" fill="url(#blueGrad)" strokeWidth={2} name="Пользователей" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-sm">
                Недостаточно данных для графика
              </div>
            )}
          </div>

          {/* Completion rates - real data */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-1 text-xl font-bold">% Завершения по курсам</h2>
            <p className="mb-4 text-xs text-slate-400">Доля пройденных уроков студентами</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={completionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" radius={[0, 8, 8, 0]} name="% завершения">
                  {completionData.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 70 ? '#10b981' : entry.rate >= 30 ? '#2f7df6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Role distribution - real data */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 text-xl font-bold">Распределение ролей</h2>
            {rolePie.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={rolePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {rolePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {rolePie.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="ml-auto text-sm font-black">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400">Всего: {totalUsers} пользователей</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Нет зарегистрированных пользователей</p>
            )}
          </div>

          {/* Recent registrations - real data */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 text-xl font-bold">Последние регистрации</h2>
            {recentUsers.length > 0 ? (
              <div className="space-y-2">
                {recentUsers.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      u.role === 'admin' ? 'bg-rose-600' : u.role === 'teacher' ? 'bg-violet-600' : 'bg-blue-600'
                    }`}>
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name || u.email}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40' :
                      u.role === 'teacher' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-950/40'
                    }`}>{u.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Нет зарегистрированных пользователей</p>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
