'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useRole } from '@/hooks/useRole';
import { saveAccount } from '@/lib/database';
import { Card, Button, showToast } from '@/components/ui';
import type { Account } from '@/types';

export default function AccountPage() {
  const { account, setAccount, trades, investors } = useAppStore();
  const { canWrite } = useRole();
  const [form, setForm] = useState<Account>({
    bankName: '', accountNumber: '', ifsc: '', holderName: '', upi: '', panNumber: '', gstNumber: '',
  });

  useEffect(() => {
    if (account) setForm(account);
  }, [account]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setAccount(form);
    await saveAccount(form);
    showToast('Account details saved!', 'success');
  }

  function handleBackup() {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: {
        trades,
        investors,
        account,
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradevii_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded!', 'success');
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card title="Bank & Account Details">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Account Holder</label>
              <input type="text" value={form.holderName || ''} onChange={(e) => setForm({ ...form, holderName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!canWrite} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Bank Name</label>
              <input type="text" value={form.bankName || ''} onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!canWrite} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Account Number</label>
              <input type="text" value={form.accountNumber || ''} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!canWrite} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">IFSC Code</label>
              <input type="text" value={form.ifsc || ''} onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!canWrite} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">UPI ID</label>
              <input type="text" value={form.upi || ''} onChange={(e) => setForm({ ...form, upi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!canWrite} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">PAN Number</label>
              <input type="text" value={form.panNumber || ''} onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!canWrite} />
            </div>
          </div>
          {canWrite && <Button type="submit">Save Details</Button>}
        </form>
      </Card>

      {/* Backup & Restore */}
      {canWrite && (
        <Card title="Data Backup & Restore">
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              Download a full backup of your trades, investors, and account data as JSON.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleBackup} variant="secondary">
                Download Backup
              </Button>
              <label className="cursor-pointer inline-flex">
                <span className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 bg-slate-700 hover:bg-slate-600 text-[var(--text-primary)] px-4 py-2 text-sm">
                  Restore from Backup
                </span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const backup = JSON.parse(text);
                      if (!backup.data || !backup.version) {
                        showToast('Invalid backup file format', 'error');
                        return;
                      }
                      const { saveTrades, saveInvestors, saveAccount: saveAcc } = await import('@/lib/database');
                      if (backup.data.trades) {
                        useAppStore.getState().setTrades(backup.data.trades);
                        await saveTrades(backup.data.trades);
                      }
                      if (backup.data.investors) {
                        useAppStore.getState().setInvestors(backup.data.investors);
                        await saveInvestors(backup.data.investors);
                      }
                      if (backup.data.account) {
                        useAppStore.getState().setAccount(backup.data.account);
                        await saveAcc(backup.data.account);
                        setForm(backup.data.account);
                      }
                      showToast(`Backup restored! (${backup.exportedAt})`, 'success');
                    } catch {
                      showToast('Failed to parse backup file', 'error');
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">
              Last backup restores all data — trades ({trades.length}), investors ({investors.length}), account details.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
