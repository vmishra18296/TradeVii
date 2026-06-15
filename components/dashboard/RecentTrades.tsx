'use client';

import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, getTagTailwind } from '@/lib/utils';
import type { Trade } from '@/types';

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const recent = [...trades]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 10);

  return (
    <Card title="Recent Trades" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
      {recent.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm text-center py-8">No trades yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Date</th>
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Stock</th>
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Type</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Qty</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-slate-800/30">
                  <td className="py-2 px-2 text-slate-300">{formatDate(t.date)}</td>
                  <td className="py-2 px-2 text-[var(--text-primary)] font-medium">{t.stock}</td>
                  <td className="py-2 px-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getTagTailwind(t.type)}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">{t.quantity}</td>
                  <td className={`py-2 px-2 text-right font-medium ${(t.netPL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(t.netPL)}
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
