'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Award, BookOpen, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest, getSession } from '../../../lib/api';

const ENROLLMENT_DATA = [
  { month: 'Sep', students: 40 },
  { month: 'Oct', students: 68 },
  { month: 'Nov', students: 95 },
  { month: 'Dec', students: 120 },
  { month: 'Jan', students: 148 },
  { month: 'Feb', students: 176 },
  { month: 'Mar', students: 210 },
  { month: 'Apr', students: 248 }
];

const COMPLETION_DATA = [
  { name: 'Databases', rate: 72 },
  { name: 'HCIA Datacom', rate: 48 },
  { name: 'Java', rate: 86 },
  { name: 'Practice', rate: 35 },
  { name: 'Big Data', rate: 58 },
  { name: 'Forecasting', rate: 24 }
];

const ROLE_PIE = [
  { name: 'Students', value: 230, color: '#2f7df6' },
  { name: 'Teachers', value: 12, color: '#7c3aed' },
  { name: 'Admins', value: 6, color: '#e11d48' }
];

export default function AdminAnalyticsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({ users: 248, courses: 96, certificates: 1204, progressRecords: 2150 });

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'admin') { router.replace('/auth/login'); return; }
    setReady(true);
    apiRequest('/admin/analytics').then((data) => setStats(data)).catch(() => {});
  }, [router]);

  if (!ready) return null;

  const cards = [
    { label: t.totalUsers, value: stats.users, icon: Users, color: 'text-blue-600', bg: 'from-blue-500 to-blue-700' },
    { label: t.courses, value: stats.courses, icon: BookOpen, color: 'text-violet-600', bg: 'from-violet-500 to-violet-700' },
    { label: t.certificates, value: stats.certificates, icon: Award, color: 'text-emerald-600', bg: 'from-emerald-500 to-emerald-700' },
    { label: 'Avg. completion', value: '54%', icon: TrendingUp, color: 'text-amber-600', bg: 'from-amber-500 to-amber-700' }
  ];

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin" className="rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-slate-50">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">{t.platformAnalytics}</h1>
            <p className="text-slate-500">Live platform statistics</p>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="glass rounded-3xl p-5">
              <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${card.bg} p-3 text-white`}>
                <card.icon size={20} />
              </div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`mt-1 text-4xl font-black ${card.color}`}>{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrollment trend */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-5 text-xl font-bold">Student Enrollment Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ENROLLMENT_DATA}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f7df6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2f7df6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="students" stroke="#2f7df6" fill="url(#blueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Completion rates */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-5 text-xl font-bold">Course Completion Rates (%)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={COMPLETION_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="rate" radius={[0, 8, 8, 0]}>
                  {COMPLETION_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 70 ? '#10b981' : entry.rate >= 50 ? '#2f7df6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Role distribution */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-5 text-xl font-bold">User Role Distribution</h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={ROLE_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {ROLE_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {ROLE_PIE.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="ml-auto text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-5 text-xl font-bold">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'New student registered', user: 'aigerim@uni.kz', time: '2 min ago', dot: 'bg-emerald-500' },
                { action: 'Course "Java" published', user: 'teacher1', time: '1 hour ago', dot: 'bg-blue-500' },
                { action: 'Certificate issued', user: 'dias@uni.kz', time: '2 hours ago', dot: 'bg-amber-500' },
                { action: 'Test submitted: 92%', user: 'aruzhan@uni.kz', time: '3 hours ago', dot: 'bg-violet-500' },
                { action: 'User blocked', user: 'spam@mail.com', time: 'Yesterday', dot: 'bg-rose-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${item.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.user}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
