'use client';

import { useEffect, useState } from 'react';
import { Award, Crown, Medal, Star, Trophy } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';

export default function LeaderboardPage() {
  const { t } = useI18n();
  const [period, setPeriod] = useState('allTime');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lms_user') || 'null') : null;
    setUser(session);
  }, []);

  const periods = [{ key: 'week', label: t.week }, { key: 'month', label: t.month }, { key: 'allTime', label: t.allTime }];

  return (
    <Shell>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{t.leaderboard}</h1>
            <p className="mt-1 text-slate-500">{t.leaderboardDesc || 'Рейтинг студентов платформы'}</p>
          </div>
          <div className="flex rounded-2xl bg-white shadow-sm dark:bg-slate-900 p-1 gap-1">
            {periods.map(({ key, label }) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${period === key ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {user ? (
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-4 rounded-2xl bg-blue-50 ring-2 ring-brand-300 dark:bg-blue-950/30 dark:ring-blue-700 px-4 py-4">
              <span className="w-8 text-center text-sm font-bold text-brand-600">#1</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-lg font-black text-white">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-brand-600">{user.name} <span className="text-xs font-normal text-slate-500">(Вы)</span></p>
                <p className="text-xs text-slate-500">{user.email} · {user.role}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={16} fill="currentColor" />
                <span className="font-bold">—</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center py-8 text-center text-slate-400">
              <Trophy size={48} className="mb-3 opacity-20" />
              <p className="font-semibold">Рейтинг формируется по мере прохождения курсов</p>
              <p className="mt-1 text-sm">Завершайте уроки и тесты, чтобы набирать баллы</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl text-center">
            <Trophy size={48} className="mb-4 text-slate-300" />
            <p className="text-xl font-semibold text-slate-500">Войдите, чтобы увидеть рейтинг</p>
          </div>
        )}
      </section>
    </Shell>
  );
}
