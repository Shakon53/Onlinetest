'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, BookOpen, Zap, Target, ChevronLeft, GraduationCap, Star } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { courses, getLessons } from '../../../lib/data';

export default function RoadmapPage({ params }) {
  const { courseId } = use(params);
  const { lang } = useI18n();
  const course = courses.find(c => c.id === courseId);
  const lessons = getLessons(courseId);
  const content = course?.translations?.[lang] || course?.translations?.ru;
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem(`progress_${courseId}`) || '{}');
    setProgress(p);
  }, [courseId]);

  function isUnlocked(lessonId) {
    if (lessonId === 1) return true;
    for (let i = 1; i < lessonId; i++) if (!progress[i]?.passed) return false;
    return true;
  }

  const completedCount = Object.values(progress).filter(p => p?.passed).length;
  const totalPct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const examResult = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(`exam_${courseId}`) || 'null') : null;

  if (!course) return <Shell><div className="p-10 text-center text-slate-400">Курс не найден</div></Shell>;

  return (
    <Shell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href={`/courses/${courseId}`} className="hover:text-brand-600 flex items-center gap-1">
            <ChevronLeft size={14} /> К урокам
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Карта прогресса</span>
        </div>

        {/* Course card */}
        <div className="glass rounded-3xl overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-brand-600 to-violet-700 p-6 text-white">
            <h1 className="text-2xl font-black mb-1">{content?.title}</h1>
            <p className="opacity-80 text-sm mb-4">{content?.teacher}</p>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-black">{totalPct}%</div>
                <div className="text-xs opacity-70">Завершено</div>
              </div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-white/20 mb-1">
                  <div className="h-3 rounded-full bg-white transition-all" style={{ width: `${totalPct}%` }} />
                </div>
                <div className="text-xs opacity-70">{completedCount} из {lessons.length} уроков</div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap tree */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-400 via-slate-200 to-slate-200 dark:via-slate-700 dark:to-slate-700" />

          <div className="space-y-4">
            {lessons.map((l, idx) => {
              const passed = progress[l.id]?.passed;
              const locked = !isUnlocked(l.id);
              const isCurrent = !passed && !locked;
              const score = progress[l.id]?.score;

              return (
                <div key={l.id} className="relative flex gap-4">
                  {/* Node */}
                  <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-md transition-all ${
                    passed ? 'bg-emerald-500 border-emerald-400 text-white'
                    : isCurrent ? 'bg-brand-600 border-brand-400 text-white animate-pulse'
                    : locked ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    {passed ? <CheckCircle2 size={22} />
                    : locked ? <Lock size={18} />
                    : <span className="text-xl font-black">{l.id}</span>}
                    <span className="text-xs mt-0.5 opacity-80">{passed && score ? `${score}%` : ''}</span>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 rounded-2xl p-4 transition-all ${
                    passed ? 'glass border border-emerald-200 dark:border-emerald-900'
                    : isCurrent ? 'glass border-2 border-brand-400 shadow-lg shadow-brand-200/30 dark:shadow-brand-900/20'
                    : locked ? 'bg-slate-50 dark:bg-slate-800/50 opacity-60'
                    : 'glass'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Урок {l.id}</p>
                        <p className="font-bold text-slate-900 dark:text-white">{l.title?.[lang] || l.title?.ru}</p>
                        <p className="text-xs text-slate-500 mt-1">{l.duration}</p>
                      </div>
                      {passed && (
                        <div className="flex items-center gap-1">
                          {[1,2,3].map(s => (
                            <Star key={s} size={14} fill={score >= s * 34 ? 'currentColor' : 'none'} className="text-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {passed ? (
                        <Link href={`/courses/${courseId}`} onClick={() => {}}
                          className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Пройдено
                        </Link>
                      ) : locked ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Lock size={12} /> Заблокировано
                        </span>
                      ) : (
                        <Link href={`/courses/${courseId}`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1">
                          {isCurrent ? '▶ Продолжить' : '→ Начать'}
                        </Link>
                      )}

                      <div className="ml-auto flex gap-1.5">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <BookOpen size={11} /> Теория
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Target size={11} /> Практика
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Zap size={11} /> Тест
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Final Exam node */}
            <div className="relative flex gap-4 mt-2">
              <div className="absolute left-0 -top-4 bottom-1/2 w-8 flex justify-center">
                <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-md ${
                examResult?.passed ? 'bg-amber-500 border-amber-400 text-white'
                : completedCount === lessons.length ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400 text-white'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                {examResult?.passed ? <CheckCircle2 size={22} />
                : completedCount === lessons.length ? <GraduationCap size={22} />
                : <Lock size={18} />}
              </div>
              <div className={`flex-1 rounded-2xl p-4 ${
                examResult?.passed ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800'
                : completedCount === lessons.length ? 'glass border-2 border-amber-400 shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800/50 opacity-60'
              }`}>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-0.5">Финал</p>
                <p className="font-bold text-slate-900 dark:text-white">Итоговый экзамен</p>
                <p className="text-xs text-slate-500 mt-1">25 вопросов · 60 минут · порог 70%</p>
                <div className="mt-3">
                  {examResult?.passed ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-amber-600 font-bold">✓ Сдан ({examResult.pct}%)</span>
                      <Link href={`/certificate/${courseId}`}
                        className="text-xs font-bold text-brand-600 hover:text-brand-500">Сертификат →</Link>
                    </div>
                  ) : completedCount === lessons.length ? (
                    <Link href={`/courses/${courseId}/exam`}
                      className="text-xs font-bold text-amber-600 hover:text-amber-500">
                      🎓 Начать экзамен →
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">Пройдите все уроки для доступа</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
