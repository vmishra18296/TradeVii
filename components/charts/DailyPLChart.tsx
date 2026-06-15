'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import type { Trade } from '@/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface DailyPLChartProps {
  trades: Trade[];
}

export function DailyPLChart({ trades }: DailyPLChartProps) {
  const { labels, data } = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
      data.push(
        trades.filter((t) => t.date === ds).reduce((s, t) => s + (t.netPL || 0), 0)
      );
    }
    return { labels, data };
  }, [trades]);

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Daily P&L (₹)',
            data,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#64748b', font: { size: 10 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#64748b',
              callback: (v) => formatCurrency(v as number),
            },
          },
        },
      }}
    />
  );
}
