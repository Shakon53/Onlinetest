'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';

export default function CertificatePage() {
  const { t } = useI18n();
  const certificateId = 'CERT-OT-2026-8F31A2';
  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="glass rounded-[2rem] border-4 border-blue-100 p-10 text-center dark:border-blue-950">
          <p className="text-sm uppercase tracking-[0.4em] text-brand-600">OnlineTest LMS</p>
          <h1 className="mt-4 text-4xl font-black">{t.certificateTitle}</h1>
          <p className="mt-8 text-slate-500">This certifies that</p>
          <p className="mt-3 text-3xl font-black">Student Name</p>
          <p className="mt-4 text-slate-500">has successfully completed</p>
          <p className="mt-3 text-2xl font-bold">Databases and Information Systems</p>
          <div className="mt-8 flex justify-center"><QRCodeSVG value={`https://onlinetest.local/verify/${certificateId}`} size={120} /></div>
          <p className="mt-4 text-sm text-slate-500">{t.verifyQr}: {certificateId}</p>
        </div>
      </section>
    </Shell>
  );
}
