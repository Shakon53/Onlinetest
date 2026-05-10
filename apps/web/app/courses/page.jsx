'use client';

import { Shell } from '../../components/Shell';
import { CourseCard } from '../../components/CourseCard';
import { useI18n } from '../../components/I18nProvider';
import { courses } from '../../lib/data';

export default function CoursesPage() {
  const { t } = useI18n();
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-black">{t.navCourses}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">AI recommendations, filters and strict learning paths.</p>
          </div>
          <input className="rounded-2xl border-0 bg-white px-5 py-3 shadow-sm dark:bg-slate-900" placeholder={t.search} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>
    </Shell>
  );
}
