'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Card } from '@/components/ui/Card';
import { formatCurrency, todayStr } from '@/lib/utils';

export default function ProfitsPage() {
  const { trades } = useAppStore();

  const stats = useMemo(() => {
    const today = todayStr();
    const year = String(new Date().getFullYear());
    const month = today.substring(0, 7);

    const todayPL = trades.filter((t) => t.date === today).reduce((s, t) => s + (t.netPL || 0), 0);
    const monthPL = trades.filter((t) => t.date && t.date.startsWith(month)).reduce((s, t) => s + (t.netPL || 0), 0);
    const yearPL = trades.filter((t) => t.date && t.date.startsWith(year)).reduce((s, t) => s + (t.netPL || 0), 0);
    const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);

    const winTrades = trades.filter((t) => (t.netPL || 0) > 0).length;
    const lossTrades = trades.filter((t) => (t.netPL || 0) < 0).length;
    const winRate = trades.length > 0 ? ((winTrades / trades.length) * 100).toFixed(1) : '0';

    const biggestWin = Math.max(0, ...trades.map((t) => t.netPL || 0));
    const biggestLoss = Math.min(0, ...trades.map((t) => t.netPL || 0));

    return { todayPL, monthPL, yearPL, totalPL, winTrades, lossTrades, winRate, biggestWin, biggestLoss };
  }, [trades]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's P&L", value: stats.todayPL },
          { label: 'This Month', value: stats.monthPL },
          { label: 'This Year', value: stats.yearPL },
          { label: 'All Time', value: stats.totalPL },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
            <p className={`text-xl font-bold mt-1 ${item.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(item.value)}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Win Rate</p>
          <p className="text-xl font-bold text-indigo-400 mt-1">{stats.winRate}%</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Winning Trades</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{stats.winTrades}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Losing Trades</p>
          <p className="text-xl font-bold text-red-400 mt-1">{stats.lossTrades}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Total Trades</p>
          <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{trades.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Biggest Win</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(stats.biggestWin)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-muted)]">Biggest Loss</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(stats.biggestLoss)}</p>
        </Card>
      </div>
    </div>
  );
}
