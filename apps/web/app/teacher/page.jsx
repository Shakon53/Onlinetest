'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3, BookOpen, CheckCircle2, FileText, Link2,
  Plus, Sparkles, Trash2, Upload, Users, X
} from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { getSession, apiRequest } from '../../lib/api';
import { courses, getLessons } from '../../lib/data';

function buildRealStats() {
  if (typeof window === 'undefined') return { courseStats: [], studentStats: [], materials: [], totalStudents: 0 };
  const registered = JSON.parse(localStorage.getItem('lms_registered_users') || '[]');
  const students = registered.filter(u => u.role === 'student' || !u.role);

  // Course completion rates (avg across all students)
  const courseStats = courses.map(c => {
    const totalLessons = getLessons(c.id).length;
    let totalPassed = 0, count = 0;
    students.forEach(u => {
      const key = `${u.email.replace(/[@.]/g, '_')}::progress_${c.id}`;
      try {
        const prog = JSON.parse(localStorage.getItem(key) || 'null');
        if (prog) { totalPassed += Object.values(prog).filter(p => p?.passed).length; count++; }
      } catch {}
    });
    const avgPct = count > 0 && totalLessons > 0 ? Math.round((totalPassed / (count * totalLessons)) * 100) : 0;
    return { ...c, realProgress: avgPct, enrolledCount: count };
  });

  // Student-level stats per course
  const studentStats = [];
  students.forEach(u => {
    courses.forEach(c => {
      const totalLessons = getLessons(c.id).length;
      const pKey = `${u.email.replace(/[@.]/g, '_')}::progress_${c.id}`;
      const eKey = `${u.email.replace(/[@.]/g, '_')}::exam_${c.id}`;
      try {
        const prog = JSON.parse(localStorage.getItem(pKey) || 'null');
        if (!prog || Object.keys(prog).length === 0) return;
        const passed = Object.values(prog).filter(p => p?.passed).length;
        const pct = totalLessons > 0 ? Math.round((passed / totalLessons) * 100) : 0;
        const exam = JSON.parse(localStorage.getItem(eKey) || 'null');
        studentStats.push({
          name: u.name || u.email.split('@')[0],
          email: u.email,
          courseId: c.id,
          courseName: (c.translations?.ru?.title || c.id).slice(0, 20),
          pct,
          score: exam?.score ?? null,
          examAccess: pct >= 70,
        });
      } catch {}
    });
  });

  const materials = JSON.parse(localStorage.getItem('teacher_materials') || '[]');
  return { courseStats, studentStats, materials, totalStudents: students.length };
}

