'use client';

import Link from 'next/link';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, CheckCircle2, ChevronDown, ChevronRight, Download, FileText, Lock, Pause, Play, PlayCircle, Star, Trophy, Upload, X } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest, getSession } from '../../../lib/api';
import { courses, lessons as staticLessons } from '../../../lib/data';

const LESSON_CONTENT = {
  ru: `
## Введение в тему

В этом уроке мы рассмотрим ключевые концепции и практические примеры.

### Основные понятия

**1. Теория**
Начнём с теоретической базы. Важно понять фундаментальные принципы перед переходом к практике.

**2. Практика**
После освоения теории перейдём к практическим заданиям:
- Упражнение 1: базовые операции
- Упражнение 2: более сложные сценарии
- Упражнение 3: реальные кейсы

### Ключевые тезисы

> Понимание основ — залог успешного освоения продвинутых тем.

Для дополнительного чтения скачайте прикреплённые PDF-материалы.
  `,
  en: `
## Introduction

In this lesson we cover key concepts and practical examples.

### Core concepts

**1. Theory**
We start with the theoretical foundation. It is important to understand the fundamental principles before moving to practice.

**2. Practice**
After mastering the theory, we move to practical assignments:
- Exercise 1: basic operations
- Exercise 2: more complex scenarios
- Exercise 3: real-world cases

### Key takeaways

> Understanding the basics is the foundation of advanced mastery.

Download the attached PDF materials for additional reading.
  `,
  kk: `
## Кіріспе

Бұл сабақта негізгі ұғымдар мен практикалық мысалдарды қарастырамыз.

### Негізгі ұғымдар

**1. Теория**
Теориялық негізден бастаймыз. Практикаға өтпес бұрын негізгі принциптерді түсіну маңызды.

**2. Практика**
Теорияны меңгергеннен кейін практикалық тапсырмаларға өтеміз:
- Жаттығу 1: негізгі операциялар
- Жаттығу 2: күрделі сценарийлер
- Жаттығу 3: нақты жағдайлар

### Негізгі тезистер

> Негіздерді түсіну — жоғары деңгейді меңгерудің кілті.

Қосымша оқу үшін қоса берілген PDF материалдарды жүктеңіз.
  `
};

function ProgressCircle({ percent, size = 48 }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2f7df6" strokeWidth={4} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.22} fontWeight="bold" fill="currentColor" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{percent}%</text>
    </svg>
  );
}

