'use client';

import { CheckCircle2, FileText, Lock, PlayCircle, Upload } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { courses, lessons } from '../../../lib/data';

export default function CoursePlayerPage({ params }) {
  const { lang, t } = useI18n();
  const course = courses.find((item) => item.id === params.id) || courses[0];
  const content = course.translations[lang];
  const activeLesson = lessons.find((lesson) => lesson.status === 'progress') || lessons[0];

  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="glass rounded-3xl p-5">
          <h1 className="text-2xl font-black">{content.title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{content.teacher}</p>
          <div className="mt-5 space-y-3">
            {lessons.map((lesson) => (
              <button key={lesson.id} disabled={lesson.status === 'locked'} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900">
                {lesson.status === 'completed' && <CheckCircle2 className="text-emerald-500" />}
                {lesson.status === 'progress' && <PlayCircle className="text-blue-500" />}
                {lesson.status === 'locked' && <Lock className="text-slate-400" />}
                <div>
                  <p className="font-semibold">{lesson.title[lang]}</p>
                  <p className="text-xs text-slate-500">{lesson.status === 'completed' ? t.completed : lesson.status === 'progress' ? t.inProgress : t.locked}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl font-black">{t.lessonPlayer}: {activeLesson.title[lang]}</h2>
            <div className="mt-5 flex aspect-video items-center justify-center rounded-3xl bg-slate-950 text-white"><PlayCircle size={64} /></div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[t.video, 'PDF', 'Presentation'].map((item) => <div key={item} className="rounded-2xl bg-white p-4 dark:bg-slate-900"><FileText className="mb-3 text-brand-600" />{item}</div>)}
            </div>
            <div className="mt-6 rounded-2xl bg-white p-5 dark:bg-slate-900"><h3 className="font-bold">{t.material}</h3><p className="mt-2 text-slate-600 dark:text-slate-300">Structured text material with examples, downloads and lecturer notes.</p></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-3xl p-6"><Upload className="mb-4 text-brand-600" /><h3 className="text-xl font-bold">{t.homework}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Upload answer files and wait for teacher review.</p></div>
            <div className="glass rounded-3xl p-6"><h3 className="text-xl font-bold">{t.miniTest}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.timer}: 15:00 · {t.attempts}: 2 · multiple choice · auto-check.</p><button className="mt-5 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white">Start test</button></div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
