'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { CourseCard } from '../../components/CourseCard';
import { useI18n } from '../../components/I18nProvider';
import { courses } from '../../lib/data';

const CATEGORIES = ['IT', 'Programming', 'Data', 'Network', 'AI', 'Practice'];

function CoursesContent() {
  const { t, lang } = useI18n();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('rating');

  const filtered = useMemo(() => {
    let list = [...courses];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => {
        const tr = c.translations[lang] || c.translations.en;
        return (
          tr.title.toLowerCase().includes(q) ||
          tr.description.toLowerCase().includes(q) ||
          tr.teacher.toLowerCase().includes(q)
        );
      });
    }

    if (category !== 'all') {
      list = list.filter((c) => c.category === category);
    }

    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'progress') list.sort((a, b) => b.progress - a.progress);

    return list;
  }, [query, category, sort, lang]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-2">
        <h1 className="text-4xl font-black text-slate-950 dark:text-white">{t.navCourses}</h1>
        <p className="mt-2 text-slate-500">{filtered.length} {t.courses.toLowerCase()}</p>
      </div>

      {/* Search + sort */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-10 text-sm shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
            <SlidersHorizontal size={15} className="text-slate-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border-0 bg-transparent text-sm font-medium focus:outline-none cursor-pointer">
              <option value="rating">{t.sortRating}</option>
              <option value="progress">{t.sortProgress}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === 'all' ? 'bg-brand-600 text-white shadow-md' : 'bg-white shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          {t.allCategories}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === c ? 'bg-brand-600 text-white shadow-md' : 'bg-white shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-20 text-center">
          <Search size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 text-xl font-semibold text-slate-500">{t.noResults}</p>
          <button
            onClick={() => { setQuery(''); setCategory('all'); }}
            className="mt-4 text-sm font-semibold text-brand-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      )}
    </section>
  );
}

export default function CoursesPage() {
  return (
    <Shell>
      <Suspense fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      }>
        <CoursesContent />
      </Suspense>
    </Shell>
  );
}
