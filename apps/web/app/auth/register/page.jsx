'use client';

import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';

export default function RegisterPage() {
  const { t } = useI18n();
  return (
    <Shell>
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <form className="glass w-full rounded-3xl p-8">
          <h1 className="text-3xl font-black">{t.register}</h1>
          <input className="mt-6 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Full name" />
          <input className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Email" />
          <input className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Password" type="password" />
          <select className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900"><option>Student</option><option>Teacher</option></select>
          <button className="mt-6 w-full rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white">{t.register}</button>
        </form>
      </section>
    </Shell>
  );
}
