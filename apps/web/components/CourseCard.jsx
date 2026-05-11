'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n } from './I18nProvider';
import { getLessons } from '../lib/data';
import { getLS } from '../lib/storage';

export function CourseCard({ course }) {
  const { lang, t } = useI18n();
  const content = course.translations[lang];
  const [realProgress, setRealProgress] = useState(0);
  const [examPassed, setExamPassed] = useState(false);

  useEffect(() => {
    const lessons = getLessons(course.id);
    if (!lessons.length) return;
    const prog = getLS(`progress_${course.id}`, {});
    const passed = lessons.filter(l => prog[l.id]?.passed).length;
    setRealProgress(Math.round((passed / lessons.length) * 100));
    const exam = getLS(`exam_${course.id}`, null);
    setExamPassed(exam?.passed || false);
  }, [course.id]);

  return (
    <Link href={`/courses/${course.id}`} className="glass card-hover overflow-hidden rounded-3xl">
      <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-200">{course.category}</span>
          <span className="flex items-center gap-1 font-semibold text-amber-500"><Star size={16} fill="currentColor" />{course.rating}</span>
        </div>
        <h3 className="text-lg font-bold">{content.title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{content.description}</p>
        <p className="mt-3 text-sm font-medium text-slate-500">{content.teacher}</p>
        <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className={`h-2 rounded-full transition-all ${realProgress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} style={{ width: `${realProgress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span>{t.progress}: {realProgress}%</span>
          <span className={examPassed ? 'text-emerald-600' : realProgress === 100 ? 'text-amber-500' : 'text-rose-500'}>{examPassed ? '🎓 ' + t.allowed : realProgress === 100 ? '📝 Экзамен' : t.denied}</span>
        </div>
      </div>
    </Link>
  );
}
