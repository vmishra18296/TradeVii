'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { getPayouts } from '@/lib/database';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PayoutItem {
  investorName: string;
  amount: number;
  type: string;
  date: string;
  notes?: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);

  useEffect(() => {
    getPayouts().then((data) => setPayouts(data as PayoutItem[]));
  }, []);

  const totalPaid = payouts.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total Payouts</p>
          <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{payouts.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total Paid</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(totalPaid)}</p>
        </Card>
      </div>

      <Card title="Payout History">
        {payouts.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-12">No payouts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-3 text-[var(--text-muted)]">Investor</th>
                  <th className="text-right py-3 px-3 text-[var(--text-muted)]">Amount</th>
                  <th className="text-left py-3 px-3 text-[var(--text-muted)]">Type</th>
                  <th className="text-left py-3 px-3 text-[var(--text-muted)]">Date</th>
                  <th className="text-left py-3 px-3 text-[var(--text-muted)]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => (
                  <tr key={i} className="border-b border-[var(--border)]/50">
                    <td className="py-2.5 px-3 text-[var(--text-primary)]">{p.investorName}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{formatCurrency(p.amount)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{p.type}</td>
                    <td className="py-2.5 px-3 text-slate-300">{formatDate(p.date)}</td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)] text-xs">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
