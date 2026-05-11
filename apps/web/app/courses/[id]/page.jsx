'use client';

import { use, useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock,
  Lock, Trophy, XCircle, AlertCircle, RotateCcw,
  FileText, Target, Star, Zap, PenLine, Flame, GraduationCap, Timer
} from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { courses, getLessons } from '../../../lib/data';

// ── localStorage helpers ──────────────────────────────────────────────────
function loadProgress(courseId) {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(`progress_${courseId}`) || '{}'); }
  catch { return {}; }
}
function saveProgress(courseId, data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`progress_${courseId}`, JSON.stringify(data));
}

// ── Markdown-lite renderer ────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 dark:bg-black rounded-xl p-4 overflow-x-auto text-sm text-emerald-300 my-4"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-violet-600 dark:text-violet-400">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-slate-100">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black mt-2 mb-4 text-slate-900 dark:text-white">$1</h2>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-brand-500 bg-blue-50 dark:bg-blue-950/30 pl-4 py-2 my-3 rounded-r-lg text-sm text-slate-600 dark:text-slate-300 italic">$1</blockquote>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/\| (.+) \|/g, (m) => {
      const cells = m.split('|').filter(c => c.trim() && !/^[-:\s]+$/.test(c.trim()));
      return '<tr>' + cells.map(c => `<td class="border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm">${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (m) => {
      const rows = m.split('\n').filter(r => r.includes('<tr>'));
      if (rows.length < 2) return m;
      const [head, ...body] = rows;
      const theadRow = head.replace(/td/g, 'th').replace(/class="[^"]*"/g, 'class="border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-left"');
      return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse rounded-xl overflow-hidden"><thead>${theadRow}</thead><tbody>${body.join('')}</tbody></table></div>`;
    })
    .replace(/^- ✅ (.+)$/gm, '<li class="flex gap-2 my-1 text-emerald-700 dark:text-emerald-400"><span>✅</span><span>$1</span></li>')
    .replace(/^- ❌ (.+)$/gm, '<li class="flex gap-2 my-1 text-rose-600 dark:text-rose-400"><span>❌</span><span>$1</span></li>')
    .replace(/^- \*\*([^*]+)\*\* (.+)$/gm, '<li class="flex gap-2 my-1"><span class="font-bold text-slate-900 dark:text-white">$1</span><span class="text-slate-600 dark:text-slate-300">$2</span></li>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-2 my-1 text-slate-700 dark:text-slate-300"><span class="text-brand-500 mt-0.5">•</span><span>$1</span></li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, m => `<ul class="my-3 space-y-0.5">${m}</ul>`)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, ' ');
}

