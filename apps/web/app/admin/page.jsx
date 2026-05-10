'use client';

import { Ban, Languages, LineChart, ShieldCheck, Users } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';

export default function AdminPage() {
  const { t } = useI18n();
  const items = [
    { label: t.adminUsers, icon: Users },
    { label: t.navCourses, icon: ShieldCheck },
    { label: 'Block users', icon: Ban },
    { label: t.analytics, icon: LineChart },
    { label: t.certificates, icon: ShieldCheck },
    { label: 'Languages', icon: Languages }
  ];
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-4xl font-black">{t.navAdmin}</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <div key={item.label} className="glass card-hover rounded-3xl p-6"><item.icon className="mb-4 text-brand-600" /><h2 className="text-xl font-bold">{item.label}</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage platform data with role-protected backend APIs.</p></div>)}
        </div>
      </section>
    </Shell>
  );
}
