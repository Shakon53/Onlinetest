'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Flame, BookOpen, Star, Zap, Award, Lock, CheckCircle2, Target, Brain } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { courses, getLessons } from '../../lib/data';

const ALL_ACHIEVEMENTS = [
  { id: 'first_lesson', icon: BookOpen, color: 'from-blue-400 to-blue-600', title: 'Первый урок', desc: 'Пройдите первый урок любого курса', xp: 10 },
  { id: 'first_course', icon: Star, color: 'from-amber-400 to-orange-500', title: 'Первый курс', desc: 'Завершите все уроки любого курса', xp: 100 },
  { id: 'streak_3', icon: Flame, color: 'from-orange-400 to-red-500', title: 'Серия 3 дня', desc: 'Заходите на платформу 3 дня подряд', xp: 30 },
  { id: 'streak_7', icon: Flame, color: 'from-red-400 to-rose-600', title: 'Серия 7 дней', desc: 'Заходите на платформу 7 дней подряд', xp: 70 },
  { id: 'streak_30', icon: Flame, color: 'from-rose-500 to-purple-600', title: 'Серия 30 дней', desc: '30 дней подряд — настоящий чемпион!', xp: 300 },
  { id: 'perfect_quiz', icon: Zap, color: 'from-yellow-400 to-amber-500', title: 'Идеальный тест', desc: 'Сдайте тест урока на 100%', xp: 50 },
  { id: 'exam_database-systems', icon: Award, color: 'from-violet-400 to-violet-600', title: 'Эксперт БД', desc: 'Сдайте экзамен по курсу "Базы данных"', xp: 200 },
  { id: 'exam_hcia-datacom', icon: Award, color: 'from-sky-400 to-blue-600', title: 'Сетевой инженер', desc: 'Сдайте экзамен HCIA Datacom', xp: 200 },
  { id: 'exam_java-programming', icon: Award, color: 'from-emerald-400 to-teal-600', title: 'Java Developer', desc: 'Сдайте экзамен по Java', xp: 200 },
  { id: 'exam_industrial-practice', icon: Award, color: 'from-amber-400 to-yellow-500', title: 'Практик', desc: 'Сдайте экзамен по производственной практике', xp: 200 },
  { id: 'exam_big-data-processing', icon: Award, color: 'from-pink-400 to-rose-600', title: 'Big Data Expert', desc: 'Сдайте экзамен по большим данным', xp: 200 },
  { id: 'exam_big-data-forecasting', icon: Award, color: 'from-purple-400 to-indigo-600', title: 'Data Scientist', desc: 'Сдайте экзамен по прогнозированию', xp: 200 },
  { id: 'all_courses', icon: Trophy, color: 'from-amber-400 to-orange-600', title: 'Мастер всех курсов', desc: 'Сдайте экзамены по всем 6 курсам', xp: 1000 },
  { id: 'speed_demon', icon: Zap, color: 'from-cyan-400 to-blue-500', title: 'Быстрый разум', desc: 'Сдайте тест менее чем за 5 минут', xp: 75 },
  { id: 'night_owl', icon: Brain, color: 'from-indigo-400 to-violet-600', title: 'Ночная сова', desc: 'Пройдите урок после полуночи', xp: 25 },
  { id: 'notes_taker', icon: BookOpen, color: 'from-teal-400 to-green-500', title: 'Конспектор', desc: 'Сохраните заметки к 5 урокам', xp: 30 },
  { id: 'score_90', icon: Target, color: 'from-green-400 to-emerald-600', title: 'Отличник', desc: 'Наберите 90%+ на любом экзамене', xp: 150 },
  { id: 'all_lessons_1', icon: CheckCircle2, color: 'from-blue-400 to-cyan-500', title: 'Курс завершён: БД', desc: 'Пройдите все 12 уроков курса БД', xp: 120 },
];

