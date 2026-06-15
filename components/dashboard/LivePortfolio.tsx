'use client';

import { useMemo } from 'react';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { calcInvestorInterestPrecise } from '@/lib/interest';
import type { Trade, Investor } from '@/types';

const INV_COLORS = ['#6366f1', '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308'];

interface LivePortfolioProps {
  investors: Investor[];
  trades: Trade[];
}

export function LivePortfolio({ investors, trades }: LivePortfolioProps) {
  const cards = useMemo(() => {
    const totalPool = investors.reduce((s, i) => s + (i.amount || 0), 0);
    return investors.map((inv, idx) => {
      const color = INV_COLORS[idx % INV_COLORS.length];
      const info = calcInvestorInterestPrecise(inv.amount || 0, inv.joinDate, trades, totalPool);
      const roiPct = inv.amount > 0 ? (info.totalInterest / inv.amount) * 100 : 0;
      const targetEarned = (inv.amount || 0) * 0.09 * (info.preciseDays / 365);
      const progressPct = targetEarned > 0 ? Math.min(100, (info.totalFixedInterest / targetEarned) * 100) : 0;

      return { inv, color, info, roiPct, progressPct };
    });
  }, [investors, trades]);

  if (investors.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-sm text-center py-8">
        No investors added yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map(({ inv, color, info, roiPct, progressPct }, idx) => (
        <div
          key={idx}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 hover:border-slate-700 transition-colors"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              {getInitials(inv.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{inv.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {inv.joinDate ? `Since ${formatDate(inv.joinDate)}` : 'Date unknown'}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                {info.wholeDays}d
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Invested</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(inv.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Current Value</p>
              <p className="text-sm font-bold text-emerald-400">{formatCurrency(info.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Total Earned</p>
              <p className={`text-sm font-bold ${info.totalInterest >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {info.totalInterest >= 0 ? '+' : ''}{formatCurrency(info.totalInterest)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">ROI</p>
              <p className={`text-sm font-bold ${roiPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {roiPct >= 0 ? '+' : ''}{roiPct.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Progress vs 9% target (day {info.wholeDays})</span>
              <span>{progressPct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: color }}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border)]">
            <div className="text-center">
              <p className="text-xs text-[var(--text-muted)]">Daily</p>
              <p className="text-xs font-semibold text-emerald-400">{formatCurrency(info.dailyFixedInterest)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[var(--text-muted)]">Monthly</p>
              <p className="text-xs font-semibold text-emerald-400">{formatCurrency(info.dailyFixedInterest * 30)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[var(--text-muted)]">Yearly (9%)</p>
              <p className="text-xs font-semibold text-emerald-400">{formatCurrency((inv.amount || 0) * 0.09)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
