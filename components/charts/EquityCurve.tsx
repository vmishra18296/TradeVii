'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import type { Trade } from '@/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface EquityCurveProps {
  trades: Trade[];
}

export function EquityCurve({ trades }: EquityCurveProps) {
  const { labels, equityData, drawdownData, maxDrawdown, maxDrawdownIdx } = useMemo(() => {
    if (trades.length === 0) {
      return { labels: [], equityData: [], drawdownData: [], maxDrawdown: 0, maxDrawdownIdx: 0 };
    }

    // Sort trades by date
    const sorted = [...trades].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    // Build cumulative equity
    let equity = 0;
    let peak = 0;
    let maxDD = 0;
    let maxDDIdx = 0;
    const labels: string[] = [];
    const equityData: number[] = [];
    const drawdownData: number[] = [];

    sorted.forEach((t, i) => {
      equity += t.netPL || 0;
      peak = Math.max(peak, equity);
      const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
      if (dd > maxDD) {
        maxDD = dd;
        maxDDIdx = i;
      }
      labels.push(t.date);
      equityData.push(equity);
      drawdownData.push(-dd);
    });

    return { labels, equityData, drawdownData, maxDrawdown: maxDD, maxDrawdownIdx: maxDDIdx };
  }, [trades]);

  if (trades.length === 0) {
    return <p className="text-[var(--text-muted)] text-sm text-center py-8">No trades to chart.</p>;
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex-1 min-h-0">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: 'Equity (₹)',
                data: equityData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.08)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                display: false,
              },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#64748b', callback: (v) => formatCurrency(v as number) },
              },
            },
          }}
        />
      </div>
      <div className="h-16">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: 'Drawdown (%)',
                data: drawdownData,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 1.5,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { display: false },
              y: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: '#64748b', callback: (v) => `${(v as number).toFixed(1)}%` },
              },
            },
          }}
        />
      </div>
      <p className="text-xs text-[var(--text-muted)] text-center">
        Max Drawdown: <span className="text-red-400 font-medium">{maxDrawdown.toFixed(2)}%</span>
      </p>
    </div>
  );
}
