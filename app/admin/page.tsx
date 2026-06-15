'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/stores/useAppStore';
import { getSignupRequests, getAdminLogs } from '@/lib/database';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import type { SignupRequest, AdminLog } from '@/types';

export default function AdminDashboardPage() {
  const { trades, investors } = useAppStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    getSignupRequests().then((data) => {
      setPendingCount(data.filter((r) => r.status === 'pending').length);
    });
    getAdminLogs().then((data) => setRecentLogs(data.reverse().slice(0, 5)));
  }, []);

  const totalInvestment = investors.reduce((s, i) => s + (i.amount || 0), 0);
  const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Overview</h1>
        <Badge variant="error" size="md">Admin Only</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Pending Signups</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          <Link href="/admin/users" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block">Manage →</Link>
        </Card>
        <Card>
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Total Investors</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{investors.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{investors.filter((i) => i.status === 'active' || !i.status).length} active</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Total Investment</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{formatCurrency(totalInvestment)}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">All-time P&L</p>
          <p className={`text-2xl font-bold mt-1 ${totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(totalPL)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{trades.length} trades</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-[var(--border)] hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">User Management</p>
              <p className="text-xs text-[var(--text-muted)]">Approve/reject signups</p>
            </div>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-[var(--border)] hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">System Settings</p>
              <p className="text-xs text-[var(--text-muted)]">Interest, limits, config</p>
            </div>
          </Link>
          <Link href="/admin/logs" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-[var(--border)] hover:border-amber-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Activity Log</p>
              <p className="text-xs text-[var(--text-muted)]">View all actions</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        {recentLogs.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm text-center py-6">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30">
                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                <p className="text-sm text-[var(--text-primary)] flex-1">{log.action}</p>
                <time className="text-xs text-[var(--text-muted)]">
                  {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
