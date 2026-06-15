'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { calcInvestorInterest } from '@/lib/interest';
import type { Trade, Investor } from '@/types';

interface TopInvestorsProps {
  investors: Investor[];
  trades: Trade[];
}

export function TopInvestors({ investors, trades }: TopInvestorsProps) {
  const topFive = useMemo(() => {
    const totalPool = investors.reduce((s, i) => s + (i.amount || 0), 0);
    return [...investors]
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5)
      .map((inv) => {
        const info = calcInvestorInterest(inv.amount || 0, inv.joinDate, trades, totalPool);
        return { ...inv, currentValue: info.totalAmount, profit: info.totalInterest };
      });
  }, [investors, trades]);

  return (
    <Card title="Top Investors" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
      {topFive.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm text-center py-8">No investors yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Name</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Invested</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Current</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {topFive.map((inv, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-slate-800/30">
                  <td className="py-2 px-2 text-[var(--text-primary)] font-medium">{inv.name}</td>
                  <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(inv.amount)}</td>
                  <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(inv.currentValue)}</td>
                  <td className={`py-2 px-2 text-right font-medium ${inv.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(inv.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