export default function TeacherPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState({ courseStats: [], studentStats: [], materials: [], totalStudents: 0 });
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiResult, setAiResult] = useState(null);

  // Upload panel state
  const [showUpload, setShowUpload] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matUrl, setMatUrl] = useState('');
  const [matType, setMatType] = useState('video');

  useEffect(() => {
    const user = getSession();
    if (!user) { router.replace('/auth/login'); return; }
    if (user.role !== 'teacher' && user.role !== 'admin') { router.replace('/dashboard'); return; }
    setReady(true);
    setData(buildRealStats());
  }, [router]);

  async function generateAiTest() {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      const res = await apiRequest('/ai/generate-test', { method: 'POST', body: JSON.stringify({ topic: aiTopic, count: 3 }) });
      setAiResult(res.questions);
    } catch {
      setAiResult([
        { text: { ru: `Вопрос по теме: ${aiTopic}`, en: `Question on: ${aiTopic}`, kk: `Сұрақ: ${aiTopic}` },
          options: [{ ru: 'Вариант A', en: 'Option A', kk: 'A' }, { ru: 'Вариант B', en: 'Option B', kk: 'B' },
                    { ru: 'Вариант C', en: 'Option C', kk: 'C' }, { ru: 'Вариант D', en: 'Option D', kk: 'D' }],
          correctOptionIndex: 0 }
      ]);
    } finally { setGenerating(false); }
  }

  function saveMaterial() {
    if (!matTitle.trim() || !matUrl.trim()) return;
    const existing = JSON.parse(localStorage.getItem('teacher_materials') || '[]');
    const newMat = { id: Date.now(), title: matTitle, url: matUrl, type: matType, date: new Date().toLocaleDateString() };
    const updated = [newMat, ...existing];
    localStorage.setItem('teacher_materials', JSON.stringify(updated));
    setData(prev => ({ ...prev, materials: updated }));
    setMatTitle(''); setMatUrl(''); setShowUpload(false);
  }

  function deleteMaterial(id) {
    const updated = data.materials.filter(m => m.id !== id);
    localStorage.setItem('teacher_materials', JSON.stringify(updated));
    setData(prev => ({ ...prev, materials: updated }));
  }

  if (!ready) return null;
  const { courseStats, studentStats, materials, totalStudents } = data;

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{t.teacherTitle}</h1>
            <p className="mt-1 text-slate-500">
              {lang === 'ru' ? `${totalStudents} студентов · ${courses.length} курсов` : `${totalStudents} students · ${courses.length} courses`}
            </p>
          </div>
          <Link href="/teacher/create"
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-brand-500">
            <Plus size={18} />{t.createCourse}
          </Link>
        </div>

        {/* Summary stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-3xl p-5 bg-blue-50 dark:bg-blue-950/30">
            <Users className="mb-3 text-blue-600" size={22} />
            <p className="text-3xl font-black text-blue-600">{totalStudents}</p>
            <p className="text-sm text-slate-500">{lang === 'ru' ? 'Студентов зарегистрировано' : 'Students registered'}</p>
          </div>
          <div className="glass rounded-3xl p-5 bg-violet-50 dark:bg-violet-950/30">
            <BookOpen className="mb-3 text-violet-600" size={22} />
            <p className="text-3xl font-black text-violet-600">{courses.length}</p>
            <p className="text-sm text-slate-500">{lang === 'ru' ? 'Курсов на платформе' : 'Courses on platform'}</p>
          </div>
          <div className="glass rounded-3xl p-5 bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle2 className="mb-3 text-emerald-600" size={22} />
            <p className="text-3xl font-black text-emerald-600">{studentStats.filter(s => s.examAccess).length}</p>
            <p className="text-sm text-slate-500">{lang === 'ru' ? 'Допущено к экзамену' : 'Admitted to exam'}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick actions */}
          <div className="space-y-4">
            <Link href="/teacher/create" className="glass card-hover flex items-start gap-4 rounded-3xl p-5 block">
              <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/30 p-3"><Plus className="text-brand-600" size={20} /></div>
              <div>
                <h3 className="font-bold">{t.createCourse}</h3>
                <p className="mt-1 text-sm text-slate-500">{lang === 'ru' ? 'Создать новый курс с уроками и тестами' : 'Build a new course with lessons and tests'}</p>
              </div>
            </Link>

            <button onClick={() => setShowUpload(true)}
              className="glass card-hover w-full flex items-start gap-4 rounded-3xl p-5 text-left">
              <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 p-3"><Upload className="text-violet-600" size={20} /></div>
              <div>
                <h3 className="font-bold">{t.uploadMaterials}</h3>
                <p className="mt-1 text-sm text-slate-500">{lang === 'ru' ? 'Добавить видео/PDF ссылку в материалы' : 'Add video/PDF URL to materials'}</p>
                {materials.length > 0 && <p className="mt-1 text-xs text-violet-600 font-semibold">{materials.length} файлов сохранено</p>}
              </div>
            </button>

            <a href="#stats" className="glass card-hover flex items-start gap-4 rounded-3xl p-5 block">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-3"><BarChart3 className="text-emerald-600" size={20} /></div>
              <div>
                <h3 className="font-bold">{t.studentStats}</h3>
                <p className="mt-1 text-sm text-slate-500">{lang === 'ru' ? `${studentStats.length} записей прогресса студентов` : `${studentStats.length} student progress records`}</p>
              </div>
            </a>
          </div>

          {/* Course completion rates - real */}
          <div className="glass rounded-3xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-brand-600" size={18} />
              <h2 className="font-bold">{lang === 'ru' ? 'Прогресс по курсам' : 'Course Progress'}</h2>
            </div>
            <div className="space-y-3">
              {courseStats.map((c) => {
                const tr = c.translations?.[lang] || c.translations?.ru || c.translations?.en || {};
                return (
                  <div key={c.id} className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">{tr.title || c.id}</p>
                        <p className="text-xs text-slate-400">{c.enrolledCount} студ. · ср. {c.realProgress}%</p>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-1.5 rounded-full bg-brand-600 transition-all" style={{ width: `${c.realProgress}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 flex-shrink-0">{c.realProgress}%</span>
                    </div>
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
            <p className="mb-3 text-sm text-slate-500">{lang === 'ru' ? 'Введите тему — AI сгенерирует тестовые вопросы' : 'Enter a topic and AI will generate test questions'}</p>
            <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateAiTest()}
              placeholder="e.g. SQL joins, Java OOP..."
              className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button onClick={generateAiTest} disabled={generating || !aiTopic.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-400 disabled:opacity-60">
              <Sparkles size={16} />{generating ? (lang === 'ru' ? 'Генерация...' : 'Generating...') : (lang === 'ru' ? 'Сгенерировать вопросы' : 'Generate questions')}
            </button>
            {aiResult && (
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {aiResult.map((q, i) => (
                  <div key={i} className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                    <p className="text-sm font-semibold">{q.text?.[lang] || q.text?.ru || q.text?.en}</p>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {q.options?.map((opt, j) => (
                        <p key={j} className={`rounded-lg px-2 py-1 text-xs ${j === (q.correctOptionIndex ?? 0) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 font-semibold' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {['A','B','C','D'][j]}. {opt?.[lang] || opt?.ru || opt?.en || opt}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Materials list */}
        {materials.length > 0 && (
          <div className="mt-6 glass rounded-3xl p-6">
            <h2 className="mb-4 text-xl font-bold">{lang === 'ru' ? 'Загруженные материалы' : 'Uploaded Materials'}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
                  <div className={`rounded-xl p-2 flex-shrink-0 ${m.type === 'video' ? 'bg-blue-100 dark:bg-blue-950/40' : 'bg-rose-100 dark:bg-rose-950/40'}`}>
                    {m.type === 'video' ? <FileText className="text-blue-600" size={16} /> : <FileText className="text-rose-600" size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.title}</p>
                    <p className="text-xs text-slate-400">{m.type.toUpperCase()} · {m.date}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <a href={m.url} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Link2 size={14} className="text-brand-600" />
                    </a>
                    <button onClick={() => deleteMaterial(m.id)} className="rounded-lg p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                      <Trash2 size={14} className="text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student stats - real data */}
        <div id="stats" className="mt-6 glass rounded-3xl p-6">
          <h2 className="mb-2 text-2xl font-black">{t.studentStats}</h2>
          <p className="mb-4 text-sm text-slate-400">
            {lang === 'ru' ? 'Реальные данные прогресса из localStorage' : 'Real progress data from localStorage'}
          </p>
          {studentStats.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-8 text-center">
              <Users size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-500">{lang === 'ru' ? 'Нет данных о прогрессе студентов' : 'No student progress data yet'}</p>
              <p className="mt-1 text-sm text-slate-400">{lang === 'ru' ? 'Данные появятся когда студенты начнут проходить курсы' : 'Data will appear when students start taking courses'}</p>
            </div>
          ) : (
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
                  {studentStats.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-slate-500">{s.courseName}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-brand-600" style={{ width: `${s.pct}%` }} />
                          </div>
                          <span className="text-sm font-bold">{s.pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-bold">
                        {s.score !== null ? `${s.score}%` : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3">
                        {s.examAccess
                          ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={14} />{t.allowed}</span>
                          : <span className="text-xs text-rose-500">{t.denied}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Upload Materials Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass rounded-3xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{lang === 'ru' ? 'Добавить материал' : 'Add Material'}</h2>
              <button onClick={() => setShowUpload(false)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-500">{lang === 'ru' ? 'Тип материала' : 'Material type'}</label>
                <div className="flex gap-2">
                  {['video', 'pdf', 'presentation'].map(type => (
                    <button key={type} onClick={() => setMatType(type)}
                      className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${matType === type ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
                      {type === 'video' ? 'Видео' : type === 'pdf' ? 'PDF' : 'Презентация'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-500">{lang === 'ru' ? 'Название' : 'Title'}</label>
                <input value={matTitle} onChange={e => setMatTitle(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  placeholder={lang === 'ru' ? 'Название файла/видео' : 'File/video title'} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-500">URL {lang === 'ru' ? 'ссылка' : 'link'}</label>
                <input value={matUrl} onChange={e => setMatUrl(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  placeholder="https://youtube.com/... или https://drive.google.com/..." />
                <p className="mt-1 text-xs text-slate-400">{lang === 'ru' ? 'YouTube, Google Drive, OneDrive и т.д.' : 'YouTube, Google Drive, OneDrive etc.'}</p>
              </div>

              <button onClick={saveMaterial} disabled={!matTitle.trim() || !matUrl.trim()}
                className="w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-50 hover:bg-brand-500">
                {lang === 'ru' ? 'Сохранить материал' : 'Save material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
