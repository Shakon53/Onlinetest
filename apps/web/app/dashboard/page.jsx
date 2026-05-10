'use client';

import { Award, BarChart3, CheckCircle2, Medal, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { courses } from '../../lib/data';

const chartData = [
  { week: 'W1', score: 62 },
  { week: 'W2', score: 70 },
  { week: 'W3', score: 74 },
  { week: 'W4', score: 83 },
  { week: 'W5', score: 88 }
];

export default function DashboardPage() {
  const { lang, t } = useI18n();
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-4xl font-black">{t.navDashboard}</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[{ label: t.currentScore, value: '88/100', icon: TrendingUp }, { label: t.rating, value: '#12', icon: Medal }, { label: t.gpa, value: '3.72', icon: Award }, { label: t.examAccess, value: t.allowed, icon: CheckCircle2 }].map((item) => <div key={item.label} className="glass rounded-3xl p-6"><item.icon className="mb-4 text-brand-600" /><p className="text-sm text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-black">{item.value}</p></div>)}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div className="glass rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-2"><BarChart3 className="text-brand-600" /><h2 className="text-xl font-bold">{t.progress}</h2></div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><XAxis dataKey="week" /><Tooltip /><Area type="monotone" dataKey="score" stroke="#2f7df6" fill="#bfdbfe" /></AreaChart></ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="text-xl font-bold">{t.leaderboard}</h2>
            {['Aruzhan S.', 'Dias K.', 'You', 'Mira T.'].map((name, index) => <div key={name} className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-slate-900"><span>{index + 1}. {name}</span><span className="font-bold">{96 - index * 4}</span></div>)}
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const content = course.translations[lang];
            return <div key={course.id} className="glass rounded-3xl p-5"><h3 className="font-bold">{content.title}</h3><p className="mt-2 text-sm text-slate-500">{t.rating}: {course.rating}</p><div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" style={{ width: `${course.progress}%` }} /></div><div className="mt-3 flex justify-between text-sm"><span>{course.progress}%</span><span className={course.examAccess ? 'text-emerald-600' : 'text-rose-500'}>{course.examAccess ? t.allowed : t.denied}</span></div></div>;
          })}
        </div>
      </section>
    </Shell>
  );
}