// ── DIFFICULTY badge ──────────────────────────────────────────────────────
const DIFF = {
  easy: { label: 'Лёгкий', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  medium: { label: 'Средний', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  hard: { label: 'Сложный', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
};

// ── PHASE ENUM ────────────────────────────────────────────────────────────
const PHASE = { THEORY: 'theory', PRACTICE: 'practice', QUIZ: 'quiz', RESULT: 'result' };
const PASS_THRESHOLD = 0.6;
const QUIZ_SECONDS = 15 * 60; // 15 minutes per quiz

export default function CoursePlayerPage({ params }) {
  const { id } = use(params);
  const { lang, t } = useI18n();
  const router = useRouter();

  const course = courses.find(c => c.id === id);
  const lessons = getLessons(id);
  const content = course?.translations?.[lang] || course?.translations?.ru;

  // Auth guard
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('lms_user') || 'null');
    if (!user) {
      router.replace(`/auth/login?redirect=/courses/${id}`);
    } else {
      setAuthReady(true);
    }
  }, [id]);

  // progress stored in localStorage
  const [progress, setProgress] = useState({});
  const [activeId, setActiveId] = useState(1);
  const [phase, setPhase] = useState(PHASE.THEORY);

  // quiz state
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_SECONDS);
  const timerRef = useRef(null);

  // notes
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // theory scroll tracking
  const theoryRef = useRef(null);
  const [theoryRead, setTheoryRead] = useState(false);

  // streak
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const p = loadProgress(id);
    setProgress(p);
    // find first uncompleted lesson
    const firstUnfinished = lessons.find(l => !p[l.id]?.passed);
    if (firstUnfinished) {
      setActiveId(firstUnfinished.id);
    } else if (lessons.length > 0) {
      setActiveId(lessons[lessons.length - 1].id);
    }
  }, [id]);

  useEffect(() => {
    setPhase(PHASE.THEORY);
    setAnswers({});
    setSubmitted(false);
    setQuizScore(null);
    setTheoryRead(false);
    setTimeLeft(QUIZ_SECONDS);
    clearInterval(timerRef.current);
    // load note
    const savedNote = localStorage.getItem(`note_${id}_${activeId}`) || '';
    setNote(savedNote);
    setNoteSaved(false);
  }, [activeId]);

  // Streak tracking
  useEffect(() => {
    const today = new Date().toDateString();
    const last = localStorage.getItem('streak_last');
    const count = parseInt(localStorage.getItem('streak_count') || '0');
    if (last === today) { setStreak(count); return; }
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newCount = last === yesterday ? count + 1 : 1;
    localStorage.setItem('streak_last', today);
    localStorage.setItem('streak_count', String(newCount));
    setStreak(newCount);
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== PHASE.QUIZ || submitted) return;
    clearInterval(timerRef.current);
    setTimeLeft(QUIZ_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmitQuiz(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, submitted]);

  // track theory scroll
  useEffect(() => {
    if (phase !== PHASE.THEORY || !theoryRef.current) return;
    const el = theoryRef.current;
    const check = () => {
      const scrolled = el.scrollTop + el.clientHeight;
      const total = el.scrollHeight;
      if (scrolled >= total * 0.8) setTheoryRead(true);
    };
    el.addEventListener('scroll', check);
    // short content auto-passes
    if (el.scrollHeight <= el.clientHeight + 10) setTheoryRead(true);
    return () => el.removeEventListener('scroll', check);
  }, [phase, activeId]);

  if (!authReady) return (
    <Shell><div className="flex min-h-[50vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div></Shell>
  );

  if (!course) return (
    <Shell><div className="p-10 text-center text-slate-400">Курс не найден</div></Shell>
  );

  const activeLesson = lessons.find(l => l.id === activeId);
  if (!activeLesson) return (
    <Shell><div className="p-10 text-center text-slate-400">Урок не найден</div></Shell>
  );

  // lesson locking: lesson N is unlocked if all previous lessons are passed
  function isUnlocked(lessonId) {
    if (lessonId === 1) return true;
    for (let i = 1; i < lessonId; i++) {
      if (!progress[i]?.passed) return false;
    }
    return true;
  }

  const completedCount = Object.values(progress).filter(p => p?.passed).length;
  const totalPct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  // ── quiz submit ──────────────────────────────────────────────────────────
  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2,'0')}`;
  }

  function handleSubmitQuiz() {
    clearInterval(timerRef.current);
    const quiz = activeLesson.quiz || [];
    let correct = 0;
    quiz.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    const score = quiz.length > 0 ? correct / quiz.length : 0;
    setQuizScore({ correct, total: quiz.length, pct: Math.round(score * 100) });
    setSubmitted(true);

    if (score >= PASS_THRESHOLD) {
      const newP = { ...progress, [activeId]: { passed: true, score: Math.round(score * 100), date: Date.now() } };
      setProgress(newP);
      saveProgress(id, newP);
    }
  }

  function handleRetryQuiz() {
    setAnswers({});
    setSubmitted(false);
    setQuizScore(null);
    setTimeLeft(QUIZ_SECONDS);
  }

  function saveNote() {
    localStorage.setItem(`note_${id}_${activeId}`, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  function goToNextLesson() {
    const next = lessons.find(l => l.id === activeId + 1);
    if (next) {
      setActiveId(next.id);
    }
  }

  const passed = progress[activeId]?.passed;
  const quiz = activeLesson.quiz || [];

  // ── SIDEBAR ────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="hidden lg:flex lg:flex-col w-80 flex-shrink-0 glass rounded-3xl overflow-hidden">
      {/* Course header */}
      <div className="bg-gradient-to-br from-brand-600 to-violet-700 p-5 text-white">
        <h2 className="font-black text-lg leading-tight">{content?.title}</h2>
        <p className="mt-1 text-sm opacity-80">{content?.teacher}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Прогресс курса</span>
            <span className="font-bold">{totalPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${totalPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs opacity-70">{completedCount} из {lessons.length} уроков</p>
        </div>
      </div>

      {/* Streak + Exam access */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/10 dark:bg-black/10">
        <div className="flex items-center gap-1.5 text-white/80 text-xs">
          <Flame size={14} className={streak > 0 ? 'text-orange-300' : ''} />
          <span>{streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/roadmap/${id}`}
            className="text-xs text-white/60 hover:text-white/90">Карта</Link>
          {completedCount === lessons.length && (
            <Link href={`/courses/${id}/exam`}
              className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200">
              <GraduationCap size={14} /> Экзамен
            </Link>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {lessons.map(l => {
          const lPassed = progress[l.id]?.passed;
          const locked = !isUnlocked(l.id);
          const active = l.id === activeId;
          return (
            <button
              key={l.id}
              onClick={() => !locked && setActiveId(l.id)}
              disabled={locked}
              className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                active ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                : locked ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900'
                : lPassed ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                active ? 'bg-white/20 text-white'
                : locked ? 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                : lPassed ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {locked ? <Lock size={12} />
                : lPassed ? <CheckCircle2 size={14} />
                : l.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${active ? 'text-white' : ''}`}>
                  Урок {l.id}
                </p>
                <p className={`text-xs truncate ${active ? 'text-white/80' : 'text-slate-500'}`}>
                  {l.title?.[lang] || l.title?.ru}
                </p>
              </div>
              {lPassed && !active && (
                <Star size={12} className="text-amber-400 flex-shrink-0" fill="currentColor" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );

  // ── THEORY VIEW ──────────────────────────────────────────────────────────
  const TheoryView = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <BookOpen className="text-brand-600" size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Теория · Урок {activeLesson.id}</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{activeLesson.title?.[lang] || activeLesson.title?.ru}</h1>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-slate-400">
          <Clock size={14} />
          <span className="text-sm">{activeLesson.duration}</span>
        </div>
      </div>

      <div
        ref={theoryRef}
        className="flex-1 overflow-y-auto pr-2 prose-content"
        style={{ maxHeight: 'clamp(300px, calc(100vh - 380px), 800px)' }}
      >
        <div
          className="text-slate-700 dark:text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(activeLesson.theory?.[lang] || activeLesson.theory?.ru || '') }}
        />
      </div>

      {/* Notes */}
      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <PenLine size={14} className="text-amber-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Мои заметки к уроку {activeLesson.id}</span>
          {noteSaved && <span className="ml-auto text-xs text-emerald-500 font-semibold">Сохранено ✓</span>}
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Пишите заметки, ключевые моменты, вопросы..."
          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 resize-none focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50">
          <button onClick={saveNote} className="text-xs font-semibold text-brand-600 hover:text-brand-500">Сохранить заметку</button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {theoryRead
            ? <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold"><CheckCircle2 size={16} />Теория изучена</div>
            : <div className="flex items-center gap-1.5 text-slate-400 text-sm"><AlertCircle size={16} />Прокрутите вниз для продолжения</div>
          }
        </div>
        <button
          onClick={() => setPhase(PHASE.PRACTICE)}
          disabled={!theoryRead}
          className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-sm transition-all ${
            theoryRead
              ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/30'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          Перейти к практике <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // ── PRACTICE VIEW ─────────────────────────────────────────────────────────
  const PracticeView = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/30">
          <Target className="text-amber-600" size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Практика · Урок {activeLesson.id}</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Практическое задание</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500 flex-shrink-0">
              <FileText className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Задание</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeLesson.practiceTask?.[lang] || activeLesson.practiceTask?.ru}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-1">💡 Инструкция</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Выполните задание самостоятельно в вашей среде разработки или рабочей тетради.
              После выполнения нажмите кнопку ниже, чтобы перейти к тесту.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setPhase(PHASE.THEORY)}
          className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft size={16} /> Теория
        </button>
        <button
          onClick={() => setPhase(PHASE.QUIZ)}
          className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 shadow-lg shadow-brand-600/30"
        >
          Перейти к тесту <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // ── QUIZ VIEW ─────────────────────────────────────────────────────────────
  const QuizView = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <Zap className="text-violet-600" size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Тест · Урок {activeLesson.id}</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Контрольный тест</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {!submitted && (
            <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${timeLeft < 120 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              <Timer size={14} />
              {fmtTime(timeLeft)}
            </div>
          )}
          <span className="text-sm text-slate-500">{Object.keys(answers).length}/{quiz.length}</span>
        </div>
      </div>

      {submitted && quizScore ? (
        // ── RESULT PANEL ──
        <div className="flex-1 overflow-y-auto">
          <div className={`rounded-3xl p-6 mb-6 ${quizScore.pct >= 60 ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900'}`}>
            <div className="flex items-center gap-4">
              {quizScore.pct >= 60
                ? <div className="p-3 rounded-2xl bg-emerald-500"><Trophy className="text-white" size={28} /></div>
                : <div className="p-3 rounded-2xl bg-rose-500"><XCircle className="text-white" size={28} /></div>
              }
              <div>
                <h2 className={`text-2xl font-black ${quizScore.pct >= 60 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {quizScore.pct >= 60 ? '🎉 Тест пройден!' : '❌ Попробуйте снова'}
                </h2>
                <p className={`text-sm ${quizScore.pct >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  Правильных ответов: {quizScore.correct} из {quizScore.total} ({quizScore.pct}%)
                </p>
              </div>
              <div className="ml-auto text-right">
                <div className={`text-4xl font-black ${quizScore.pct >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>{quizScore.pct}%</div>
                <div className="text-xs text-slate-500">Порог прохождения: 60%</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-3 rounded-full bg-white/50 dark:bg-black/20">
              <div className={`h-3 rounded-full transition-all ${quizScore.pct >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${quizScore.pct}%` }} />
            </div>
          </div>

          {/* Answer review */}
          <div className="space-y-4">
            {quiz.map((q, qi) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct;
              return (
                <div key={q.id} className={`rounded-2xl p-4 border ${isCorrect ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20'}`}>
                  <div className="flex items-start gap-2 mb-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>{qi + 1}</div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{q.text?.[lang] || q.text?.ru}</p>
                    <span className={`ml-auto flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${DIFF[q.difficulty]?.cls}`}>{DIFF[q.difficulty]?.label}</span>
                  </div>
                  <div className="space-y-1.5 pl-8">
                    {q.options?.map(opt => (
                      <div key={opt.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                        opt.id === q.correct ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : opt.id === userAns && !isCorrect ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 line-through'
                        : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 border-current">
                          {opt.id === q.correct ? '✓' : opt.id === userAns && !isCorrect ? '✗' : opt.id.toUpperCase()}
                        </span>
                        {opt.text?.[lang] || opt.text?.ru}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3 pb-4">
            {quizScore.pct < 60 && (
              <button onClick={handleRetryQuiz} className="flex items-center gap-2 rounded-2xl px-5 py-3 bg-slate-100 dark:bg-slate-800 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">
                <RotateCcw size={16} /> Пройти снова
              </button>
            )}
            {quizScore.pct >= 60 && (
              <button onClick={goToNextLesson} disabled={!lessons.find(l => l.id === activeId + 1)}
                className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-brand-600 text-white font-bold hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-600/30">
                Следующий урок <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        // ── QUIZ QUESTIONS ──
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {quiz.map((q, qi) => (
              <div key={q.id} className="glass rounded-3xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {qi + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{q.text?.[lang] || q.text?.ru}</p>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${DIFF[q.difficulty]?.cls}`}>{DIFF[q.difficulty]?.label}</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 pl-11">
                  {q.options?.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt.id }))}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-all border-2 ${
                        answers[q.id] === opt.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${answers[q.id] === opt.id ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {opt.id.toUpperCase()}
                      </span>
                      {opt.text?.[lang] || opt.text?.ru}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 pb-4">
            <button onClick={() => setPhase(PHASE.PRACTICE)}
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft size={16} /> Практика
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length < quiz.length}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-sm transition-all ${
                Object.keys(answers).length >= quiz.length
                  ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              Сдать тест
              <span className="text-xs opacity-70">({Object.keys(answers).length}/{quiz.length})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-2 sm:px-4 py-3 sm:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-3 sm:mb-6 overflow-hidden">
          <Link href="/courses" className="hover:text-brand-600 flex items-center gap-1 flex-shrink-0">
            <ChevronLeft size={14} /> Курсы
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{content?.title}</span>
          <span className="flex-shrink-0">/</span>
          <span className="text-brand-600 flex-shrink-0">Урок {activeId}</span>
        </div>

        <div className="flex gap-3 sm:gap-6 items-start">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Phase tabs */}
            <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden mb-4">
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                {[
                  { id: PHASE.THEORY, icon: BookOpen, label: 'Теория' },
                  { id: PHASE.PRACTICE, icon: Target, label: 'Практика' },
                  { id: PHASE.QUIZ, icon: Zap, label: 'Тест' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === PHASE.PRACTICE && !theoryRead && !passed) return;
                      if (tab.id === PHASE.QUIZ && !theoryRead && !passed) return;
                      setPhase(tab.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all flex-1 justify-center ${
                      phase === tab.id
                        ? 'bg-brand-600 text-white'
                        : (tab.id !== PHASE.THEORY && !theoryRead && !passed)
                          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon size={15} />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                    <span className="inline sm:hidden text-[10px]">{tab.label}</span>
                    {passed && tab.id === PHASE.QUIZ && (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    )}
                    {(!theoryRead && !passed && tab.id !== PHASE.THEORY) && (
                      <Lock size={10} className="opacity-50" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 sm:p-6" style={{ minHeight: '60vh' }}>
                {phase === PHASE.THEORY && <TheoryView />}
                {phase === PHASE.PRACTICE && <PracticeView />}
                {phase === PHASE.QUIZ && <QuizView />}
              </div>
            </div>

            {/* Mobile lesson nav */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {lessons.map(l => {
                const lPassed = progress[l.id]?.passed;
                const locked = !isUnlocked(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => !locked && setActiveId(l.id)}
                    disabled={locked}
                    className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                      l.id === activeId ? 'bg-brand-600 text-white'
                      : locked ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed'
                      : lPassed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600'
                    }`}
                  >
                    {locked ? <Lock size={12} /> : lPassed ? '✓' : l.id}
                  </button>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </Shell>
  );
}
