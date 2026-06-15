'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Trade } from '@/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
            label: 'Turnover',
            data: turnoverData,
            backgroundColor: 'rgba(99,102,241,0.6)',
            borderRadius: 6,
          },
          {
            label: 'P&L',
            data: plData,
            backgroundColor: plData.map((v) =>
              v >= 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'
            ),
            borderRadius: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
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
