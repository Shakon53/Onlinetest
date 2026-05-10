'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles, Trophy, Users } from 'lucide-react';
import { Shell } from '../components/Shell';
import { CourseCard } from '../components/CourseCard';
import { useI18n } from '../components/I18nProvider';
import { courses } from '../lib/data';

export default function HomePage() {
  const { t } = useI18n();
  const categories = ['Programming', 'Data', 'Network', 'AI', 'Practice'];

  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><Sparkles size={16} />AI-powered LMS</div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">{t.heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{t.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-500">{t.startLearning}</Link>
            <Link href="/auth/login" className="rounded-full bg-white px-6 py-3 font-semibold shadow-sm dark:bg-slate-900">{t.login}</Link>
            <Link href="/auth/register" className="rounded-full border border-slate-200 px-6 py-3 font-semibold dark:border-slate-700">{t.register}</Link>
          </div>
        </div>
        <div className="glass rounded-[2rem] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[t.students, t.courses, t.certificates, t.completion].map((label, index) => (
              <div key={label} className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black">{['12.8K', '96', '4.2K', '87%'][index]}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white">
            <Trophy className="mb-4" />
            <p className="text-xl font-bold">Smart progress tracking</p>
            <p className="mt-2 text-white/80">Sequential lessons, attempts, GPA and certificate verification.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-2xl font-black">{t.categories}</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {categories.map((category) => <span key={category} className="rounded-full bg-white px-5 py-3 font-semibold shadow-sm dark:bg-slate-900">{category}</span>)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">{t.popularCourses}</h2>
          <Link href="/courses" className="flex items-center gap-2 font-semibold text-brand-600">{t.navCourses}<ArrowRight size={18} /></Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-black">{t.testimonials}</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {['Aruzhan', 'Mikhail', 'Dana'].map((name) => <div key={name} className="glass rounded-3xl p-6"><Users className="mb-4 text-brand-600" /><p className="font-semibold">{name}</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The platform feels clean, fast and helps me understand my progress before exams.</p></div>)}
        </div>
      </section>
    </Shell>
  );
}
