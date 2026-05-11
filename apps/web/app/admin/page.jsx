'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Award, Ban, BarChart3, BookOpen, Languages, LineChart, Shield, Users } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { getSession, apiRequest } from '../../lib/api';

export default function AdminPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({ users: 248, courses: 96, certificates: 1204, progressRecords: 2150 });

  useEffect(() => {
    const user = getSession();
    if (!user) { router.replace('/auth/login'); return; }
    if (user.role !== 'admin') { router.replace('/dashboard'); return; }
    setReady(true);
    apiRequest('/admin/analytics').then((data) => setStats(data)).catch(() => {});
  }, [router]);

  if (!ready) return null;

  const quickStats = [
    { label: t.totalUsers, value: stats.users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: t.courses, value: stats.courses, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: t.certificates, value: stats.certificates, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Progress Records', value: stats.progressRecords, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' }
  ];

  const panels = [
    { href: '/admin/users', icon: Users, label: t.manageUsers, desc: 'View, block, and manage all platform users.', color: 'text-blue-600' },
    { href: '/admin/analytics', icon: BarChart3, label: t.platformAnalytics, desc: 'Enrollment trends, completion rates and GPA reports.', color: 'text-violet-600' },
    { href: '/courses', icon: BookOpen, label: t.manageCourses, desc: 'Browse and manage published and draft courses.', color: 'text-emerald-600' },
    { href: '/admin/users', icon: Ban, label: 'Block / Unblock', desc: 'Restrict access for users violating platform rules.', color: 'text-rose-600' },
    { href: '/certificate', icon: Award, label: t.certificates, desc: 'View issued certificates and revoke if needed.', color: 'text-amber-600' },
    { href: '/admin/analytics', icon: Languages, label: 'Languages & Settings', desc: 'Manage multilingual content and platform configuration.', color: 'text-teal-600' }
  ];

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-rose-600 p-3 text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black">{t.adminTitle}</h1>
            <p className="text-slate-500">Full platform control</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((s) => (
            <div key={s.label} className={`glass rounded-3xl p-5 ${s.bg}`}>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{s.label}</p>
              <p className={`mt-2 text-4xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Panel links */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {panels.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="glass card-hover rounded-3xl p-6 block"
            >
              <div className={`mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900 ${item.color}`}>
                <item.icon size={22} />
              </div>
              <h2 className="text-xl font-bold">{item.label}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