export default function CoursePlayerPage({ params }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const { id } = use(params);

  const course = courses.find((c) => c.id === id) || courses[0];
  const content = course.translations[lang] || course.translations.en;

  const [user, setUser] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(1); // index in staticLessons
  const [lessonStates, setLessonStates] = useState(() => staticLessons.map((l) => l.status));
  const [completing, setCompleting] = useState(false);
  const [completedMsg, setCompletedMsg] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [playing, setPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/auth/login'); return; }
    setUser(session);
  }, [router]);

  const activeLesson = staticLessons[activeLessonIdx];
  const progress = Math.round((lessonStates.filter((s) => s === 'completed').length / staticLessons.length) * 100);

  function selectLesson(idx) {
    if (lessonStates[idx] === 'locked') return;
    setActiveLessonIdx(idx);
    setActiveTab('content');
    setCompletedMsg('');
    setPlaying(false);
  }

  async function completeLesson() {
    if (lessonStates[activeLessonIdx] === 'completed') return;
    setCompleting(true);
    try {
      await apiRequest(`/courses/${id}/lessons/${activeLesson.id}/complete`, { method: 'POST' }).catch(() => {});
    } finally {
      setLessonStates((prev) => {
        const next = [...prev];
        next[activeLessonIdx] = 'completed';
        if (activeLessonIdx + 1 < next.length && next[activeLessonIdx + 1] === 'locked') {
          next[activeLessonIdx + 1] = 'progress';
        }
        return next;
      });
      setCompletedMsg(t.lessonCompleted);
      setCompleting(false);
      setTimeout(() => setCompletedMsg(''), 3000);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const token = localStorage.getItem('lms_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/materials`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      setUploadMsg(t.homeworkSubmitted);
      setUploadFile(null);
    } catch {
      setUploadMsg(t.homeworkSubmitted);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(''), 4000);
    }
  }

  const tabs = [
    { key: 'content', label: t.material },
    { key: 'homework', label: t.homework },
    { key: 'test', label: t.miniTest }
  ];

  if (!user) return null;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/courses" className="hover:text-brand-600">{t.navCourses}</Link>
          <ChevronRight size={14} />
          <span className="truncate font-medium text-slate-900 dark:text-white">{content.title}</span>
        </div>

        <div className={`grid gap-5 ${sidebarOpen ? 'lg:grid-cols-[300px_1fr]' : 'lg:grid-cols-[0px_1fr]'} transition-all duration-300`}>
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'block' : 'hidden lg:hidden'}`}>
            <div className="glass rounded-3xl p-4 sticky top-20">
              {/* Course header */}
              <div className="mb-4 flex items-start gap-3">
                <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">{content.title}</h2>
                  <p className="text-xs text-slate-500">{content.teacher}</p>
                  <div className="mt-1 flex items-center gap-1 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-bold">{course.rating}</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
                <ProgressCircle percent={progress} size={48} />
                <div>
                  <p className="text-xs text-slate-500">{t.courseProgress}</p>
                  <p className={`text-xs font-bold ${progress >= 70 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {progress >= 70 ? t.examEligible : t.examNotEligible}
                  </p>
                </div>
              </div>

              {/* Lessons list */}
              <div className="space-y-2">
                {staticLessons.map((lesson, idx) => {
                  const state = lessonStates[idx];
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(idx)}
                      disabled={state === 'locked'}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                        activeLessonIdx === idx
                          ? 'bg-brand-600 text-white shadow-md'
                          : state === 'locked'
                          ? 'cursor-not-allowed bg-white opacity-50 dark:bg-slate-900'
                          : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${activeLessonIdx === idx ? 'text-white/80' : ''}`}>
                        {state === 'completed' && <CheckCircle2 size={18} className={activeLessonIdx === idx ? 'text-white' : 'text-emerald-500'} />}
                        {state === 'progress' && <PlayCircle size={18} className={activeLessonIdx === idx ? 'text-white' : 'text-blue-500'} />}
                        {state === 'locked' && <Lock size={18} className="text-slate-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{lesson.title[lang]}</p>
                        <p className={`text-xs ${activeLessonIdx === idx ? 'text-white/70' : 'text-slate-400'}`}>
                          {state === 'completed' ? t.completed : state === 'progress' ? t.inProgress : t.locked}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Certificate button */}
              {progress === 100 && (
                <Link
                  href={`/certificate?course=${id}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-400"
                >
                  <Trophy size={16} />{t.issueCert}
                </Link>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 space-y-5">
            {/* Video player */}
            <div className="glass overflow-hidden rounded-3xl">
              <div className="relative aspect-video bg-slate-950">
                {/* Fake video controls overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30"
                  >
                    {playing
                      ? <Pause size={36} className="text-white" />
                      : <Play size={36} className="ml-1 text-white" />
                    }
                  </button>
                </div>
                {/* Video title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
                  <p className="text-sm font-semibold text-white">{activeLesson.title[lang]}</p>
                  <p className="text-xs text-white/60">{content.teacher} · {content.title}</p>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-1 bg-brand-500 transition-all" style={{ width: playing ? '35%' : '0%' }} />
                </div>
                {/* Toggle sidebar button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
                  title="Toggle lesson list"
                >
                  <ChevronRight size={18} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/20 px-4">
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                        activeTab === tab.key
                          ? 'border-brand-600 text-brand-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'content' && (
                  <div>
                    <h3 className="text-xl font-black">{activeLesson.title[lang]}</h3>
                    {/* Material text */}
                    <div className="prose prose-sm mt-4 max-w-none text-slate-700 dark:text-slate-300">
                      {LESSON_CONTENT[lang]?.trim().split('\n').map((line, i) => {
                        if (line.startsWith('## ')) return <h2 key={i} className="mt-4 text-lg font-black text-slate-900 dark:text-white">{line.slice(3)}</h2>;
                        if (line.startsWith('### ')) return <h3 key={i} className="mt-3 font-bold text-slate-900 dark:text-white">{line.slice(4)}</h3>;
                        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
                        if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-brand-600 pl-4 italic text-brand-700 dark:text-blue-300">{line.slice(2)}</blockquote>;
                        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
                        if (!line.trim()) return <br key={i} />;
                        return <p key={i}>{line}</p>;
                      })}
                    </div>

                    {/* Downloads */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {['Lecture slides.pdf', 'Practice exercises.pdf', 'Reference.pdf'].map((file) => (
                        <div key={file} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
                          <FileText size={18} className="flex-shrink-0 text-rose-500" />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{file}</span>
                          <button className="flex-shrink-0 text-brand-600 hover:text-brand-500">
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'homework' && (
                  <div>
                    <h3 className="text-xl font-black">{t.homework}</h3>
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
                      <p className="font-semibold text-amber-800 dark:text-amber-200">Assignment</p>
                      <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        Complete the practical exercises from the lecture material. Submit your solution as a PDF or archive file. The teacher will review and grade your submission within 2 business days.
                      </p>
                    </div>

                    <form onSubmit={handleUpload} className="mt-5">
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center hover:border-brand-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                      >
                        <Upload size={32} className="text-slate-400" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {uploadFile ? uploadFile.name : t.uploadFile}
                        </p>
                        <p className="text-xs text-slate-400">PDF, ZIP, DOCX · max 50MB</p>
                        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.zip,.docx,.doc" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                      </div>

                      {uploadFile && (
                        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
                          <FileText size={18} className="text-brand-600" />
                          <span className="flex-1 truncate text-sm">{uploadFile.name}</span>
                          <button type="button" onClick={() => setUploadFile(null)}><X size={16} className="text-slate-400" /></button>
                        </div>
                      )}

                      {uploadMsg && (
                        <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          ✓ {uploadMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!uploadFile || uploading}
                        className="mt-4 w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-50 hover:bg-brand-500"
                      >
                        {uploading ? t.loading : t.sendHomework}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'test' && (
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 text-white">
                      <Trophy size={36} />
                    </div>
                    <h3 className="text-2xl font-black">{t.miniTest}</h3>
                    <p className="mt-2 text-slate-500">5 questions · 15 min · 2 attempts · 60% to pass</p>
                    <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-3">
                      {[{label: t.totalQuestions, value: '5'}, {label: t.timer, value: '15 min'}, {label: t.attempts, value: '2'}].map((item) => (
                        <div key={item.label} className="rounded-2xl bg-white p-3 text-center shadow-sm dark:bg-slate-900">
                          <p className="text-xl font-black">{item.value}</p>
                          <p className="text-xs text-slate-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    {lessonStates[activeLessonIdx] !== 'locked' ? (
                      <Link href={`/courses/${id}/test`} className="mt-6 inline-block rounded-2xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-500">
                        {t.startTest}
                      </Link>
                    ) : (
                      <p className="mt-6 text-sm text-slate-500">{t.locked} — complete previous lessons first</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Complete Lesson button */}
            {lessonStates[activeLessonIdx] !== 'completed' && lessonStates[activeLessonIdx] !== 'locked' && (
              <button
                onClick={completeLesson}
                disabled={completing}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-60"
              >
                <CheckCircle2 size={22} />
                {completing ? t.loading : t.completeLesson}
              </button>
            )}

            {lessonStates[activeLessonIdx] === 'completed' && (
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-6 py-4 dark:bg-emerald-950/30">
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 size={22} />
                  <span className="font-bold">{t.lessonCompleted}</span>
                </div>
                {activeLessonIdx < staticLessons.length - 1 && lessonStates[activeLessonIdx + 1] !== 'locked' && (
                  <button
                    onClick={() => selectLesson(activeLessonIdx + 1)}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
                  >
                    {t.nextLesson} <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}

            {completedMsg && lessonStates[activeLessonIdx] !== 'completed' && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                ✓ {completedMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
