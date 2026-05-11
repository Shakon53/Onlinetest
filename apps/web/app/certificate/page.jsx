'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Award, CheckCircle2, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';
import { apiRequest, getSession } from '../../lib/api';

const DEMO_CERT = {
  certificateId: 'CERT-2026-OT8F31A2KP',
  studentName: 'Aruzhan Seitkali',
  courseTitle: 'Databases and Information Systems',
  issuedAt: new Date('2026-04-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
};

function CertContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course');

  const [user, setUser] = useState(null);
  const [cert, setCert] = useState(DEMO_CERT);
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      setCert({ ...DEMO_CERT, studentName: session.name });
    }
  }, []);

  async function issueCert() {
    if (!courseId || !user) return;
    setLoading(true);
    try {
      const data = await apiRequest(`/certificates/courses/${courseId}/issue`, { method: 'POST' });
      if (data.certificate) {
        setCert({
          certificateId: data.certificate.certificateId,
          studentName: user.name,
          courseTitle: cert.courseTitle,
          issuedAt: new Date(data.certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        });
        setIssued(true);
      }
    } catch {
      setIssued(true);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    const url = `/api/certificates/${cert.certificateId}/pdf`;
    const a = document.createElement('a');
    a.href = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + `/certificates/${cert.certificateId}/pdf`;
    a.download = `${cert.certificateId}.pdf`;
    a.target = '_blank';
    a.click();
  }

  const verifyUrl = `https://onlinetest.app/verify/${cert.certificateId}`;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">{t.certificateTitle}</h1>
        <div className="flex gap-3">
          <button
            onClick={downloadPdf}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold shadow-sm dark:bg-slate-900 hover:bg-slate-50"
          >
            <Download size={16} />{t.downloadCert}
          </button>
          <button className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500">
            <Share2 size={16} />Share
          </button>
        </div>
      </div>

      {/* Certificate card */}
      <div className="relative overflow-hidden rounded-[2rem] border-4 border-blue-200 bg-white shadow-2xl dark:border-blue-900 dark:bg-slate-900">
        {/* Header band */}
        <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-10 py-6 text-center text-white">
          <div className="flex items-center justify-center gap-2">
            <Award size={20} />
            <span className="text-sm font-bold uppercase tracking-[0.3em]">OnlineTest LMS</span>
            <Award size={20} />
          </div>
          <p className="mt-1 text-xs tracking-[0.5em] text-white/70">CERTIFICATE OF COMPLETION</p>
        </div>

        {/* Body */}
        <div className="px-10 py-12 text-center">
          <p className="text-lg font-black text-slate-950 dark:text-white" style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem' }}>
            Certificate of Completion
          </p>

          <div className="mx-auto mt-6 h-0.5 w-48 bg-gradient-to-r from-transparent via-brand-600 to-transparent" />

          <p className="mt-8 text-slate-500">This is to certify that</p>

          <p className="mt-4 text-4xl font-black text-brand-700 dark:text-blue-300" style={{ fontFamily: 'Georgia, serif' }}>
            {cert.studentName}
          </p>

          <p className="mt-6 text-slate-500">has successfully completed the course</p>

          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            {cert.courseTitle}
          </p>

          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-slate-500">{t.joinDate}</p>
              <p className="font-bold">{cert.issuedAt}</p>
            </div>
            <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG value={verifyUrl} size={80} />
              <p className="text-xs text-slate-400">{t.verifyQr}</p>
            </div>
            <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
              <p className="mt-1 text-sm font-semibold text-emerald-600">Verified</p>
            </div>
          </div>

          <div className="mx-auto mt-8 h-0.5 w-48 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

          <p className="mt-4 text-xs text-slate-400">Certificate ID: {cert.certificateId}</p>
          <p className="text-xs text-slate-400">Verify at: onlinetest.app/verify/{cert.certificateId}</p>
        </div>

        {/* Corner decorations */}
        <div className="absolute left-4 top-20 text-blue-100 dark:text-slate-700" style={{ fontSize: '80px', opacity: 0.3 }}>❝</div>
        <div className="absolute bottom-4 right-4 text-blue-100 dark:text-slate-700" style={{ fontSize: '80px', opacity: 0.3 }}>❞</div>
      </div>

      {/* Issue button */}
      {courseId && !issued && user && (
        <div className="mt-6 text-center">
          <button
            onClick={issueCert}
            disabled={loading}
            className="rounded-2xl bg-brand-600 px-8 py-3 font-semibold text-white shadow-md hover:bg-brand-500 disabled:opacity-60"
          >
            {loading ? t.loading : t.issueCert}
          </button>
        </div>
      )}
      {issued && (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="mr-2 inline" size={16} />{t.certIssued}
        </div>
      )}
    </section>
  );
}

export default function CertificatePage() {
  return (
    <Shell>
      <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>}>
        <CertContent />
      </Suspense>
    </Shell>
  );
}
