'use client';

import { BarChart3, GripVertical, Plus, Upload } from 'lucide-react';
import { Shell } from '../../components/Shell';
import { useI18n } from '../../components/I18nProvider';

export default function TeacherPage() {
  const { t } = useI18n();
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-4xl font-black">{t.navTeacher}</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[{ label: t.teacherCreate, icon: Plus }, { label: t.uploadMaterials, icon: Upload }, { label: t.analytics, icon: BarChart3 }].map((item) => <div key={item.label} className="glass card-hover rounded-3xl p-6"><item.icon className="mb-4 text-brand-600" /><h2 className="text-xl font-bold">{item.label}</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Production-ready API endpoints are prepared for this action.</p></div>)}
        </div>
        <div className="mt-8 glass rounded-3xl p-6">
          <h2 className="text-2xl font-black">{t.lessonBuilder}</h2>
          <div className="mt-5 space-y-3">
            {['Video lecture', 'Text material', 'PDF attachment', 'Mini test', 'Homework'].map((block) => <div key={block} className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-slate-900"><GripVertical className="text-slate-400" /><span className="font-semibold">{block}</span></div>)}
          </div>
        </div>
      </section>
    </Shell>
  );
}
