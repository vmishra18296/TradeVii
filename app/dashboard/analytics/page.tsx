'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { DailyPLChart } from '@/components/charts/DailyPLChart';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { PieChart } from '@/components/charts/PieChart';
import { EquityCurve } from '@/components/charts/EquityCurve';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';

export default function AnalyticsPage() {
  const { trades, investors } = useAppStore();

  // Performance by stock
  const stockPerformance = useMemo(() => {
    const map = new Map<string, { pl: number; trades: number; wins: number }>();
    trades.forEach((t) => {
      const existing = map.get(t.stock) || { pl: 0, trades: 0, wins: 0 };
      existing.pl += t.netPL || 0;
      existing.trades += 1;
      if ((t.netPL || 0) > 0) existing.wins += 1;
      map.set(t.stock, existing);
    });
    return [...map.entries()]
      .map(([stock, data]) => ({ stock, ...data, winRate: (data.wins / data.trades) * 100 }))
      .sort((a, b) => b.pl - a.pl);
  }, [trades]);

  // Performance by trade type
  const typePerformance = useMemo(() => {
    const map = new Map<string, { pl: number; trades: number; wins: number; turnover: number }>();
    trades.forEach((t) => {
      const existing = map.get(t.type) || { pl: 0, trades: 0, wins: 0, turnover: 0 };
      existing.pl += t.netPL || 0;
      existing.trades += 1;
      existing.turnover += t.turnover || 0;
      if ((t.netPL || 0) > 0) existing.wins += 1;
      map.set(t.type, existing);
    });
    return [...map.entries()]
      .map(([type, data]) => ({ type, ...data, winRate: (data.wins / data.trades) * 100 }))
      .sort((a, b) => b.pl - a.pl);
  }, [trades]);

  // Performance by strategy
  const strategyPerformance = useMemo(() => {
    const map = new Map<string, { pl: number; trades: number; wins: number }>();
    trades.forEach((t) => {
      const strategy = t.strategy || 'No Strategy';
      const existing = map.get(strategy) || { pl: 0, trades: 0, wins: 0 };
      existing.pl += t.netPL || 0;
      existing.trades += 1;
      if ((t.netPL || 0) > 0) existing.wins += 1;
      map.set(strategy, existing);
    });
    return [...map.entries()]
      .map(([strategy, data]) => ({ strategy, ...data, winRate: (data.wins / data.trades) * 100 }))
      .sort((a, b) => b.pl - a.pl);
  }, [trades]);

  // Day of week analysis
  const dayOfWeekStats = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const map = new Map<string, { pl: number; trades: number }>();
    days.forEach((d) => map.set(d, { pl: 0, trades: 0 }));
    trades.forEach((t) => {
      const day = days[new Date(t.date).getDay()];
      const existing = map.get(day)!;
      existing.pl += t.netPL || 0;
      existing.trades += 1;
    });
    return days.filter((d) => d !== 'Sunday' && d !== 'Saturday').map((d) => ({ day: d, ...map.get(d)! }));
  }, [trades]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);
    const totalTurnover = trades.reduce((s, t) => s + (t.turnover || 0), 0);
    const wins = trades.filter((t) => (t.netPL || 0) > 0).length;
    const avgWin = wins > 0 ? trades.filter((t) => t.netPL > 0).reduce((s, t) => s + t.netPL, 0) / wins : 0;
    const losses = trades.filter((t) => (t.netPL || 0) < 0).length;
    const avgLoss = losses > 0 ? trades.filter((t) => t.netPL < 0).reduce((s, t) => s + t.netPL, 0) / losses : 0;
    const rr = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    const tradingDays = new Set(trades.map((t) => t.date)).size;
    const avgPLPerDay = tradingDays > 0 ? totalPL / tradingDays : 0;
    return { totalPL, totalTurnover, wins, losses, avgWin, avgLoss, rr, tradingDays, avgPLPerDay, totalTrades: trades.length };
  }, [trades]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Advanced Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-indigo-500/40 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Risk:Reward</p>
          <p className="text-xl font-bold text-indigo-400">{overallStats.rr.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Avg Win</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(overallStats.avgWin)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-red-500/40 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Avg Loss</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(overallStats.avgLoss)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-cyan-500/40 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Trading Days</p>
          <p className="text-xl font-bold text-cyan-400">{overallStats.tradingDays}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-amber-500/40 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Avg P&L/Day</p>
          <p className={`text-xl font-bold ${overallStats.avgPLPerDay >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(overallStats.avgPLPerDay)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Daily P&L (Last 30 Days)">
          <div className="h-56">
            <DailyPLChart trades={trades} />
          </div>
        </Card>
        <Card title="Monthly P&L">
          <div className="h-56">
            <MonthlyChart trades={trades} />
          </div>
        </Card>
      </div>

      {/* Equity Curve */}
      <Card title="Equity Curve & Drawdown">
        <div className="h-72">
          <EquityCurve trades={trades} />
        </div>
      </Card>

      {/* Activity Heatmap */}
      <Card title="Trading Activity (Last 52 Weeks)">
        <ActivityHeatmap trades={trades} />
      </Card>

      {/* Pie Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Investment Distribution">
          <div className="h-56">
            <PieChart investors={investors} />
          </div>
        </Card>
        <Card title="Day of Week Performance">
          <div className="space-y-3">
            {dayOfWeekStats.map((d) => (
              <div key={d.day} className="flex items-center gap-4">
                <span className="text-sm text-[var(--text-muted)] w-24">{d.day.slice(0, 3)}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-5 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${d.pl >= 0 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                    style={{ width: `${Math.min(100, Math.abs(d.pl) / (Math.max(...dayOfWeekStats.map((x) => Math.abs(x.pl))) || 1) * 100)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[var(--text-primary)]">
                    {formatCurrency(d.pl)} ({d.trades} trades)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stock Performance Table */}
      <Card title="Performance by Stock">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Stock</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Trades</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Win Rate</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Total P&L</th>
              </tr>
            </thead>
            <tbody>
              {stockPerformance.slice(0, 15).map((s) => (
                <tr key={s.stock} className="border-b border-[var(--border)]/50 hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-[var(--text-primary)] font-medium">{s.stock}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{s.trades}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant={s.winRate >= 50 ? 'success' : 'error'}>{s.winRate.toFixed(0)}%</Badge>
                  </td>
                  <td className={`py-2.5 px-3 text-right font-semibold ${s.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(s.pl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Strategy Performance */}
      <Card title="Performance by Strategy">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategyPerformance.map((s) => (
            <div key={s.strategy} className="bg-slate-800/30 rounded-lg p-4 border border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--text-primary)]">{s.strategy}</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className={`text-lg font-bold ${s.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(s.pl)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.trades} trades</p>
                </div>
                <Badge variant={s.winRate >= 50 ? 'success' : 'warning'} size="md">{s.winRate.toFixed(0)}% WR</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Type Performance */}
      <Card title="Performance by Type">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Type</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Trades</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Win Rate</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Turnover</th>
                <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs font-medium">Net P&L</th>
              </tr>
            </thead>
            <tbody>
              {typePerformance.map((t) => (
                <tr key={t.type} className="border-b border-[var(--border)]/50 hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-[var(--text-primary)] font-medium">{t.type}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{t.trades}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant={t.winRate >= 50 ? 'success' : 'error'}>{t.winRate.toFixed(0)}%</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(t.turnover)}</td>
                  <td className={`py-2.5 px-3 text-right font-semibold ${t.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(t.pl)}
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
