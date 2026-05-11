'use client';

import { useState } from 'react';
import { Award, Crown, Medal, Star, Trophy } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';

const LEADERS = [
  { rank: 1, name: 'Aruzhan Seitkali', gpa: 3.95, score: 98, completed: 5, avatar: 'A', streak: 28 },
  { rank: 2, name: 'Dias Kenzhebayev', gpa: 3.87, score: 95, completed: 5, avatar: 'D', streak: 21 },
  { rank: 3, name: 'Asel Nurmagambetova', gpa: 3.82, score: 92, completed: 4, avatar: 'A', streak: 14 },
  { rank: 4, name: 'Mikhail Ivanov', gpa: 3.78, score: 90, completed: 4, avatar: 'M', streak: 10 },
  { rank: 5, name: 'Zarina Bekova', gpa: 3.75, score: 88, completed: 4, avatar: 'Z', streak: 7 },
  { rank: 6, name: 'You', gpa: 3.72, score: 86, completed: 3, avatar: 'Y', streak: 5, isYou: true },
  { rank: 7, name: 'Nurlan Seilov', gpa: 3.68, score: 84, completed: 3, avatar: 'N', streak: 4 },
  { rank: 8, name: 'Mira Tashieva', gpa: 3.65, score: 82, completed: 3, avatar: 'M', streak: 3 },
  { rank: 9, name: 'Aigerim Jaksybekova', gpa: 3.60, score: 80, completed: 2, avatar: 'A', streak: 2 },
  { rank: 10, name: 'Rustam Maratov', gpa: 3.55, score: 78, completed: 2, avatar: 'R', streak: 1 }
];

const PODIUM_COLORS = {
  1: 'from-amber-400 to-amber-600',
  2: 'from-slate-300 to-slate-500',
  3: 'from-amber-600 to-amber-800'
};

const PERIOD_LABELS = { week: null, month: null, allTime: null };

export default function LeaderboardPage() {
  const { t } = useI18n();
  const [period, setPeriod] = useState('allTime');

  PERIOD_LABELS.week = t.week;
  PERIOD_LABELS.month = t.month;
  PERIOD_LABELS.allTime = t.allTime;

  const top3 = LEADERS.slice(0, 3);
  const rest = LEADERS.slice(3);

  return (
    <Shell>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{t.leaderboard}</h1>
            <p className="mt-1 text-slate-500">Top students this period</p>
          </div>
          <div className="flex rounded-2xl bg-white shadow-sm dark:bg-slate-900 p-1 gap-1">
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${period === key ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium — top 3 */}
        <div className="mb-8 flex items-end justify-center gap-4">
          {/* 2nd */}
          <div className="flex-1 max-w-[160px] text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-300 to-slate-500 text-2xl font-black text-white shadow-lg">
              {top3[1].avatar}
            </div>
            <p className="mt-2 text-sm font-bold">{top3[1].name}</p>
            <p className="text-xs text-slate-500">{top3[1].score}pts</p>
            <div className="mt-3 h-20 rounded-t-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <Medal size={28} className="text-slate-500" />
            </div>
          </div>

          {/* 1st */}
          <div className="flex-1 max-w-[180px] text-center">
            <Crown size={28} className="mx-auto mb-2 text-amber-500" />
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-3xl font-black text-white shadow-xl ring-4 ring-amber-200 dark:ring-amber-900">
              {top3[0].avatar}
            </div>
            <p className="mt-2 font-bold">{top3[0].name}</p>
            <p className="text-sm text-amber-600 font-semibold">{top3[0].score}pts</p>
            <div className="mt-3 h-28 rounded-t-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
              <Trophy size={36} className="text-amber-500" />
            </div>
          </div>

          {/* 3rd */}
          <div className="flex-1 max-w-[160px] text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-600 to-amber-800 text-2xl font-black text-white shadow-lg">
              {top3[2].avatar}
            </div>
            <p className="mt-2 text-sm font-bold">{top3[2].name}</p>
            <p className="text-xs text-slate-500">{top3[2].score}pts</p>
            <div className="mt-3 h-14 rounded-t-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 flex items-center justify-center">
              <Award size={24} className="text-amber-700" />
            </div>
          </div>
        </div>

        {/* Rest of leaderboard */}
        <div className="glass rounded-3xl p-4">
          <div className="space-y-2">
            {rest.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition ${entry.isYou ? 'bg-blue-50 ring-2 ring-brand-300 dark:bg-blue-950/30 dark:ring-blue-700' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <span className="w-8 text-center text-sm font-bold text-slate-500">#{entry.rank}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 font-black dark:from-slate-700 dark:to-slate-600">
                  {entry.avatar}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${entry.isYou ? 'text-brand-600' : ''}`}>
                    {entry.name}{entry.isYou && ' (You)'}
                  </p>
                  <p className="text-xs text-slate-500">GPA {entry.gpa} · {entry.completed} courses</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">{entry.score}</span>
                </div>
                <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
                  🔥 {entry.streak} {t.streakDays}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
