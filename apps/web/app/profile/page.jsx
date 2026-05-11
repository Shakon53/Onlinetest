'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, BookOpen, Calendar, CheckCircle2, Edit3, GraduationCap, Languages, Save, TrendingUp, X } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { getSession, apiRequest } from '../../lib/api';
import { courses } from '../../lib/data';
import { languages } from '../../lib/i18n';

const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: BookOpen, label: { ru: 'Первый урок', en: 'First lesson', kk: 'Алғашқы сабақ' }, unlocked: true },
  { id: 'streak_7', icon: TrendingUp, label: { ru: '7 дней подряд', en: '7 day streak', kk: '7 күн қатарынан' }, unlocked: true },
  { id: 'first_cert', icon: Award, label: { ru: 'Первый сертификат', en: 'First certificate', kk: 'Алғашқы сертификат' }, unlocked: false },
  { id: 'top_10', icon: GraduationCap, label: { ru: 'Топ 10', en: 'Top 10', kk: 'Топ 10' }, unlocked: false }
];

export default function ProfilePage() {
  const { lang, setLang, t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', preferredLanguage: 'ru' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace('/auth/login'); return; }
    setUser(session);
    setForm({ name: session.name, preferredLanguage: session.preferredLanguage || 'ru' });
  }, [router]);

  async function handleSave() {
    setSaving(true);
    try {
      setLang(form.preferredLanguage);
      const stored = JSON.parse(localStorage.getItem('lms_user') || '{}');
      const updated = { ...stored, name: form.name, preferredLanguage: form.preferredLanguage };
      localStorage.setItem('lms_user', JSON.stringify(updated));
      setUser(updated);
      setMsg(t.success);
      setEditing(false);
    } catch {
      setMsg(t.error);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  if (!user) return null;

  const completedCourses = courses.filter((c) => c.progress === 100);
  const activeCourses = courses.filter((c) => c.progress > 0 && c.progress < 100);
  const avgProgress = Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length);

  const roleColors = { admin: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40', teacher: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40', student: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' };

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left: profile card */}
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-600 to-purple-600 text-4xl font-black text-white shadow-lg">
                {user.name?.[0]?.toUpperCase()}
              </div>

              {editing ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border-0 bg-white px-4 py-2 text-center text-sm dark:bg-slate-900"
                    placeholder={t.name}
                  />
                  <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 dark:bg-slate-900">
                    <Languages size={16} className="text-slate-400" />
                    <select
                      value={form.preferredLanguage}
                      onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                      className="flex-1 border-0 bg-transparent text-sm focus:outline-none"
                    >
                      {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 py-2 text-sm font-semibold text-white disabled:opacity-60">
                      <Save size={14} />{t.saveProfile}
                    </button>
                    <button onClick={() => setEditing(false)} className="rounded-2xl bg-white px-3 py-2 dark:bg-slate-900">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mt-4 text-2xl font-black">{user.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${roleColors[user.role] || roleColors.student}`}>
                    {user.role}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-2 text-sm font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Edit3 size={14} />{t.editProfile}
                  </button>
                </>
              )}

              {msg && (
                <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${msg === t.success ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'}`}>
                  {msg}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold">{t.stats}</h3>
              <div className="mt-4 space-y-3">
                {[
                  { label: t.gpa, value: '3.72' },
                  { label: t.currentScore, value: '88/100' },
                  { label: t.rank, value: '#12' },
                  { label: t.totalProgress, value: `${avgProgress}%` }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="font-bold text-brand-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="space-y-6">
            {/* Course summary */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-xl font-bold">{t.courseProgress}</h3>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                  <p className="text-3xl font-black text-emerald-600">{completedCourses.length}</p>
                  <p className="text-xs text-slate-500">{t.completedCourses}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                  <p className="text-3xl font-black text-blue-600">{activeCourses.length}</p>
                  <p className="text-xs text-slate-500">{t.activeCourses}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                  <p className="text-3xl font-black text-brand-600">{avgProgress}%</p>
                  <p className="text-xs text-slate-500">{t.totalProgress}</p>
                </div>
              </div>

              {/* Course list */}
              <div className="mt-5 space-y-3">
                {courses.map((course) => {
                  const tr = course.translations[lang] || course.translations.en;
                  return (
                    <div key={course.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 dark:bg-slate-900">
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">{tr.title}</p>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${course.progress}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{course.progress}%</span>
                      {course.examAccess && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-xl font-bold">{t.achievements}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map((ach) => (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-3 rounded-2xl p-4 ${ach.unlocked ? 'bg-white dark:bg-slate-900' : 'bg-slate-100/50 dark:bg-slate-800/30 opacity-50'}`}
                  >
                    <div className={`rounded-2xl p-2 ${ach.unlocked ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <ach.icon size={20} className={ach.unlocked ? 'text-amber-600' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{ach.label[lang]}</p>
                      <p className="text-xs text-slate-500">{ach.unlocked ? t.achievementUnlocked : t.locked}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
