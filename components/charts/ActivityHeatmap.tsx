'use client';

import { useMemo } from 'react';
import type { Trade } from '@/types';

interface ActivityHeatmapProps {
  trades: Trade[];
}

export function ActivityHeatmap({ trades }: ActivityHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    // Build last 52 weeks (364 days) of activity
    const today = new Date();
    const dayMap = new Map<string, { count: number; pl: number }>();

    trades.forEach((t) => {
      const existing = dayMap.get(t.date) || { count: 0, pl: 0 };
      existing.count += 1;
      existing.pl += t.netPL || 0;
      dayMap.set(t.date, existing);
    });

    const weeks: { date: string; count: number; pl: number; dayOfWeek: number }[][] = [];
    const monthLabels: { label: string; weekIdx: number }[] = [];
    let currentWeek: { date: string; count: number; pl: number; dayOfWeek: number }[] = [];
    let lastMonth = -1;

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const month = d.getMonth();
      const data = dayMap.get(ds) || { count: 0, pl: 0 };

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      if (month !== lastMonth) {
        monthLabels.push({
          label: d.toLocaleDateString('en', { month: 'short' }),
          weekIdx: weeks.length,
        });
        lastMonth = month;
      }

      currentWeek.push({ date: ds, ...data, dayOfWeek });
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { weeks, monthLabels };
  }, [trades]);

  function getColor(count: number, pl: number): string {
    if (count === 0) return 'bg-slate-800/50';
    if (pl > 0) {
      if (count >= 5) return 'bg-emerald-400';
      if (count >= 3) return 'bg-emerald-500/80';
      return 'bg-emerald-600/60';
    }
    if (pl < 0) {
      if (count >= 5) return 'bg-red-400';
      if (count >= 3) return 'bg-red-500/80';
      return 'bg-red-600/60';
    }
    return 'bg-slate-600/50';
  }

  return (
    <div className="space-y-2">
      {/* Month labels */}
      <div className="flex gap-0 ml-8 text-[9px] text-[var(--text-muted)]">
        {monthLabels.map((m, i) => (
          <span key={i} style={{ marginLeft: i === 0 ? 0 : `${(m.weekIdx - (monthLabels[i - 1]?.weekIdx || 0)) * 13 - 20}px` }}>
            {m.label}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-0.5 items-start">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 text-[9px] text-[var(--text-muted)] mr-1">
          <span className="h-[11px]"></span>
          <span className="h-[11px] leading-[11px]">Mon</span>
          <span className="h-[11px]"></span>
          <span className="h-[11px] leading-[11px]">Wed</span>
          <span className="h-[11px]"></span>
          <span className="h-[11px] leading-[11px]">Fri</span>
          <span className="h-[11px]"></span>
        </div>

        {/* Weeks */}
        <div className="flex gap-0.5 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
                const day = week.find((d) => d.dayOfWeek === dow);
                if (!day) return <div key={dow} className="w-[11px] h-[11px]" />;
                return (
                  <div
                    key={dow}
                    className={`w-[11px] h-[11px] rounded-[2px] ${getColor(day.count, day.pl)} transition-colors`}
                    title={`${day.date}: ${day.count} trades, P&L: ₹${day.pl.toFixed(0)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[9px] text-[var(--text-muted)] mt-1">
        <span>Less</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-slate-800/50" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-600/60" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-500/80" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-400" />
        <span>More (Profit)</span>
        <span className="ml-2">|</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-red-600/60 ml-2" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-red-500/80" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-red-400" />
        <span>Loss</span>
      </div>
    </div>
  );
}
