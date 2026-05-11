'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Bell, BellOff, BookOpen, CheckCheck, CheckCircle2, Trophy } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { getSession } from '../../lib/api';

const DEMO_NOTIFS = [
  { id: 1, type: 'lesson', icon: BookOpen, read: false, time: '2 мин назад / 2 min ago / 2 мин бұрын', text: { ru: 'Новый урок доступен: Практическая работа по SQL', en: 'New lesson available: SQL practical assignment', kk: 'Жаңа сабақ: SQL практикалық жұмысы' } },
  { id: 2, type: 'test', icon: CheckCircle2, read: false, time: '1 час назад / 1 hour ago / 1 сағат бұрын', text: { ru: 'Тест пройден: 88% — результат сохранён', en: 'Test passed: 88% — result saved', kk: 'Тест өтті: 88% — нәтиже сақталды' } },
  { id: 3, type: 'cert', icon: Award, read: true, time: '2 дня назад / 2 days ago / 2 күн бұрын', text: { ru: 'Сертификат выдан за курс "Java Programming"', en: 'Certificate issued for "Java Programming" course', kk: '"Java Programming" курсы үшін сертификат берілді' } },
  { id: 4, type: 'rank', icon: Trophy, read: true, time: '3 дня назад / 3 days ago / 3 күн бұрын', text: { ru: 'Вы поднялись на 3 позиции в лидерборде!', en: 'You moved up 3 positions in the leaderboard!', kk: 'Сіз лидербордта 3 позицияға өстіңіз!' } },
  { id: 5, type: 'lesson', icon: BookOpen, read: true, time: '1 неделю назад / 1 week ago / 1 апта бұрын', text: { ru: 'Преподаватель оставил комментарий к вашему заданию', en: 'Teacher left a comment on your homework', kk: 'Оқытушы сіздің тапсырмаңызға пікір қалдырды' } }
];

export default function NotificationsPage() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/auth/login'); return; }
    setUser(session);
  }, [router]);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  if (!user) return null;

  const unread = notifs.filter((n) => !n.read).length;

  function getTime(timeStr) {
    const parts = timeStr.split(' / ');
    if (lang === 'ru') return parts[0];
    if (lang === 'en') return parts[1];
    return parts[2];
  }

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{t.notifications}</h1>
            {unread > 0 && <p className="mt-1 text-sm text-slate-500">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <CheckCheck size={16} className="text-brand-600" />
              {t.markAllRead}
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellOff size={48} className="text-slate-300" />
            <p className="mt-4 text-xl font-semibold text-slate-500">{t.noNotifications}</p>
          </div>
        ) : (
          <div className="glass rounded-3xl p-2 space-y-1">
            {notifs.map((notif) => (
              <button
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-white dark:bg-slate-900/50'}`}
              >
                <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${!notif.read ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                  <notif.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!notif.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {notif.text[lang]}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{getTime(notif.time)}</p>
                </div>
                {!notif.read && (
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
