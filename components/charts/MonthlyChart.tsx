'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Trade } from '@/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

interface MonthlyChartProps {
  trades: Trade[];
}

export function MonthlyChart({ trades }: MonthlyChartProps) {
  const { months, turnoverData, plData } = useMemo(() => {
    const year = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const turnoverData = new Array(12).fill(0);
    const plData = new Array(12).fill(0);

    trades.forEach((t) => {
      if (t.date && t.date.startsWith(String(year))) {
        const m = parseInt(t.date.split('-')[1]) - 1;
        turnoverData[m] += t.turnover || 0;
        plData[m] += t.netPL || 0;
      }
    });

    return { months, turnoverData, plData };
  }, [trades]);

  return (
    <Bar
      data={{
        labels: months,
        datasets: [
          {
            type: 'bar',
            label: 'Turnover',
            data: turnoverData,
            backgroundColor: 'rgba(99,102,241,0.65)',
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            type: 'line',
            label: 'P&L',
            data: plData,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.18)',
            tension: 0.35,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2,
          } as any,
        ] as any,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? context.parsed;
                return `${context.dataset.label}: ${formatCurrency(value as number)}`;
              },
            },
          },
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b' } },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#64748b', callback: (v) => formatCurrency(v as number) },
          },
        },
      }}
    />
  );
}
