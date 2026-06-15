'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Card, Button } from '@/components/ui';
import { formatCurrency, formatDate, todayStr } from '@/lib/utils';
import { EquityCurve } from '@/components/charts/EquityCurve';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';

export default function JournalPage() {
  const { trades } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  // Group trades by date
  const tradesByDate = useMemo(() => {
    const map = new Map<string, typeof trades>();
    trades.forEach((t) => {
      const arr = map.get(t.date) || [];
      arr.push(t);
      map.set(t.date, arr);
    });
    return map;
  }, [trades]);

  const dates = useMemo(
    () => [...tradesByDate.keys()].sort((a, b) => b.localeCompare(a)),
    [tradesByDate]
  );

  const dayTrades = tradesByDate.get(selectedDate) || [];
  const dayPL = dayTrades.reduce((s, t) => s + (t.netPL || 0), 0);
  const dayTurnover = dayTrades.reduce((s, t) => s + (t.turnover || 0), 0);
  const dayWins = dayTrades.filter((t) => (t.netPL || 0) > 0).length;

  // Risk metrics
  const riskMetrics = useMemo(() => {
    if (trades.length === 0) return { sharpe: 0, expectancy: 0, profitFactor: 0, avgRR: 0, maxConsecutiveLoss: 0 };

    // Daily P&L for Sharpe
    const dailyPL = new Map<string, number>();
    trades.forEach((t) => {
      dailyPL.set(t.date, (dailyPL.get(t.date) || 0) + (t.netPL || 0));
    });
    const plValues = [...dailyPL.values()];
    const mean = plValues.reduce((a, b) => a + b, 0) / plValues.length;
    const stdDev = Math.sqrt(plValues.reduce((s, v) => s + (v - mean) ** 2, 0) / plValues.length);
    const sharpe = stdDev > 0 ? (mean / stdDev) * Math.sqrt(252) : 0; // Annualized

    // Expectancy
    const wins = trades.filter((t) => (t.netPL || 0) > 0);
    const losses = trades.filter((t) => (t.netPL || 0) < 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.netPL, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.netPL, 0) / losses.length) : 0;
    const winRate = wins.length / trades.length;
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);

    // Profit Factor
    const grossProfit = wins.reduce((s, t) => s + t.netPL, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPL, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Average Risk:Reward
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Max consecutive losses
    let maxConsec = 0;
    let currentConsec = 0;
    const sorted = [...trades].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    sorted.forEach((t) => {
      if ((t.netPL || 0) < 0) {
        currentConsec++;
        maxConsec = Math.max(maxConsec, currentConsec);
      } else {
        currentConsec = 0;
      }
    });

    return { sharpe, expectancy, profitFactor, avgRR, maxConsecutiveLoss: maxConsec };
  }, [trades]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trade Journal</h1>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Sharpe Ratio</p>
          <p className={`text-xl font-bold ${riskMetrics.sharpe >= 1 ? 'text-emerald-400' : riskMetrics.sharpe >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
            {riskMetrics.sharpe.toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Expectancy</p>
          <p className={`text-xl font-bold ${riskMetrics.expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(riskMetrics.expectancy)}
          </p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Profit Factor</p>
          <p className={`text-xl font-bold ${riskMetrics.profitFactor >= 1.5 ? 'text-emerald-400' : riskMetrics.profitFactor >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
            {riskMetrics.profitFactor === Infinity ? '∞' : riskMetrics.profitFactor.toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Avg R:R</p>
          <p className="text-xl font-bold text-indigo-400">{riskMetrics.avgRR.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Max Consec. Loss</p>
          <p className="text-xl font-bold text-red-400">{riskMetrics.maxConsecutiveLoss}</p>
        </div>
      </div>

      {/* Equity Curve */}
      <Card title="Equity Curve & Drawdown">
        <EquityCurve trades={trades} />
      </Card>

      {/* Activity Heatmap */}
      <Card title="Trading Activity (Last 52 Weeks)">
        <ActivityHeatmap trades={trades} />
      </Card>

      {/* Date Selector + Day Journal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Date list */}
        <div className="lg:col-span-1">
          <Card title="Trading Days">
            <div className="max-h-96 overflow-y-auto space-y-1">
              {dates.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm text-center py-4">No trading days.</p>
              ) : (
                dates.map((date) => {
                  const dt = tradesByDate.get(date) || [];
                  const pl = dt.reduce((s, t) => s + (t.netPL || 0), 0);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDate === date
                          ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-300'
                          : 'text-[var(--text-muted)] hover:bg-slate-800/50 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{formatDate(date)}</span>
                      <span className={`font-medium ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(pl)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Day detail */}
        <div className="lg:col-span-2">
          <Card title={`Journal: ${formatDate(selectedDate)}`}>
            {dayTrades.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm text-center py-8">No trades on this day.</p>
            ) : (
              <div className="space-y-4">
                {/* Day Summary */}
                <div className="grid grid-cols-4 gap-3 pb-4 border-b border-[var(--border)]">
                  <div>
                    <p className="text-[10px] uppercase text-[var(--text-muted)]">Trades</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{dayTrades.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[var(--text-muted)]">P&L</p>
                    <p className={`text-lg font-bold ${dayPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(dayPL)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[var(--text-muted)]">Turnover</p>
                    <p className="text-lg font-bold text-cyan-400">{formatCurrency(dayTurnover)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[var(--text-muted)]">Win Rate</p>
                    <p className="text-lg font-bold text-purple-400">
                      {dayTrades.length > 0 ? ((dayWins / dayTrades.length) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>

                {/* Individual trades */}
                <div className="space-y-2">
                  {dayTrades.map((t, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 border border-[var(--border)]/50">
                      <div className={`w-2 h-2 rounded-full ${(t.netPL || 0) >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{t.stock}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{t.type}</span>
                          {t.strategy && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">{t.strategy}</span>
                          )}
                        </div>
                        {t.notes && <p className="text-xs text-[var(--text-muted)] mt-1">{t.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${(t.netPL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(t.netPL)}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">Qty: {t.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
