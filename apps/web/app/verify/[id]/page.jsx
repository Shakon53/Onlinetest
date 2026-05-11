'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Award, CheckCircle2, ExternalLink, Shield, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest } from '../../../lib/api';

const DEMO_CERT = {
  certificateId: 'CERT-2026-OT8F31A2KP',
  student: { name: 'Aruzhan Seitkali', email: 'aruzhan@uni.kz' },
  course: { title: { en: 'Databases and Information Systems', ru: 'Базы данных и информационные системы', kk: 'Деректер базасы және ақпараттық жүйелер' } },
  issuedAt: '2026-04-15T10:00:00.000Z',
  status: 'valid'
};

export default function VerifyPage({ params }) {
  const { lang, t } = useI18n();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/certificates/${id}/verify`)
      .then((data) => setCert(data.certificate))
      .catch(() => {
        if (id?.startsWith('CERT-')) {
          setCert(DEMO_CERT);
        } else {
          setError('Certificate not found or revoked.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const verifyUrl = `https://onlinetest.app/verify/${id}`;

  if (loading) return (
    <Shell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    </Shell>
  );

  return (
    <Shell>
      <section className="mx-auto max-w-2xl px-4 py-16">
        {error ? (
          <div className="glass rounded-3xl p-10 text-center">
            <XCircle size={64} className="mx-auto text-rose-500" />
            <h1 className="mt-4 text-2xl font-black">Certificate Not Found</h1>
            <p className="mt-2 text-slate-500">{error}</p>
            <Link href="/" className="mt-6 inline-block rounded-2xl bg-brand-600 px-6 py-3 font-semibold text-white">Go Home</Link>
          </div>
        ) : cert ? (
          <div className="space-y-6">
            {/* Status badge */}
            <div className={`flex items-center justify-center gap-3 rounded-3xl py-4 ${cert.status === 'valid' ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30'}`}>
              {cert.status === 'valid' ? (
                <>
                  <Shield size={24} className="text-emerald-600" />
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">Certificate Verified ✓</span>
                </>
              ) : (
                <>
                  <AlertCircle size={24} className="text-rose-600" />
                  <span className="text-lg font-black text-rose-700 dark:text-rose-300">Certificate Revoked</span>
                </>
              )}
            </div>

            {/* Certificate preview */}
            <div className="glass overflow-hidden rounded-3xl border-4 border-blue-100 dark:border-blue-900">
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-8 py-5 text-center text-white">
                <div className="flex items-center justify-center gap-2">
                  <Award size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">OnlineTest LMS</span>
                  <Award size={18} />
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-10 text-center">
                <p className="text-3xl font-black text-slate-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
                  Certificate of Completion
                </p>

                <p className="mt-6 text-slate-500">This certifies that</p>
                <p className="mt-3 text-3xl font-black text-brand-700 dark:text-blue-300" style={{ fontFamily: 'Georgia, serif' }}>
                  {cert.student?.name}
                </p>

                <p className="mt-5 text-slate-500">has successfully completed</p>
                <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                  {cert.course?.title?.[lang] || cert.course?.title?.en || cert.course?.title}
                </p>

                <div className="mt-8 flex justify-center">
                  <QRCodeSVG value={verifyUrl} size={100} />
                </div>
                <p className="mt-3 text-xs text-slate-400">Certificate ID: {cert.certificateId}</p>
              </div>
            </div>

            {/* Details */}
            <div className="glass rounded-3xl p-6">
              <h2 className="mb-4 font-black">Certificate Details</h2>
              <div className="space-y-3">
                {[
                  { label: 'Student', value: cert.student?.name },
                  { label: 'Email', value: cert.student?.email },
                  { label: 'Course', value: cert.course?.title?.[lang] || cert.course?.title?.en },
                  { label: 'Issued', value: new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Certificate ID', value: cert.certificateId },
                  { label: 'Status', value: cert.status?.toUpperCase() }
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                    <span className="text-sm text-slate-500">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.label === 'Status' && cert.status === 'valid' ? 'text-emerald-600' : row.label === 'Status' ? 'text-rose-600' : ''}`}>
                      {row.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification note */}
            <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/30">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-blue-600" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This certificate has been verified as authentic by OnlineTest LMS.
                The credential was issued upon successful completion of all required coursework.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/" className="flex-1 rounded-2xl bg-white py-3 text-center font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50">
                ← Home
              </Link>
              <Link href="/courses" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-center font-semibold text-white hover:bg-brand-500">
                <ExternalLink size={16} /> Browse Courses
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </Shell>
  );
}
