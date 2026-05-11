'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, BarChart3, BookOpen, CheckCircle2, ChevronRight, Medal, Star, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { apiRequest, getSession } from '../../lib/api';
import { courses } from '../../lib/data';

const CHART_DATA = [
  { week: 'W1', score: 62 },
  { week: 'W2', score: 70 },
  { week: 'W3', score: 74 },
  { week: 'W4', score: 83 },
  { week: 'W5', score: 88 }
];

const LEADERBOARD_STATIC = [
  { name: 'Aruzhan S.', score: 98 },
  { name: 'Dias K.', score: 95 },
  { name: 'You', score: 88, isYou: true },
  { name: 'Mira T.', score: 84 }
];

export default function DashboardPage() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/auth/login'); return; }
    setUser(session);
    apiRequest('/dashboard/student').then(setDashData).catch(() => {});
  }, [router]);

  if (!user) return null;

  const currentScore = dashData?.currentScore ?? 88;
  const gpa = dashData?.gpa ?? 3.72;

  const statCards = [
    { label: t.currentScore, value: `${currentScore}/100`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: t.rating, value: '#12', icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: t.gpa, value: gpa.toFixed(2), icon: Award, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: t.examAccess, value: currentScore >= 60 ? t.allowed : t.denied, icon: CheckCircle2, color: currentScore >= 60 ? 'text-emerald-600' : 'text-rose-600', bg: currentScore >= 60 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30' }
  ];

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-slate-500">{t.navDashboard}</p>
            <h1 className="text-3xl font-black">
              Welcome back, <span className="text-brand-600">{user.name?.split(' ')[0]}</span>! 👋
            </h1>
          </div>
          <Link href="/courses" className="flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-brand-500">
            <BookOpen size={18} />{t.navCourses}
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className={`glass rounded-3xl p-5 ${card.bg}`}>
              <div className={`mb-3 ${card.color}`}><card.icon size={22} /></div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`mt-1 text-3xl font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Progress chart */}
          <div className="glass rounded-3xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-brand-600" size={20} />
                <h2 className="text-xl font-bold">{t.weeklyProgress}</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/30">
                +{88 - 62}pts this month
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2f7df6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2f7df6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#2f7df6" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill: '#2f7df6', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini leaderboard */}
          <div className="glass rounded-3xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t.leaderboard}</h2>
              <Link href="/leaderboard" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {LEADERBOARD_STATIC.map((entry, i) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${entry.isYou ? 'bg-brand-50 ring-2 ring-brand-200 dark:bg-brand-950/30 dark:ring-brand-800' : 'bg-white dark:bg-slate-900'}`}
                >
                  <span className={`text-sm font-black ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>#{i + 1}</span>
                  <span className={`flex-1 text-sm font-semibold ${entry.isYou ? 'text-brand-600' : ''}`}>{entry.name}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                    <Star size={12} fill="currentColor" />{entry.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My courses */}
        <div className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">{t.navCourses}</h2>
            <Link href="/courses" className="text-sm font-semibold text-brand-600 hover:underline">{t.navCourses} →</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const content = course.translations[lang] || course.translations.en;
              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="glass card-hover rounded-3xl p-5 block">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${course.image})` }} />
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${course.examAccess ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'}`}>
                      {course.examAccess ? t.allowed : t.denied}
                    </span>
                  </div>
                  <h3 className="font-bold leading-snug">{content.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{content.teacher}</p>

                  {/* Progress circle-like bar */}
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-500">{t.progress}</span>
                      <span className="font-bold">{course.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-2 rounded-full transition-all ${course.progress >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={12} fill="currentColor" />{course.rating}
                    </span>
                    <span className="text-xs font-semibold text-brand-600">{t.continue} →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Shell>
  );
}
