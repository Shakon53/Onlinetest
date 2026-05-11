'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, CheckCircle2, FileText, GripVertical, Plus, Sparkles, Upload, Users } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { getSession, apiRequest } from '../../lib/api';
import { courses } from '../../lib/data';

const LESSON_BLOCKS = ['Video lecture', 'Text material', 'PDF attachment', 'Mini test', 'Homework'];

const STUDENT_STATS = [
  { name: 'Aruzhan S.', course: 'Databases', progress: 92, score: 98 },
  { name: 'Dias K.', course: 'Databases', progress: 85, score: 91 },
  { name: 'Zarina B.', course: 'Java', progress: 70, score: 84 },
  { name: 'Nurlan S.', course: 'Java', progress: 60, score: 75 }
];

export default function TeacherPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    const user = getSession();
    if (!user) { router.replace('/auth/login'); return; }
    if (user.role !== 'teacher' && user.role !== 'admin') { router.replace('/dashboard'); return; }
    setReady(true);
  }, [router]);

  async function generateAiTest() {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      const data = await apiRequest('/ai/generate-test', { method: 'POST', body: JSON.stringify({ topic: aiTopic, count: 3 }) });
      setAiResult(data.questions);
    } catch {
      setAiResult([{ text: { ru: `AI вопрос по теме: ${aiTopic}`, en: `AI question on topic: ${aiTopic}`, kk: `AI сұрақ тақырыбы: ${aiTopic}` }, options: [{ ru: 'Вариант A', en: 'Option A', kk: 'A нұсқасы' }, { ru: 'Вариант B', en: 'Option B', kk: 'B нұсқасы' }, { ru: 'Вариант C', en: 'Option C', kk: 'C нұсқасы' }, { ru: 'Вариант D', en: 'Option D', kk: 'D нұсқасы' }], correctOptionIndex: 0 }]);
    } finally {
      setGenerating(false);
    }
  }

  if (!ready) return null;

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{t.teacherTitle}</h1>
            <p className="mt-1 text-slate-500">Manage your courses, lessons and students</p>
          </div>
          <Link
            href="/teacher/create"
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-brand-500"
          >
            <Plus size={18} />{t.createCourse}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick actions */}
          <div className="space-y-4">
            {[
              { href: '/teacher/create', icon: Plus, label: t.createCourse, desc: 'Build a new course with lessons and tests', color: 'text-brand-600' },
              { href: '#upload', icon: Upload, label: t.uploadMaterials, desc: 'Upload video, PDF and presentations', color: 'text-violet-600' },
              { href: '#stats', icon: BarChart3, label: t.studentStats, desc: 'Monitor student progress and scores', color: 'text-emerald-600' }
            ].map((item) => (
              <Link key={item.label} href={item.href} className="glass card-hover flex items-start gap-4 rounded-3xl p-5 block">
                <div className={`rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900 ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* My courses */}
          <div className="glass rounded-3xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-brand-600" size={18} />
              <h2 className="font-bold">{t.navCourses}</h2>
            </div>
            <div className="space-y-3">
              {courses.slice(0, 4).map((course) => {
                const tr = course.translations[lang] || course.translations.en;
                return (
                  <div key={course.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{tr.title}</p>
                      <div className="mt-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-1 rounded-full bg-brand-600" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{course.progress}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI test generator */}
          <div className="glass rounded-3xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} />
              <h2 className="font-bold">AI Test Generator</h2>
            </div>
            <p className="mb-4 text-sm text-slate-500">Enter a topic and AI will generate test questions</p>
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. SQL joins, Java OOP..."
              className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={generateAiTest}
              disabled={generating || !aiTopic.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-400 disabled:opacity-60"
            >
              <Sparkles size={16} />{generating ? 'Generating...' : 'Generate questions'}
            </button>
            {aiResult && (
              <div className="mt-4 space-y-3">
                {aiResult.map((q, i) => (
                  <div key={i} className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                    <p className="text-sm font-semibold">{q.text?.[lang] || q.text?.en}</p>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {q.options?.map((opt, j) => (
                        <p key={j} className={`rounded-lg px-2 py-1 text-xs ${j === (q.correctOptionIndex ?? q.correct ?? 0) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {['A', 'B', 'C', 'D'][j]}. {opt?.[lang] || opt?.en || opt}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lesson builder */}
        <div className="mt-6 glass rounded-3xl p-6">
          <h2 className="mb-5 text-2xl font-black">{t.lessonBuilder}</h2>
          <p className="mb-4 text-sm text-slate-500">Drag to reorder lesson blocks</p>
          <div className="space-y-3">
            {LESSON_BLOCKS.map((block, i) => (
              <div key={block} className="flex cursor-grab items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:cursor-grabbing">
                <GripVertical className="text-slate-300" size={20} />
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 text-sm font-bold dark:bg-brand-950/30">
                  {i + 1}
                </div>
                <span className="flex-1 font-semibold">{block}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 dark:bg-emerald-950/30">Required</span>
                  <button className="text-xs text-brand-600 hover:underline">{t.edit}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student stats */}
        <div id="stats" className="mt-6 glass rounded-3xl p-6">
          <h2 className="mb-5 text-2xl font-black">{t.studentStats}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500">{t.name}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500">{t.navCourses}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500">{t.progress}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500">{t.score}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-500">{t.examAccess}</th>
                </tr>
              </thead>
              <tbody>
                {STUDENT_STATS.map((s) => (
                  <tr key={s.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-sm text-slate-500">{s.course}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-sm font-bold">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-bold">{s.score}/100</td>
                    <td className="py-3">
                      {s.progress >= 70 ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={14} />{t.allowed}</span>
                      ) : (
                        <span className="text-xs text-rose-500">{t.denied}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Shell>
  );
}
