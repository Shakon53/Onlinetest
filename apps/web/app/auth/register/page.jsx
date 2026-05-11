'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest, saveSession } from '../../../lib/api';
import { purgeOldUnprefixedData } from '../../../lib/storage';

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function saveToLocalRegistry(user) {
    const existing = JSON.parse(localStorage.getItem('lms_registered_users') || '[]');
    const already = existing.find(u => u.email === user.email);
    if (!already) {
      existing.push({ ...user, createdAt: new Date().toISOString().split('T')[0] });
      localStorage.setItem('lms_registered_users', JSON.stringify(existing));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const data = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      saveSession(data);
      purgeOldUnprefixedData();
      saveToLocalRegistry(data.user || form);
      const role = data.user?.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'teacher') router.push('/teacher');
      else router.push('/dashboard');
    } catch (error) {
      // If API fails, allow local registration for students
      if (form.role === 'student') {
        const localUser = { name: form.name, email: form.email, role: 'student' };
        saveSession({ user: localUser });
        purgeOldUnprefixedData();
        saveToLocalRegistry(localUser);
        router.push('/dashboard');
      } else {
        setStatus(error.message || 'Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <form onSubmit={handleSubmit} className="glass w-full rounded-3xl p-8">
          <h1 className="text-3xl font-black">{t.register}</h1>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-6 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Full name" required />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Email" type="email" required />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900" placeholder="Password" type="password" required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-3 w-full rounded-2xl border-0 bg-white px-4 py-3 dark:bg-slate-900">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {status && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">{status}</p>}
          <button disabled={loading} className="mt-6 w-full rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Loading...' : t.register}</button>
          <Link href="/auth/login" className="mt-4 block text-center text-sm text-brand-600">{t.login}</Link>
        </form>
      </section>
    </Shell>
  );
}
