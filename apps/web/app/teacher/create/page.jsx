'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest, getSession } from '../../../lib/api';

const CATEGORIES = ['Programming', 'Data', 'Network', 'AI', 'Practice', 'IT'];

const EMPTY_QUESTION = () => ({ text: { ru: '', en: '', kk: '' }, options: [{ ru: '', en: '', kk: '' }, { ru: '', en: '', kk: '' }, { ru: '', en: '', kk: '' }, { ru: '', en: '', kk: '' }], correctOptionIndex: 0 });

export default function CreateCoursePage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const [course, setCourse] = useState({ title: { ru: '', en: '', kk: '' }, description: { ru: '', en: '', kk: '' }, category: 'Programming', imageUrl: '' });
  const [lesson, setLesson] = useState({ title: { ru: '', en: '', kk: '' }, content: { ru: '', en: '', kk: '' }, videoUrl: '' });
  const [test, setTest] = useState({ title: { ru: '', en: '', kk: '' }, durationMinutes: 15, attemptsLimit: 2, passingPercent: 60 });
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);

  useEffect(() => {
    const user = getSession();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) { router.replace('/auth/login'); return; }
  }, [router]);

  function validateStep1() {
    const errs = {};
    if (!course.title[lang]) errs.title = 'Required';
    if (!course.description[lang]) errs.desc = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePublish() {
    setSaving(true);
    try {
      const courseData = await apiRequest('/courses', { method: 'POST', body: JSON.stringify({ title: course.title, description: course.description, category: course.category, imageUrl: course.imageUrl, published: true }) });
      if (courseData.course?._id) {
        const lessonData = await apiRequest(`/courses/${courseData.course._id}/lessons`, { method: 'POST', body: JSON.stringify({ title: lesson.title, content: lesson.content, videoUrl: lesson.videoUrl, order: 1 }) });
      }
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setSaving(false);
    }
  }

  if (done) return (
    <Shell>
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <div className="glass w-full rounded-3xl p-8 text-center">
          <CheckCircle2 size={64} className="mx-auto text-emerald-500" />
          <h2 className="mt-4 text-3xl font-black">{t.success}!</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t.publishCourse} completed.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/teacher" className="flex-1 rounded-2xl bg-brand-600 py-3 text-center font-semibold text-white">{t.back}</Link>
            <button onClick={() => { setDone(false); setStep(1); }} className="flex-1 rounded-2xl bg-white py-3 font-semibold shadow-sm dark:bg-slate-900">{t.createCourse}</button>
          </div>
        </div>
      </section>
    </Shell>
  );

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/teacher" className="rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black">{t.createCourse}</h1>
        </div>

        {/* Steps indicator */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${step >= s ? 'bg-brand-600 text-white' : 'bg-white text-slate-400 dark:bg-slate-800'}`}>
                {step > s ? <CheckCircle2 size={18} /> : s}
              </div>
              {s < 3 && <div className={`mx-2 h-0.5 w-16 rounded ${step > s ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
          <div className="ml-4 text-sm text-slate-500">
            Step {step} of 3 — {step === 1 ? t.courseTitle : step === 2 ? t.createLesson : t.createTest}
          </div>
        </div>

        {/* Step 1: Course info */}
        {step === 1 && (
          <div className="glass rounded-3xl p-6 space-y-5">
            <h2 className="text-xl font-bold">{t.courseTitle}</h2>

            {['ru', 'en', 'kk'].map((l) => (
              <div key={l}>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.courseTitle} ({l.toUpperCase()})</label>
                <input
                  value={course.title[l]}
                  onChange={(e) => setCourse({ ...course, title: { ...course.title, [l]: e.target.value } })}
                  className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  placeholder={`Course title in ${l}`}
                />
              </div>
            ))}

            {errors.title && <p className="text-sm text-rose-500">{errors.title}</p>}

            {['ru', 'en', 'kk'].map((l) => (
              <div key={`desc-${l}`}>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.courseDesc} ({l.toUpperCase()})</label>
                <textarea
                  value={course.description[l]}
                  onChange={(e) => setCourse({ ...course, description: { ...course.description, [l]: e.target.value } })}
                  className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  rows={2}
                  placeholder={`Description in ${l}`}
                />
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.courseCategory}</label>
              <select
                value={course.category}
                onChange={(e) => setCourse({ ...course, category: e.target.value })}
                className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Image URL</label>
              <input
                value={course.imageUrl}
                onChange={(e) => setCourse({ ...course, imageUrl: e.target.value })}
                className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900"
                placeholder="https://..."
              />
            </div>

            <button
              onClick={() => validateStep1() && setStep(2)}
              className="w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white"
            >
              Next: {t.createLesson}
            </button>
          </div>
        )}

        {/* Step 2: Lesson */}
        {step === 2 && (
          <div className="glass rounded-3xl p-6 space-y-5">
            <h2 className="text-xl font-bold">{t.createLesson}</h2>

            {['ru', 'en', 'kk'].map((l) => (
              <div key={l}>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.lessonTitle} ({l.toUpperCase()})</label>
                <input
                  value={lesson.title[l]}
                  onChange={(e) => setLesson({ ...lesson, title: { ...lesson.title, [l]: e.target.value } })}
                  className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900"
                  placeholder={`Lesson title in ${l}`}
                />
              </div>
            ))}

            {['ru', 'en', 'kk'].map((l) => (
              <div key={`content-${l}`}>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.lessonContent} ({l.toUpperCase()})</label>
                <textarea
                  value={lesson.content[l]}
                  onChange={(e) => setLesson({ ...lesson, content: { ...lesson.content, [l]: e.target.value } })}
                  className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900"
                  rows={3}
                  placeholder={`Content in ${l}`}
                />
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Video URL</label>
              <input
                value={lesson.videoUrl}
                onChange={(e) => setLesson({ ...lesson, videoUrl: e.target.value })}
                className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900"
                placeholder="YouTube or uploaded video URL"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-2xl bg-white py-3 font-semibold shadow-sm dark:bg-slate-900">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 rounded-2xl bg-brand-600 py-3 font-semibold text-white">Next: {t.createTest}</button>
            </div>
          </div>
        )}

        {/* Step 3: Test */}
        {step === 3 && (
          <div className="glass rounded-3xl p-6 space-y-5">
            <h2 className="text-xl font-bold">{t.createTest}</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.testDuration}</label>
                <input type="number" value={test.durationMinutes} min={5} max={120} onChange={(e) => setTest({ ...test, durationMinutes: +e.target.value })} className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.testAttempts}</label>
                <input type="number" value={test.attemptsLimit} min={1} max={10} onChange={(e) => setTest({ ...test, attemptsLimit: +e.target.value })} className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{t.passingScore}</label>
                <input type="number" value={test.passingPercent} min={50} max={100} onChange={(e) => setTest({ ...test, passingPercent: +e.target.value })} className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm dark:bg-slate-900" />
              </div>
            </div>

            <h3 className="font-bold">Questions</h3>
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{t.question} {qi + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => setQuestions(questions.filter((_, i) => i !== qi))} className="text-rose-500 hover:text-rose-700">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <input
                  value={q.text[lang]}
                  onChange={(e) => setQuestions(questions.map((item, i) => i === qi ? { ...item, text: { ...item.text, [lang]: e.target.value } } : item))}
                  className="w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
                  placeholder={t.questionText}
                />
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${qi}`} checked={q.correctOptionIndex === oi} onChange={() => setQuestions(questions.map((item, i) => i === qi ? { ...item, correctOptionIndex: oi } : item))} className="text-brand-600" />
                    <input
                      value={opt[lang]}
                      onChange={(e) => setQuestions(questions.map((item, i) => i === qi ? { ...item, options: item.options.map((o, j) => j === oi ? { ...o, [lang]: e.target.value } : o) } : item))}
                      className="flex-1 rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
                      placeholder={[t.optionA, t.optionB, t.optionC, t.optionD][oi]}
                    />
                  </div>
                ))}
              </div>
            ))}

            <button onClick={() => setQuestions([...questions, EMPTY_QUESTION()])} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50">
              <Plus size={16} />{t.addQuestion}
            </button>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-2xl bg-white py-3 font-semibold shadow-sm dark:bg-slate-900">Back</button>
              <button onClick={handlePublish} disabled={saving} className="flex-1 rounded-2xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-60">
                {saving ? t.loading : t.publishCourse}
              </button>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}
