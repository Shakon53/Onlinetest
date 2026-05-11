'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Award, BookOpen, CheckCircle2, GraduationCap, LayoutDashboard, Play, Sparkles, Star, Trophy, Users, Zap } from 'lucide-react';
import { Shell } from '../components/Shell';
import { CourseCard } from '../components/CourseCard';
import { useI18n } from '../components/I18nProvider';
import { courses } from '../lib/data';

const PLATFORM_STATS = [
  { value: '12.8K', label: null, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { value: '96', label: null, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40' },
  { value: '4.2K', label: null, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  { value: '87%', label: null, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' }
];

const TESTIMONIALS = [
  { name: 'Aruzhan Seitkali', role: 'Student, 3rd year', avatar: 'A', text: 'The platform helped me track my progress in every subject. The locked lesson system keeps me on track without skipping ahead.', rating: 5 },
  { name: 'Mikhail Ivanov', role: 'Student, 4th year', avatar: 'M', text: 'I love the clean interface and the real-time leaderboard. Competing with classmates keeps me motivated to study every day.', rating: 5 },
  { name: 'Dana Bekova', role: 'Student, 2nd year', avatar: 'D', text: 'Getting a verifiable certificate with a QR code after finishing a course feels like a real achievement. Highly recommended!', rating: 5 }
];

const FEATURES = [
  { icon: CheckCircle2, label: { ru: 'Строгая последовательность уроков', en: 'Strict lesson sequencing', kk: 'Сабақтардың қатаң реті' }, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { icon: Zap, label: { ru: 'Тесты с таймером и автопроверкой', en: 'Timed tests with auto-grading', kk: 'Таймермен автотексеру тесттері' }, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { icon: Award, label: { ru: 'PDF сертификаты с QR верификацией', en: 'PDF certificates with QR verification', kk: 'QR верификациялы PDF сертификаттар' }, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  { icon: Trophy, label: { ru: 'Лидерборд и система достижений', en: 'Leaderboard and achievements', kk: 'Лидерборд және жетістіктер' }, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { icon: Sparkles, label: { ru: 'AI рекомендации и генератор тестов', en: 'AI recommendations and test generator', kk: 'AI ұсыныстары және тест генераторы' }, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { icon: Users, label: { ru: 'Чат с преподавателем', en: 'Chat with teacher', kk: 'Оқытушымен чат' }, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' }
];

const CATEGORIES = [
  { name: 'Programming', emoji: '💻', count: 12 },
  { name: 'Data', emoji: '📊', count: 8 },
  { name: 'Network', emoji: '🌐', count: 6 },
  { name: 'AI', emoji: '🤖', count: 9 },
  { name: 'Practice', emoji: '🏭', count: 4 },
  { name: 'IT', emoji: '🔧', count: 7 }
];

export default function HomePage() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('lms_user') || 'null');
      setUser(session);
    } catch {}
  }, []);

  const statLabels = [t.students, t.courses, t.certificates, t.completion];

  return (
    <Shell>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm dark:bg-slate-900 dark:text-blue-300">
            <Sparkles size={16} />
            AI-powered LMS · 3 languages
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
            {t.heroTitle}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {t.heroText}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-500">
                  <LayoutDashboard size={18} />{t.navDashboard}
                </Link>
                <Link href="/courses" className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <BookOpen size={18} />{t.navCourses}
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" className="flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-500">
                  <GraduationCap size={18} />{t.startLearning}
                </Link>
                <Link href="/courses" className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <BookOpen size={18} />{t.navCourses}
                </Link>
                <Link href="/auth/login" className="rounded-full border border-slate-200 px-6 py-3 font-semibold dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900">
                  {t.login}
                </Link>
              </>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['A', 'D', 'Z', 'M', 'N'].map((ch) => (
                <div key={ch} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-500 to-purple-600 text-xs font-bold text-white dark:border-slate-950">
                  {ch}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-slate-500">Trusted by 12,800+ students</p>
            </div>
          </div>
        </div>

        {/* Hero card */}
        <div className="glass rounded-[2rem] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {PLATFORM_STATS.map((stat, i) => (
              <div key={i} className={`rounded-3xl p-5 ${stat.bg}`}>
                <stat.icon size={22} className={`mb-3 ${stat.color}`} />
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-sm text-slate-500">{statLabels[i]}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-gradient-to-br from-brand-600 to-purple-700 p-6 text-white">
            <div className="mb-3 flex items-center gap-2">
              <Trophy size={20} />
              <span className="font-bold">Smart progress tracking</span>
            </div>
            <p className="text-sm text-white/80">
              Sequential lessons · Auto-graded tests · GPA tracking · Certificate generation
            </p>
            <Link href="/courses" className="mt-4 flex items-center gap-2 text-sm font-bold text-white/90 hover:text-white">
              Explore courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black">{lang === 'ru' ? 'Всё необходимое для обучения' : lang === 'kk' ? 'Оқу үшін қажет нәрсенің бәрі' : 'Everything you need to learn'}</h2>
          <p className="mt-2 text-slate-500">{lang === 'ru' ? 'Полноценная LMS-платформа production-уровня' : lang === 'kk' ? 'Толыққанды LMS платформасы' : 'A full production-grade LMS platform'}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.label.en} className={`flex items-center gap-4 rounded-2xl p-4 ${feature.bg}`}>
              <div className={`rounded-xl bg-white p-2.5 shadow-sm dark:bg-slate-900 ${feature.color}`}>
                <feature.icon size={20} />
              </div>
              <p className="font-semibold">{feature.label[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-5 text-2xl font-black">{t.categories}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/courses?category=${cat.name}`}
              className="glass card-hover flex flex-col items-center gap-2 rounded-2xl p-4 text-center"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <p className="text-sm font-bold">{cat.name}</p>
              <p className="text-xs text-slate-400">{cat.count} {lang === 'ru' ? 'курсов' : lang === 'kk' ? 'курс' : 'courses'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── POPULAR COURSES ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">{t.popularCourses}</h2>
          <Link href="/courses" className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">
            {t.navCourses} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="glass rounded-[2rem] p-8 lg:p-12">
          <h2 className="mb-8 text-center text-3xl font-black">
            {lang === 'ru' ? 'Как это работает' : lang === 'kk' ? 'Бұл қалай жұмыс істейді' : 'How it works'}
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { step: '01', icon: GraduationCap, title: { ru: 'Зарегистрируйтесь', en: 'Sign up', kk: 'Тіркеліңіз' }, desc: { ru: 'Создайте аккаунт за 1 минуту', en: 'Create an account in 1 minute', kk: '1 минутта аккаунт жасаңыз' } },
              { step: '02', icon: BookOpen, title: { ru: 'Выберите курс', en: 'Choose a course', kk: 'Курс таңдаңыз' }, desc: { ru: 'Найдите нужный предмет', en: 'Find the subject you need', kk: 'Керекті пәнді табыңыз' } },
              { step: '03', icon: Play, title: { ru: 'Учитесь', en: 'Learn', kk: 'Оқыңыз' }, desc: { ru: 'Смотрите видео, проходите тесты', en: 'Watch videos, pass tests', kk: 'Видео қараңыз, тестті өтіңіз' } },
              { step: '04', icon: Award, title: { ru: 'Получите сертификат', en: 'Get certificate', kk: 'Сертификат алыңыз' }, desc: { ru: 'PDF с QR верификацией', en: 'PDF with QR verification', kk: 'QR верификациялы PDF' } }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                {i < 3 && <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-slate-200 dark:bg-slate-700 md:block" style={{ width: 'calc(100% - 3rem)', left: '4rem' }} />}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-lg">
                  <item.icon size={26} />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-brand-600 shadow">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-4 font-black">{item.title[lang]}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.desc[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-6 text-2xl font-black">{t.testimonials}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((review) => (
            <div key={review.name} className="glass card-hover rounded-3xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-lg font-black text-white">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
              </div>
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">"{review.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-[2rem] bg-gradient-to-br from-brand-600 to-violet-700 px-8 py-14 text-center text-white">
          <GraduationCap size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-4xl font-black">
            {lang === 'ru' ? 'Начни учиться сегодня' : lang === 'kk' ? 'Бүгін оқуды бастаңыз' : 'Start learning today'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            {lang === 'ru' ? 'Присоединяйтесь к 12 800 студентам которые уже учатся на нашей платформе.' : lang === 'kk' ? '12 800 студентке қосылыңыз, олар платформамызда оқып жатыр.' : 'Join 12,800 students already learning on our platform.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Link href="/dashboard" className="rounded-full bg-white px-8 py-3 font-bold text-brand-700 shadow-lg hover:bg-slate-50">
                {t.navDashboard}
              </Link>
            ) : (
              <Link href="/auth/register" className="rounded-full bg-white px-8 py-3 font-bold text-brand-700 shadow-lg hover:bg-slate-50">
                {t.register} — {lang === 'ru' ? 'бесплатно' : lang === 'kk' ? 'тегін' : 'it\'s free'}
              </Link>
            )}
            <Link href="/courses" className="rounded-full border-2 border-white/40 px-8 py-3 font-bold text-white hover:border-white">
              {t.navCourses}
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
