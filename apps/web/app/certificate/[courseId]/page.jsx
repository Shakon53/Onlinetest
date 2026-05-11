'use client';

import { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Share2, Award, CheckCircle2, Star } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { courses } from '../../../lib/data';

export default function CertificatePage({ params }) {
  const { courseId } = use(params);
  const { lang } = useI18n();
  const certRef = useRef(null);

  const course = courses.find(c => c.id === courseId);
  const content = course?.translations?.[lang] || course?.translations?.ru;

  const [user, setUser] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [certId, setCertId] = useState('');

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('lms_user') || 'null');
    setUser(session);
    const result = JSON.parse(localStorage.getItem(`exam_${courseId}`) || 'null');
    setExamResult(result);
    // Generate deterministic cert ID
    const seed = `${courseId}-${session?.email || 'anon'}-${result?.date || Date.now()}`;
    setCertId('CERT-' + btoa(seed).replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 12));
  }, [courseId]);

  const issueDate = examResult?.date
    ? new Date(examResult.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  if (!course) return <Shell><div className="p-10 text-center text-slate-400">Курс не найден</div></Shell>;

  if (!examResult?.passed) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <Award className="mx-auto mb-4 text-slate-300" size={56} />
          <h2 className="text-2xl font-black mb-2">Сертификат недоступен</h2>
          <p className="text-slate-500 mb-6">Сначала успешно сдайте итоговый экзамен (70%+).</p>
          <Link href={`/courses/${courseId}/exam`}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-white font-bold hover:bg-brand-500">
            Перейти к экзамену
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/courses/${courseId}`}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600">
            <ChevronLeft size={16} /> Назад к курсу
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-sm text-white font-semibold hover:bg-brand-500">
              <Download size={14} /> Скачать / Печать
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Мой сертификат', text: `Я получил сертификат по курсу "${content?.title}"!`, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Ссылка скопирована!');
                }
              }}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
              <Share2 size={14} /> Поделиться
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div ref={certRef} className="certificate-print">
          <div className="relative overflow-hidden rounded-3xl border-4 border-amber-400 bg-white dark:bg-slate-900 shadow-2xl shadow-amber-200/30 dark:shadow-amber-900/20 print:shadow-none print:border-4">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden>
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-400 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-violet-500 translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-brand-500 -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Corner ornaments */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-amber-400 rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-amber-400 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-amber-400 rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-amber-400 rounded-br-xl" />

            <div className="relative px-12 py-10 text-center">
              {/* Header */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400" />
                <Award className="text-amber-500" size={32} />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400" />
              </div>

              <p className="text-xs font-bold tracking-[0.3em] text-amber-600 dark:text-amber-400 uppercase mb-1">
                Онлайн Учебная Платформа
              </p>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                СЕРТИФИКАТ
              </h1>
              <p className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-8">
                об успешном прохождении курса
              </p>

              {/* Recipient */}
              <p className="text-sm text-slate-500 mb-2">Настоящим подтверждается, что</p>
              <div className="mb-2">
                <p className="text-4xl font-black text-slate-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
                  {user?.name || 'Студент'}
                </p>
              </div>
              <div className="w-64 mx-auto border-b-2 border-slate-300 dark:border-slate-600 mb-8" />

              <p className="text-sm text-slate-500 mb-2">успешно завершил(а) курс</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                {content?.title}
              </h2>
              <p className="text-sm text-slate-500 mb-8">Преподаватель: {content?.teacher}</p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-emerald-600">{examResult?.pct}%</div>
                  <div className="text-xs text-slate-500">Результат экзамена</div>
                </div>
                <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <div className="text-3xl font-black text-brand-600">12</div>
                  <div className="text-xs text-slate-500">Уроков пройдено</div>
                </div>
                <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <div className="text-3xl font-black text-violet-600">A+</div>
                  <div className="text-xs text-slate-500">Оценка</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between">
                <div className="text-left">
                  <p className="text-xs text-slate-400 mb-1">Дата выдачи</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{issueDate}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Award className="text-white" size={28} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Официальная печать</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">Номер сертификата</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 font-mono text-sm">{certId}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mt-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Verified badge */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-4">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Сертификат верифицирован · ID: {certId}
          </p>
        </div>

        {/* Share card */}
        <div className="mt-4 glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Поделитесь достижением</p>
          <div className="flex gap-2">
            {[
              { label: 'LinkedIn', color: 'bg-blue-600', href: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
              { label: 'Telegram', color: 'bg-sky-500', href: `https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent('Я получил сертификат!')}` },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                className={`${s.color} text-white rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90`}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .certificate-print { padding: 0; }
          header, nav, footer, .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </Shell>
  );
}
