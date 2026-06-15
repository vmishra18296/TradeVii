'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

export default function TurnoverPage() {
  const { trades } = useAppStore();

  const stats = useMemo(() => {
    const year = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, idx) => {
      const monthTrades = trades.filter((t) => {
        if (!t.date) return false;
        const [y, m] = t.date.split('-');
        return parseInt(y) === year && parseInt(m) === idx + 1;
      });
      const turnover = monthTrades.reduce((s, t) => s + (t.turnover || 0), 0);
      const pl = monthTrades.reduce((s, t) => s + (t.netPL || 0), 0);
      return { month, turnover, pl, count: monthTrades.length };
    });

    const totalTurnover = trades.reduce((s, t) => s + (t.turnover || 0), 0);
    const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);

    return { monthlyData, totalTurnover, totalPL };
  }, [trades]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total Turnover</p>
          <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{formatCurrency(stats.totalTurnover)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total P&L</p>
          <p className={`text-xl font-bold mt-1 ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(stats.totalPL)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total Trades</p>
          <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{trades.length}</p>
        </Card>
      </div>

      <Card title="Monthly Breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-3 text-[var(--text-muted)]">Month</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)]">Trades</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)]">Turnover</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)]">P&L</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlyData.map((m) => (
                <tr key={m.month} className="border-b border-[var(--border)]/50">
                  <td className="py-2.5 px-3 text-[var(--text-primary)] font-medium">{m.month}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{m.count}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(m.turnover)}</td>
                  <td className={`py-2.5 px-3 text-right font-medium ${m.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(m.pl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
