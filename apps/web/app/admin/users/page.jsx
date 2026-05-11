'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Ban, CheckCircle2, Search, Shield, User, XCircle } from 'lucide-react';
import { Shell } from '../../../components/Shell';
import { useI18n } from '../../../components/I18nProvider';
import { apiRequest, getSession } from '../../../lib/api';

const DEMO_USERS = [
  { _id: '1', name: 'Administrator', email: 'admin@onlinetest.app', role: 'admin', status: 'active', createdAt: '2024-01-01' },
  { _id: '2', name: 'Алия Нурланова', email: 'teacher1@onlinetest.app', role: 'teacher', status: 'active', createdAt: '2024-01-15' },
  { _id: '3', name: 'Данияр Абишев', email: 'teacher2@onlinetest.app', role: 'teacher', status: 'active', createdAt: '2024-01-20' },
  { _id: '4', name: 'Aruzhan Seitkali', email: 'aruzhan@uni.kz', role: 'student', status: 'active', createdAt: '2024-02-01' },
  { _id: '5', name: 'Dias Kenzhebayev', email: 'dias@uni.kz', role: 'student', status: 'active', createdAt: '2024-02-03' },
  { _id: '6', name: 'Mikhail Ivanov', email: 'mikhail@uni.kz', role: 'student', status: 'blocked', createdAt: '2024-02-05' },
  { _id: '7', name: 'Zarina Bekova', email: 'zarina@uni.kz', role: 'student', status: 'active', createdAt: '2024-02-07' },
  { _id: '8', name: 'Nurlan Seilov', email: 'nurlan@uni.kz', role: 'student', status: 'active', createdAt: '2024-02-10' }
];

const ROLE_COLORS = {
  admin: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  teacher: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
};

export default function AdminUsersPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState(DEMO_USERS);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'admin') { router.replace('/auth/login'); return; }
    setReady(true);
    apiRequest('/admin/users')
      .then((data) => { if (data.users?.length) setUsers(data.users); })
      .catch(() => {});
  }, [router]);

  async function toggleBlock(userId, currentStatus) {
    const action = currentStatus === 'blocked' ? 'unblock' : 'block';
    try {
      if (action === 'block') {
        await apiRequest(`/admin/users/${userId}/block`, { method: 'PATCH' });
      }
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status: action === 'block' ? 'blocked' : 'active' } : u));
      setActionMsg(action === 'block' ? t.userBlocked : t.userUnblocked);
      setTimeout(() => setActionMsg(''), 3000);
    } catch {
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status: action === 'block' ? 'blocked' : 'active' } : u));
    }
  }

  const filtered = users.filter((u) => {
    const match = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    const role = roleFilter === 'all' || u.role === roleFilter;
    return match && role;
  });

  if (!ready) return null;

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin" className="rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900 hover:bg-slate-50">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black">{t.manageUsers}</h1>
            <p className="text-slate-500">{filtered.length} users</p>
          </div>
        </div>

        {actionMsg && (
          <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {actionMsg}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-full border-0 bg-white py-3 pl-10 pr-4 text-sm shadow-sm dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'admin', 'teacher', 'student'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition capitalize ${roleFilter === r ? 'bg-brand-600 text-white' : 'bg-white shadow-sm dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {r === 'all' ? t.allCategories.replace('категории', '').trim() || 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/30 dark:border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">{t.name}</th>
                <th className="hidden px-6 py-4 text-left text-sm font-semibold text-slate-500 sm:table-cell">{t.email}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">{t.role}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} className="border-b border-white/20 last:border-0 hover:bg-white/30 dark:border-white/5 dark:hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-sm font-bold text-white">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold">{user.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-slate-500 sm:table-cell">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                        <XCircle size={14} /> Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleBlock(user._id, user.status)}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          user.status === 'blocked'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {user.status === 'blocked' ? <><Shield size={12} />{t.unblockUser}</> : <><Ban size={12} />{t.blockUser}</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
