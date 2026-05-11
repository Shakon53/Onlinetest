'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Trophy, XCircle } from 'lucide-react';
import { Shell } from '../../../../components/Shell';
import { useI18n } from '../../../../components/I18nProvider';

const DEMO_TEST = {
  title: { ru: 'Контрольный тест', en: 'Module test', kk: 'Бақылау тесті' },
  durationMinutes: 15,
  attemptsLimit: 2,
  passingPercent: 60,
  questions: [
    {
      id: 1,
      text: {
        ru: 'Что такое первичный ключ в реляционной базе данных?',
        en: 'What is a primary key in a relational database?',
        kk: 'Реляциялық дерекқордағы бастапқы кілт дегеніміз не?'
      },
      options: [
        { ru: 'Уникальный идентификатор каждой записи', en: 'Unique identifier for each record', kk: 'Әр жазбаның бірегей идентификаторы' },
        { ru: 'Поле для хранения пароля', en: 'A field for storing passwords', kk: 'Құпия сөзді сақтауға арналған өріс' },
        { ru: 'Внешняя ссылка на другую таблицу', en: 'Foreign reference to another table', kk: 'Басқа кестеге сыртқы сілтеме' },
        { ru: 'Индекс для ускорения запросов', en: 'Index for query optimization', kk: 'Сұрауларды жеделдету индексі' }
      ],
      correct: 0
    },
    {
      id: 2,
      text: {
        ru: 'Какая SQL-команда используется для выборки данных?',
        en: 'Which SQL command is used for data retrieval?',
        kk: 'Деректерді таңдау үшін қандай SQL командасы қолданылады?'
      },
      options: [
        { ru: 'INSERT', en: 'INSERT', kk: 'INSERT' },
        { ru: 'SELECT', en: 'SELECT', kk: 'SELECT' },
        { ru: 'UPDATE', en: 'UPDATE', kk: 'UPDATE' },
        { ru: 'DELETE', en: 'DELETE', kk: 'DELETE' }
      ],
      correct: 1
    },
    {
      id: 3,
      text: {
        ru: 'Что означает аббревиатура ACID в контексте транзакций?',
        en: 'What does ACID stand for in database transactions?',
        kk: 'Транзакциялар контекстінде ACID аббревиатурасы нені білдіреді?'
      },
      options: [
        { ru: 'Atomicity, Consistency, Isolation, Durability', en: 'Atomicity, Consistency, Isolation, Durability', kk: 'Atomicity, Consistency, Isolation, Durability' },
        { ru: 'Automatic, Complete, Isolated, Durable', en: 'Automatic, Complete, Isolated, Durable', kk: 'Automatic, Complete, Isolated, Durable' },
        { ru: 'Atomic, Consistent, Independent, Direct', en: 'Atomic, Consistent, Independent, Direct', kk: 'Atomic, Consistent, Independent, Direct' },
        { ru: 'Available, Concurrent, Integrated, Dynamic', en: 'Available, Concurrent, Integrated, Dynamic', kk: 'Available, Concurrent, Integrated, Dynamic' }
      ],
      correct: 0
    },
    {
      id: 4,
      text: {
        ru: 'В чём разница между WHERE и HAVING в SQL?',
        en: 'What is the difference between WHERE and HAVING in SQL?',
        kk: 'SQL-де WHERE мен HAVING арасындағы айырмашылық неде?'
      },
      options: [
        { ru: 'Никакой разницы нет', en: 'There is no difference', kk: 'Еш айырмашылық жоқ' },
        { ru: 'WHERE фильтрует строки до группировки, HAVING — после', en: 'WHERE filters rows before grouping, HAVING after', kk: 'WHERE топтауға дейін, HAVING кейін сүзеді' },
        { ru: 'HAVING быстрее WHERE', en: 'HAVING is faster than WHERE', kk: 'HAVING WHERE-ден жылдамырақ' },
        { ru: 'WHERE используется только с JOIN', en: 'WHERE is only used with JOIN', kk: 'WHERE тек JOIN-мен қолданылады' }
      ],
      correct: 1
    },
    {
      id: 5,
      text: {
        ru: 'Что такое нормализация базы данных?',
        en: 'What is database normalization?',
        kk: 'Дерекқорды нормалдандыру дегеніміз не?'
      },
      options: [
        { ru: 'Шифрование данных', en: 'Data encryption', kk: 'Деректерді шифрлау' },
        { ru: 'Резервное копирование', en: 'Data backup', kk: 'Резервтік көшіру' },
        { ru: 'Процесс организации данных для уменьшения избыточности', en: 'Process of organizing data to reduce redundancy', kk: 'Артықтықты азайту үшін деректерді ұйымдастыру процесі' },
        { ru: 'Импорт данных из CSV', en: 'Importing data from CSV', kk: 'CSV-тен деректерді импорттау' }
      ],
      correct: 2
    }
  ]
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TestPage({ params }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const { id } = use(params);

  const [phase, setPhase] = useState('intro'); // intro | test | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(DEMO_TEST.durationMinutes * 60);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const questions = DEMO_TEST.questions;
  const totalQ = questions.length;

  useEffect(() => {
    if (phase === 'test') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timerRef.current); submitTest(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function startTest() {
    setPhase('test');
    setAnswers({});
    setCurrent(0);
    setTimeLeft(DEMO_TEST.durationMinutes * 60);
  }

  function submitTest() {
    clearInterval(timerRef.current);
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    const pct = Math.round((correct / totalQ) * 100);
    setResult({ correct, total: totalQ, percent: pct, passed: pct >= DEMO_TEST.passingPercent });
    setPhase('result');
  }

  const q = questions[current];

  if (phase === 'intro') return (
    <Shell>
      <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4">
        <div className="glass w-full rounded-3xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-600 text-white">
            <Trophy size={36} />
          </div>
          <h1 className="text-3xl font-black">{DEMO_TEST.title[lang]}</h1>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-2xl font-black">{totalQ}</p>
              <p className="text-sm text-slate-500">{t.totalQuestions}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-2xl font-black">{DEMO_TEST.durationMinutes}</p>
              <p className="text-sm text-slate-500">min</p>
            </div>
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-2xl font-black">{DEMO_TEST.attemptsLimit}</p>
              <p className="text-sm text-slate-500">{t.attempts}</p>
            </div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-300">
            {t.passingScore}: {DEMO_TEST.passingPercent}% · {t.timer}: {DEMO_TEST.durationMinutes}:00
          </p>
          <button onClick={startTest} className="mt-8 w-full rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white transition hover:bg-brand-500">
            {t.startTest}
          </button>
          <button onClick={() => router.back()} className="mt-3 w-full rounded-2xl py-3 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            {t.back}
          </button>
        </div>
      </section>
    </Shell>
  );

  if (phase === 'result') return (
    <Shell>
      <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4">
        <div className="glass w-full rounded-3xl p-8 text-center">
          {result.passed ? (
            <CheckCircle2 size={64} className="mx-auto mb-4 text-emerald-500" />
          ) : (
            <XCircle size={64} className="mx-auto mb-4 text-rose-500" />
          )}
          <h1 className="text-3xl font-black">{t.testResult}</h1>
          <p className={`mt-2 text-xl font-bold ${result.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
            {result.passed ? t.passed : t.failed}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-3xl font-black text-brand-600">{result.percent}%</p>
              <p className="text-sm text-slate-500">{t.score}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-3xl font-black text-emerald-600">{result.correct}</p>
              <p className="text-sm text-slate-500">{t.correctAnswers}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <p className="text-3xl font-black">{result.total}</p>
              <p className="text-sm text-slate-500">{t.totalQuestions}</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-6 h-3 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${result.passed ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}
              style={{ width: `${result.percent}%` }}
            />
          </div>

          <div className="mt-8 flex gap-3">
            {!result.passed && (
              <button onClick={startTest} className="flex-1 rounded-2xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-500">
                Retry
              </button>
            )}
            <button
              onClick={() => router.push(`/courses/${id}`)}
              className={`${result.passed ? 'w-full' : 'flex-1'} rounded-2xl bg-white py-3 font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800`}
            >
              {t.back}
            </button>
          </div>
        </div>
      </section>
    </Shell>
  );

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{t.question} {current + 1} {t.of} {totalQ}</p>
            <div className="mt-2 flex gap-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 flex-1 rounded-full transition ${
                    i === current ? 'bg-brand-600' : answers[questions[i].id] !== undefined ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono font-bold ${timeLeft < 120 ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40' : 'bg-white shadow-sm dark:bg-slate-900'}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question card */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-bold leading-relaxed">{q.text[lang]}</h2>

          <div className="mt-6 space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                className={`w-full rounded-2xl border-2 px-6 py-4 text-left text-sm font-medium transition ${
                  answers[q.id] === i
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-blue-300'
                    : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600'
                }`}
              >
                <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                {opt[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm disabled:opacity-40 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={18} />{t.prevQuestion}
          </button>

          <span className="text-sm text-slate-500">
            {Object.keys(answers).length}/{totalQ} answered
          </span>

          {current < totalQ - 1 ? (
            <button
              onClick={() => setCurrent((p) => p + 1)}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t.nextQuestion}<ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={submitTest}
              className="flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-500"
            >
              {t.submitTest}
            </button>
          )}
        </div>
      </section>
    </Shell>
  );
}
