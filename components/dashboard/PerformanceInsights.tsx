'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { Trade } from '@/types';

interface PerformanceInsightsProps {
  trades: Trade[];
}

export function PerformanceInsights({ trades }: PerformanceInsightsProps) {
  const insights = useMemo(() => {
    if (trades.length === 0) return null;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

    const currentMonthTrades = trades.filter((t) => t.date?.startsWith(currentMonth));
    const lastMonthTrades = trades.filter((t) => t.date?.startsWith(lastMonth));

    const currentMonthPL = currentMonthTrades.reduce((s, t) => s + (t.netPL || 0), 0);
    const lastMonthPL = lastMonthTrades.reduce((s, t) => s + (t.netPL || 0), 0);
    const monthGrowth = lastMonthPL !== 0 ? ((currentMonthPL - lastMonthPL) / Math.abs(lastMonthPL)) * 100 : 0;

    // Streak calculation
    const dates = [...new Set(trades.map((t) => t.date))].sort().reverse();
    let winStreak = 0;
    let lossStreak = 0;
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | null = null;

    for (const d of dates) {
      const dayPL = trades.filter((t) => t.date === d).reduce((s, t) => s + (t.netPL || 0), 0);
      if (dayPL > 0) {
        if (streakType === 'win' || streakType === null) {
          currentStreak++;
          streakType = 'win';
        } else break;
      } else if (dayPL < 0) {
        if (streakType === 'loss' || streakType === null) {
          currentStreak++;
          streakType = 'loss';
        } else break;
      } else break;
    }
    if (streakType === 'win') winStreak = currentStreak;
    if (streakType === 'loss') lossStreak = currentStreak;

    // Best and worst month
    const monthMap = new Map<string, number>();
    trades.forEach((t) => {
      const m = t.date?.slice(0, 7);
      if (m) monthMap.set(m, (monthMap.get(m) || 0) + (t.netPL || 0));
    });
    let bestMonth = { month: '', pl: -Infinity };
    let worstMonth = { month: '', pl: Infinity };
    monthMap.forEach((pl, month) => {
      if (pl > bestMonth.pl) bestMonth = { month, pl };
      if (pl < worstMonth.pl) worstMonth = { month, pl };
    });

    // Trading consistency (days traded this month vs. available trading days)
    const tradingDaysThisMonth = new Set(currentMonthTrades.map((t) => t.date)).size;
    const daysPassed = now.getDate();
    const consistencyPct = daysPassed > 0 ? (tradingDaysThisMonth / daysPassed) * 100 : 0;

    return {
      currentMonthPL,
      lastMonthPL,
      monthGrowth,
      winStreak,
      lossStreak,
      streakType,
      bestMonth,
      worstMonth,
      tradingDaysThisMonth,
      consistencyPct,
    };
  }, [trades]);

  if (!insights) {
    return null;
  }

  const formatMonth = (m: string) => {
    if (!m) return '-';
    const [year, month] = m.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  return (
    <Card title="Performance Insights" icon={
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    }>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Month Progress */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">This Month</p>
          <p className={`text-lg font-bold ${insights.currentMonthPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(insights.currentMonthPL)}
          </p>
          {insights.monthGrowth !== 0 && (
            <p className={`text-[10px] ${insights.monthGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {insights.monthGrowth >= 0 ? '↑' : '↓'} {Math.abs(insights.monthGrowth).toFixed(0)}% vs last month
            </p>
          )}
        </div>

        {/* Streak */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Current Streak</p>
          {insights.streakType === 'win' ? (
            <p className="text-lg font-bold text-emerald-400">🔥 {insights.winStreak} days</p>
          ) : insights.streakType === 'loss' ? (
            <p className="text-lg font-bold text-red-400">❄️ {insights.lossStreak} days</p>
          ) : (
            <p className="text-lg font-bold text-[var(--text-muted)]">—</p>
          )}
        </div>

        {/* Best Month */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Best Month</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(insights.bestMonth.pl)}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{formatMonth(insights.bestMonth.month)}</p>
        </div>

        {/* Consistency */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Consistency</p>
          <p className="text-lg font-bold text-purple-400">{insights.consistencyPct.toFixed(0)}%</p>
          <p className="text-[10px] text-[var(--text-muted)]">{insights.tradingDaysThisMonth} days traded</p>
        </div>
      </div>
    </Card>
  );
}
