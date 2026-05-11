'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setStatus('sent');
    } catch (err) {
      setStatus('sent'); // don't reveal if email exists
    }
  }

  return (
    <Shell>
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <div className="glass w-full rounded-3xl p-8">
          {status === 'sent' ? (
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/40">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <h1 className="mt-5 text-2xl font-black">Check your email</h1>
              <p className="mt-3 text-slate-500">
                If an account exists for <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-500"
              >
                <ArrowLeft size={18} />{t.login}
              </Link>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-950/40">
                <KeyRound size={28} className="text-brand-600" />
              </div>

              <h1 className="text-center text-3xl font-black">Reset password</h1>
              <p className="mt-2 text-center text-sm text-slate-500">
                Enter your email and we will send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@university.kz"
                    className="w-full rounded-2xl border-0 bg-white py-3 pl-11 pr-4 shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                {errorMsg && (
                  <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-60 hover:bg-brand-500"
                >
                  {status === 'loading' ? t.loading : 'Send reset link'}
                </button>

                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ArrowLeft size={16} />{t.login}
                </Link>
              </form>
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