function computeAchievements() {
  if (typeof window === 'undefined') return { earned: [], streak: 0, totalXp: 0 };

  const earned = new Set(JSON.parse(localStorage.getItem('achievements') || '[]'));
  const streak = parseInt(localStorage.getItem('streak_count') || '0');

  // Auto-compute from localStorage data
  // First lesson
  const anyProg = courses.some(c => {
    const p = JSON.parse(localStorage.getItem(`progress_${c.id}`) || '{}');
    return Object.values(p).some(v => v?.passed);
  });
  if (anyProg) earned.add('first_lesson');

  // Streak
  if (streak >= 3) earned.add('streak_3');
  if (streak >= 7) earned.add('streak_7');
  if (streak >= 30) earned.add('streak_30');

  // First course completed
  const anyCompleted = courses.some(c => {
    const p = JSON.parse(localStorage.getItem(`progress_${c.id}`) || '{}');
    const lessons = getLessons(c.id);
    return lessons.every(l => p[l.id]?.passed);
  });
  if (anyCompleted) earned.add('first_course');

  // Per-course lessons completed
  const dbProg = JSON.parse(localStorage.getItem('progress_database-systems') || '{}');
  if (getLessons('database-systems').every(l => dbProg[l.id]?.passed)) earned.add('all_lessons_1');

  // All courses exams
  const allExamsPassed = courses.every(c => {
    const r = JSON.parse(localStorage.getItem(`exam_${c.id}`) || 'null');
    return r?.passed;
  });
  if (allExamsPassed) earned.add('all_courses');

  // Score 90+ on any exam
  const any90 = courses.some(c => {
    const r = JSON.parse(localStorage.getItem(`exam_${c.id}`) || 'null');
    return r?.passed && r?.pct >= 90;
  });
  if (any90) earned.add('score_90');

  // Notes - check note count
  let noteCount = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('note_') && localStorage.getItem(k)?.trim()) noteCount++;
  }
  if (noteCount >= 5) earned.add('notes_taker');

  const earnedArr = [...earned];
  localStorage.setItem('achievements', JSON.stringify(earnedArr));

  const totalXp = ALL_ACHIEVEMENTS
    .filter(a => earnedArr.includes(a.id))
    .reduce((sum, a) => sum + a.xp, 0);

  return { earned: earnedArr, streak, totalXp };
}

export default function AchievementsPage() {
  const [earned, setEarned] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    const { earned: e, streak: s, totalXp: xp } = computeAchievements();
    setEarned(e);
    setStreak(s);
    setTotalXp(xp);
  }, []);

  const maxXp = ALL_ACHIEVEMENTS.reduce((s, a) => s + a.xp, 0);
  const pct = Math.round((totalXp / maxXp) * 100);

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="glass rounded-3xl overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-white/20">
                <Trophy size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black">Достижения</h1>
                <p className="opacity-80">Ваш прогресс и награды</p>
              </div>
              <div className="ml-auto text-right">
                <div className="flex items-center gap-2 text-3xl font-black">
                  <Flame size={28} className="text-orange-200" />
                  {streak}
                </div>
                <p className="text-xs opacity-70">дней подряд</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black">{earned.length}</div>
                <div className="text-xs opacity-70">Получено</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black">{ALL_ACHIEVEMENTS.length - earned.length}</div>
                <div className="text-xs opacity-70">Осталось</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black">{totalXp}</div>
                <div className="text-xs opacity-70">XP очков</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 opacity-80">
                <span>Общий прогресс XP</span>
                <span>{totalXp} / {maxXp} XP ({pct}%)</span>
              </div>
              <div className="h-3 rounded-full bg-white/20">
                <div className="h-3 rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_ACHIEVEMENTS.map(a => {
            const isEarned = earned.includes(a.id);
            const Icon = a.icon;
            return (
              <div key={a.id}
                className={`rounded-3xl p-5 transition-all ${isEarned ? 'glass shadow-lg' : 'bg-slate-100 dark:bg-slate-800/50 opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${isEarned ? `bg-gradient-to-br ${a.color} shadow-md` : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {isEarned
                      ? <Icon className="text-white" size={22} />
                      : <Lock className="text-slate-400" size={20} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</p>
                      {isEarned && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                    <div className={`mt-2 inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${isEarned ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      ⚡ {a.xp} XP
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Course progress section */}
        <div className="mt-8">
          <h2 className="text-xl font-black mb-4">Прогресс по курсам</h2>
          <div className="space-y-3">
            {courses.map(c => {
              const prog = typeof window !== 'undefined'
                ? JSON.parse(localStorage.getItem(`progress_${c.id}`) || '{}') : {};
              const lessons = getLessons(c.id);
              const passed = lessons.filter(l => prog[l.id]?.passed).length;
              const pct = lessons.length ? Math.round((passed / lessons.length) * 100) : 0;
              const examResult = typeof window !== 'undefined'
                ? JSON.parse(localStorage.getItem(`exam_${c.id}`) || 'null') : null;
              const ct = c.translations?.ru;
              return (
                <div key={c.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{ct?.title}</p>
                      <p className="text-xs text-slate-500">{passed}/{lessons.length} уроков</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {examResult?.passed && (
                        <Link href={`/certificate/${c.id}`}
                          className="text-xs font-bold text-amber-600 flex items-center gap-1 hover:text-amber-500">
                          <Award size={12} /> Сертификат
                        </Link>
                      )}
                      {passed === lessons.length && !examResult && (
                        <Link href={`/courses/${c.id}/exam`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-500">Экзамен →</Link>
                      )}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
