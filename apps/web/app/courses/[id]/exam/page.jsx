'use client';

import { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Timer, Trophy, XCircle, RotateCcw, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Shell } from '../../../../components/Shell';
import { useI18n } from '../../../../components/I18nProvider';
import { courses, getLessons } from '../../../../lib/data';

const EXAM_SECONDS = 60 * 60; // 60 minutes
const EXAM_PASS = 0.70; // 70%
const QUESTIONS_PER_EXAM = 25;

const DIFF = {
  easy: { label: 'Лёгкий', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  medium: { label: 'Средний', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  hard: { label: 'Сложный', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

export default function ExamPage({ params }) {
  const { id } = use(params);
  const { lang } = useI18n();
  const router = useRouter();
  const course = courses.find(c => c.id === id);
  const lessons = getLessons(id);
  const content = course?.translations?.[lang] || course?.translations?.ru;

  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('lms_user') || 'null');
    if (!user) router.replace(`/auth/login?redirect=/courses/${id}/exam`);
    else setAuthReady(true);
  }, [id]);

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const timerRef = useRef(null);

  // Check if all lessons passed
  const [allPassed, setAllPassed] = useState(false);
  useEffect(() => {
    const prog = JSON.parse(localStorage.getItem(`progress_${id}`) || '{}');
    const passed = lessons.every(l => prog[l.id]?.passed);
    setAllPassed(passed);

    // Check existing exam result
    const examResult = JSON.parse(localStorage.getItem(`exam_${id}`) || 'null');
    if (examResult) { setScore(examResult); setSubmitted(true); }
  }, [id]);

  function buildExam() {
    // Collect all quiz questions from all lessons
    const all = [];
    lessons.forEach(l => {
      (l.quiz || []).forEach(q => all.push({ ...q, lessonId: l.id, lessonTitle: l.title?.ru }));
    });
    // Sample evenly from easy/medium/hard
    const easy = shuffle(all.filter(q => q.difficulty === 'easy'));
    const medium = shuffle(all.filter(q => q.difficulty === 'medium'));
    const hard = shuffle(all.filter(q => q.difficulty === 'hard'));
    const picked = [
      ...easy.slice(0, 8),
      ...medium.slice(0, 10),
      ...hard.slice(0, 7),
    ].slice(0, QUESTIONS_PER_EXAM);
    return shuffle(picked);
  }

  function startExam() {
    const qs = buildExam();
    setQuestions(qs);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setTimeLeft(EXAM_SECONDS);
    setStarted(true);
  }

  // Timer
  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitExam(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  function submitExam() {
    clearInterval(timerRef.current);
    let correct = 0;
    questions.forEach(q => { if (answers[q.id + '_' + q.lessonId] === q.correct) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    const passed = pct >= 70;
    const result = { correct, total: questions.length, pct, passed, date: Date.now() };
    setScore(result);
    setSubmitted(true);
    localStorage.setItem(`exam_${id}`, JSON.stringify(result));

    // Mark exam passed in achievements
    if (passed) {
      const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
      if (!achievements.includes(`exam_${id}`)) {
        achievements.push(`exam_${id}`);
        localStorage.setItem('achievements', JSON.stringify(achievements));
      }
    }
  }

  if (!authReady) return <Shell><div className="flex min-h-[50vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div></Shell>;

  if (!course) return <Shell><div className="p-10 text-center text-slate-400">Курс не найден</div></Shell>;

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href={`/courses/${id}`} className="hover:text-brand-600 flex items-center gap-1">
            <ChevronLeft size={14} /> {content?.title}
          </Link>
          <span>/</span>
          <span className="text-brand-600 font-semibold">Итоговый экзамен</span>
        </div>

        {/* Not all lessons passed */}
        {!allPassed && !submitted && (
          <div className="glass rounded-3xl p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-amber-500" size={48} />
            <h2 className="text-2xl font-black mb-2">Экзамен недоступен</h2>
            <p className="text-slate-500 mb-6">Для доступа к итоговому экзамену необходимо пройти все 12 уроков курса.</p>
            <Link href={`/courses/${id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-white font-bold hover:bg-brand-500">
              <ChevronLeft size={16} /> Вернуться к урокам
            </Link>
          </div>
        )}

        {/* Existing result */}
        {submitted && score && (
          <div className="space-y-6">
            <div className={`glass rounded-3xl p-8 ${score.passed ? 'border-2 border-emerald-400' : 'border-2 border-rose-400'}`}>
              <div className="flex items-center gap-5">
                {score.passed
                  ? <div className="p-4 rounded-3xl bg-emerald-500"><Trophy className="text-white" size={40} /></div>
                  : <div className="p-4 rounded-3xl bg-rose-500"><XCircle className="text-white" size={40} /></div>
                }
                <div className="flex-1">
                  <h1 className={`text-3xl font-black ${score.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {score.passed ? '🎓 Экзамен сдан!' : '❌ Экзамен не сдан'}
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Правильных ответов: {score.correct} из {score.total} ({score.pct}%)
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(score.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-black ${score.passed ? 'text-emerald-600' : 'text-rose-600'}`}>{score.pct}%</div>
                  <div className="text-xs text-slate-400 mt-1">Порог: 70%</div>
                </div>
              </div>

              <div className="mt-5 h-4 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={`h-4 rounded-full transition-all ${score.passed ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}
                  style={{ width: `${score.pct}%` }} />
              </div>

              <div className="mt-6 flex gap-3 flex-wrap">
                {score.passed && (
                  <Link href={`/certificate/${id}`}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-white font-bold hover:opacity-90 shadow-lg">
                    <GraduationCap size={18} /> Получить сертификат
                  </Link>
                )}
                <button onClick={() => { setSubmitted(false); setScore(null); setStarted(false); }}
                  className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">
                  <RotateCcw size={16} /> Пересдать
                </button>
                <Link href={`/courses/${id}`}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                  <ChevronLeft size={16} /> К урокам
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Intro / Start */}
        {allPassed && !started && !submitted && (
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500">
                <GraduationCap className="text-white" size={36} />
              </div>
              <div>
                <h1 className="text-3xl font-black">Итоговый экзамен</h1>
                <p className="text-slate-500">{content?.title}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {[
                { icon: '📝', label: 'Вопросов', val: QUESTIONS_PER_EXAM },
                { icon: '⏱️', label: 'Время', val: '60 мин' },
                { icon: '🎯', label: 'Порог сдачи', val: '70%' },
              ].map(item => (
                <div key={item.label} className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                  <div className="text-3xl mb-1">{item.icon}</div>
                  <div className="text-2xl font-black">{item.val}</div>
                  <div className="text-sm text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 mb-8">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Правила экзамена</p>
              <ul className="text-sm text-amber-600 dark:text-amber-500 space-y-1">
                <li>• Вопросы выбираются случайно из всех 12 уроков</li>
                <li>• Для успешной сдачи необходимо набрать 70% и выше</li>
                <li>• Таймер начинается сразу после старта</li>
                <li>• При нехватке времени тест сдаётся автоматически</li>
              </ul>
            </div>

            <button onClick={startExam}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 py-4 text-white font-black text-lg hover:opacity-90 shadow-xl shadow-brand-600/30">
              <GraduationCap size={24} /> Начать экзамен
            </button>
          </div>
        )}

        {/* Active exam */}
        {started && !submitted && (
          <div>
            {/* Sticky header */}
            <div className="sticky top-0 z-10 glass rounded-3xl p-4 mb-6 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Ответов: {Object.keys(answers).length} / {questions.length}</span>
                  <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
                </div>
              </div>
              <div className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-bold text-sm flex-shrink-0 ${timeLeft < 300 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                <Timer size={16} />
                {fmtTime(timeLeft)}
              </div>
              <button onClick={submitExam}
                disabled={Object.keys(answers).length < questions.length}
                className={`rounded-2xl px-5 py-2 font-bold text-sm flex-shrink-0 transition-all ${Object.keys(answers).length >= questions.length ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                Сдать
              </button>
            </div>

            <div className="space-y-5">
              {questions.map((q, qi) => {
                const key = `${q.id}_${q.lessonId}`;
                return (
                  <div key={key} className="glass rounded-3xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">{qi + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{q.text?.[lang] || q.text?.ru}</p>
                          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${DIFF[q.difficulty]?.cls}`}>{DIFF[q.difficulty]?.label}</span>
                        </div>
                        <p className="text-xs text-slate-400">Урок {q.lessonId}: {q.lessonTitle}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 pl-11">
                      {q.options?.map(opt => (
                        <button key={opt.id}
                          onClick={() => setAnswers(a => ({ ...a, [key]: opt.id }))}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-all border-2 ${
                            answers[key] === opt.id
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-300'
                          }`}>
                          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${answers[key] === opt.id ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                            {opt.id.toUpperCase()}
                          </span>
                          {opt.text?.[lang] || opt.text?.ru}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit at bottom */}
            <div className="mt-6 pb-4">
              <button onClick={submitExam}
                className={`w-full rounded-2xl py-4 font-black text-base transition-all ${Object.keys(answers).length >= questions.length ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:opacity-90 shadow-xl' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                Сдать экзамен ({Object.keys(answers).length}/{questions.length} ответов)
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
