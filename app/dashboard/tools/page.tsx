'use client';

import { useState, useMemo } from 'react';
import { Card, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { useAppStore } from '@/stores/useAppStore';

export default function ToolsPage() {
  const { trades } = useAppStore();
  const [capital, setCapital] = useState('100000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  // Position size calculation
  const calculation = useMemo(() => {
    const cap = parseFloat(capital) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const target = parseFloat(targetPrice) || 0;

    if (!cap || !risk || !entry || !sl) return null;

    const riskAmount = (cap * risk) / 100;
    const riskPerShare = Math.abs(entry - sl);
    const quantity = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
    const positionSize = quantity * entry;
    const maxLoss = quantity * riskPerShare;
    const rewardPerShare = target ? Math.abs(target - entry) : 0;
    const maxProfit = target ? quantity * rewardPerShare : 0;
    const riskReward = rewardPerShare > 0 && riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
    const leverageUsed = cap > 0 ? positionSize / cap : 0;

    return {
      riskAmount,
      riskPerShare,
      quantity,
      positionSize,
      maxLoss,
      maxProfit,
      riskReward,
      leverageUsed,
    };
  }, [capital, riskPercent, entryPrice, stopLoss, targetPrice]);

  // Trade journal insights
  const insights = useMemo(() => {
    if (trades.length === 0) return null;
    const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);
    const wins = trades.filter((t) => t.netPL > 0);
    const losses = trades.filter((t) => t.netPL < 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.netPL, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.netPL, 0) / losses.length) : 0;
    const winRate = (wins.length / trades.length) * 100;
    const expectancy = wins.length + losses.length > 0
      ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss
      : 0;
    const maxDrawdown = calculateMaxDrawdown(trades);
    const sharpeRatio = calculateSharpeRatio(trades);

    return { totalPL, avgWin, avgLoss, winRate, expectancy, maxDrawdown, sharpeRatio, totalTrades: trades.length };
  }, [trades]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trading Tools</h1>
        <span className="text-xs text-[var(--text-muted)] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 text-indigo-400 font-medium">
          Alt+D for shortcuts
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Position Size Calculator */}
        <Card title="Position Size Calculator">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Capital (₹)</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Risk (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Entry Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="e.g., 250"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Stop Loss (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="e.g., 240"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[var(--text-muted)] mb-1">Target Price (₹, optional)</label>
                <input
                  type="number"
                  step="0.05"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g., 270"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Results */}
            {calculation && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ResultCard label="Quantity" value={String(calculation.quantity)} color="text-indigo-400" />
                  <ResultCard label="Position Size" value={formatCurrency(calculation.positionSize)} color="text-cyan-400" />
                  <ResultCard label="Max Risk" value={formatCurrency(calculation.maxLoss)} color="text-red-400" />
                  <ResultCard label="Max Profit" value={calculation.maxProfit ? formatCurrency(calculation.maxProfit) : '-'} color="text-emerald-400" />
                  <ResultCard label="Risk:Reward" value={calculation.riskReward ? `1:${calculation.riskReward.toFixed(2)}` : '-'} color="text-purple-400" />
                  <ResultCard label="Leverage Used" value={`${(calculation.leverageUsed * 100).toFixed(1)}%`} color="text-amber-400" />
                </div>
                {calculation.riskReward > 0 && calculation.riskReward < 1.5 && (
                  <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                    ⚠ Risk:Reward ratio is below 1.5. Consider adjusting your target or stop loss.
                  </p>
                )}
                {calculation.leverageUsed > 1 && (
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                    ⚠ Position exceeds your capital. Margin trading detected — manage risk carefully.
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Trading Performance Insights */}
        <Card title="Performance Insights">
          {!insights ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-8">Add trades to see performance insights.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Expectancy" value={formatCurrency(insights.expectancy)} color={insights.expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                <ResultCard label="Win Rate" value={`${insights.winRate.toFixed(1)}%`} color="text-purple-400" />
                <ResultCard label="Avg Win" value={formatCurrency(insights.avgWin)} color="text-emerald-400" />
                <ResultCard label="Avg Loss" value={formatCurrency(insights.avgLoss)} color="text-red-400" />
                <ResultCard label="Max Drawdown" value={formatCurrency(insights.maxDrawdown)} color="text-red-400" />
                <ResultCard label="Sharpe Ratio" value={insights.sharpeRatio.toFixed(2)} color="text-cyan-400" />
              </div>

              {/* Risk assessment */}
              <div className="pt-3 border-t border-[var(--border)]">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-3">Risk Assessment</h4>
                <div className="space-y-2">
                  <RiskBar label="Expectancy" value={insights.expectancy >= 0 ? 80 : 30} status={insights.expectancy >= 0 ? 'good' : 'bad'} />
                  <RiskBar label="Win Rate" value={insights.winRate} status={insights.winRate >= 50 ? 'good' : insights.winRate >= 40 ? 'warning' : 'bad'} />
                  <RiskBar label="Risk:Reward" value={insights.avgWin > 0 && insights.avgLoss > 0 ? Math.min(100, (insights.avgWin / insights.avgLoss) * 33) : 50} status={insights.avgWin > insights.avgLoss ? 'good' : 'warning'} />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <Card title="Keyboard Shortcuts">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { keys: 'Alt + D', desc: 'Go to Dashboard' },
            { keys: 'Alt + T', desc: 'Go to Trading' },
            { keys: 'Alt + I', desc: 'Go to Investors' },
            { keys: 'Alt + A', desc: 'Go to Analytics' },
            { keys: 'Alt + R', desc: 'Go to Reports' },
            { keys: 'Alt + W', desc: 'Go to Withdrawals' },
            { keys: 'Alt + K', desc: 'Toggle Theme' },
            { keys: 'Escape', desc: 'Close Sidebar/Modal' },
          ].map(({ keys, desc }) => (
            <div key={keys} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
              <kbd className="px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-300 font-mono">{keys}</kbd>
              <span className="text-sm text-[var(--text-muted)]">{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">{label}</p>
      <p className={`text-sm font-bold ${color} mt-0.5`}>{value}</p>
    </div>
  );
}

function RiskBar({ label, value, status }: { label: string; value: number; status: 'good' | 'warning' | 'bad' }) {
  const colors = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    bad: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--text-muted)] w-24">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colors[status]}`} style={{ width: `${Math.min(100, Math.max(5, value))}%` }} />
      </div>
    </div>
  );
}

// Calculate max drawdown from equity curve
function calculateMaxDrawdown(trades: { netPL: number }[]): number {
  let peak = 0;
  let maxDD = 0;
  let cumulative = 0;

  for (const t of trades) {
    cumulative += t.netPL || 0;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

// Calculate Sharpe ratio (simplified: daily returns, risk-free=0)
function calculateSharpeRatio(trades: { date: string; netPL: number }[]): number {
  const dailyMap = new Map<string, number>();
  for (const t of trades) {
    dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + (t.netPL || 0));
  }
  const dailyReturns = [...dailyMap.values()];
  if (dailyReturns.length < 2) return 0;

  const mean = dailyReturns.reduce((s, v) => s + v, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((s, v) => s + (v - mean) ** 2, 0) / (dailyReturns.length - 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;

  return (mean / stdDev) * Math.sqrt(252); // Annualized
}
