'use client';

import Link from 'next/link';
import { Lock, Star } from 'lucide-react';
import { useI18n } from './I18nProvider';

export function CourseCard({ course }) {
  const { lang, t } = useI18n();
  const content = course.translations[lang];

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
          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${course.progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span>{t.progress}: {course.progress}%</span>
          <span className={course.examAccess ? 'text-emerald-600' : 'text-rose-500'}>{course.examAccess ? t.allowed : t.denied}</span>
        </div>
      </div>
    </Link>
  );
}
