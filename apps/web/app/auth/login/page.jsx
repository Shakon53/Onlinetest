'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest, saveSession } from '../../../lib/api';

// Local demo accounts — work without backend
const LOCAL_ACCOUNTS = [
  { email: 'admin1@lms.kz',   password: 'Admin@1234',   role: 'admin',   name: 'Администратор 1' },
  { email: 'admin2@lms.kz',   password: 'Admin@5678',   role: 'admin',   name: 'Администратор 2' },
  { email: 'teacher1@lms.kz', password: 'Teacher@1234', role: 'teacher', name: 'Преподаватель 1' },
  { email: 'teacher2@lms.kz', password: 'Teacher@5678', role: 'teacher', name: 'Преподаватель 2' },
];

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    // Check local demo accounts first (no backend needed)
    const localMatch = LOCAL_ACCOUNTS.find(
      a => a.email === form.email.trim().toLowerCase() && a.password === form.password
    );
    if (localMatch) {
      saveSession({ user: { name: localMatch.name, email: localMatch.email, role: localMatch.role } });
      setLoading(false);
      if (localMatch.role === 'admin') router.push('/admin');
      else router.push('/teacher');
      return;
    }

    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      saveSession(data);
      const role = data.user?.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'teacher') router.push('/teacher');
      else router.push('/dashboard');
    } catch (error) {
      setStatus(error.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <section className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-10">
        <div className="glass w-full rounded-3xl p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-3xl font-black">{t.login}</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome back to OnlineTest LMS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border-0 bg-white py-3 pl-11 pr-4 shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                placeholder="Email"
                type="email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border-0 bg-white py-3 pl-11 pr-12 shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                placeholder="Password"
                type={showPass ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {status && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white shadow-md transition hover:bg-brand-500 disabled:opacity-60"
            >
              {loading ? t.loading : t.login}
            </button>
          </form>

          <div className="mt-5 text-center">
            <span className="text-sm text-slate-500">No account? </span>
            <Link href="/auth/register" className="text-sm font-semibold text-brand-600 hover:underline">{t.register}</Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-slate-200/60 pt-5 dark:border-slate-700/60">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Демо-аккаунты</p>
            <div className="space-y-2">
              {LOCAL_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setForm({ email: acc.email, password: acc.password }); setStatus(''); }}
                  className="w-full flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 px-3 py-2.5 text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.role === 'admin' ? 'bg-rose-500' : 'bg-violet-500'}`} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{acc.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">Нажмите на строку чтобы заполнить форму</p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
