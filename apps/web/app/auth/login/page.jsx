'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest, saveSession } from '../../../lib/api';

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      saveSession(data);
      const role = data.user?.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'teacher') router.push('/teacher');
      else router.push('/dashboard');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <form onSubmit={handleSubmit} className="glass w-full rounded-3xl p-8">
          <h1 className="text-3xl font-black">{t.login}</h1>
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-6 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Email" type="email" required />
          <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Password" type="password" required />
          {status && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">{status}</p>}
          <button disabled={loading} className="mt-6 w-full rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Loading...' : t.login}</button>
          <Link href="/auth/register" className="mt-4 block text-center text-sm text-brand-600">{t.register}</Link>
        </form>
      </section>
    </Shell>
  );
}
