'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useRole } from '@/hooks/useRole';
import { saveInvestors, logAdminAction } from '@/lib/database';
import { Card, Button, Modal, showToast, Badge } from '@/components/ui';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { calcInvestorInterestPrecise } from '@/lib/interest';
import type { Investor } from '@/types';

export default function InvestorsPage() {
  const { investors, setInvestors, trades, addNotification } = useAppStore();
  const { canWrite } = useRole();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', amount: '', joinDate: '', status: 'active' as 'active' | 'inactive' | 'paused' });

  const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);
  const totalInvestment = investors.reduce((s, i) => s + (i.amount || 0), 0);

  const filtered = investors.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.phone.includes(q) || (i.email || '').toLowerCase().includes(q);
  });

  const enriched = filtered.map((inv) => {
    const interest = calcInvestorInterestPrecise(inv.amount, inv.joinDate, trades, totalInvestment);
    const originalIdx = investors.indexOf(inv);
    return { ...inv, interest, originalIdx };
  });

  function openEdit(idx: number) {
    const inv = investors[idx];
    setForm({
      name: inv.name,
      phone: inv.phone,
      email: inv.email || '',
      amount: String(inv.amount),
      joinDate: inv.joinDate,
      status: inv.status || 'active',
    });
    setEditingIdx(idx);
    setShowAddModal(true);
  }

  function openAdd() {
    setForm({ name: '', phone: '', email: '', amount: '', joinDate: new Date().toISOString().split('T')[0], status: 'active' });
    setEditingIdx(null);
    setShowAddModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const inv: Investor = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      amount: parseFloat(form.amount) || 0,
      joinDate: form.joinDate,
      status: form.status,
    };

    let updated: Investor[];
    if (editingIdx !== null) {
      updated = [...investors];
      updated[editingIdx] = { ...updated[editingIdx], ...inv };
      await logAdminAction('UPDATE_INVESTOR', { name: inv.name });
      showToast('Investor updated!', 'success');
    } else {
      updated = [...investors, inv];
      await logAdminAction('ADD_INVESTOR', { name: inv.name, amount: inv.amount });
      showToast('Investor added!', 'success');
      addNotification({ title: 'New Investor', message: `${inv.name} added with ${formatCurrency(inv.amount)}`, type: 'success' });
    }

    setInvestors(updated);
    await saveInvestors(updated);
    setShowAddModal(false);
  }

  async function handleDelete(idx: number) {
    const inv = investors[idx];
    const updated = investors.filter((_, i) => i !== idx);
    setInvestors(updated);
    await saveInvestors(updated);
    await logAdminAction('DELETE_INVESTOR', { name: inv.name });
    showToast('Investor removed', 'success');
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)]">Total Investors</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{investors.length}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)]">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{investors.filter((i) => !i.status || i.status === 'active').length}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)]">Total Capital</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(totalInvestment)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)]">Avg Investment</p>
          <p className="text-2xl font-bold text-indigo-400">{formatCurrency(investors.length > 0 ? totalInvestment / investors.length : 0)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {canWrite && <Button onClick={openAdd}>+ Add Investor</Button>}
        <div className="ml-auto relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search investors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-300 w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Investors grid */}
      {enriched.length === 0 ? (
        <Card><p className="text-[var(--text-muted)] text-center py-12">No investors found.</p></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enriched.map((inv, idx) => (
            <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 hover:border-slate-700 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                  {getInitials(inv.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{inv.name}</p>
                    <Badge variant={(!inv.status || inv.status === 'active') ? 'success' : inv.status === 'paused' ? 'warning' : 'neutral'}>
                      {inv.status || 'active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{inv.phone} {inv.email && `• ${inv.email}`}</p>
                </div>
                {canWrite && (
                  <button
                    onClick={() => openEdit(inv.originalIdx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Investment</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(inv.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Joined</p>
                  <p className="text-sm text-slate-300">{formatDate(inv.joinDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Interest</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(inv.interest?.totalInterest || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[var(--text-muted)]">Current Value</p>
                  <p className="text-sm font-bold text-indigo-400">{formatCurrency(inv.interest?.totalAmount || inv.amount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingIdx !== null ? 'Edit Investor' : 'Add Investor'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Email (optional)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Join Date</label>
              <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' | 'paused' })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">{editingIdx !== null ? 'Update' : 'Add'} Investor</Button>
            {editingIdx !== null && canWrite && (
              <Button variant="secondary" type="button" onClick={() => { handleDelete(editingIdx); setShowAddModal(false); }}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
