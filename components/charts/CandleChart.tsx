'use client';

import { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeSeriesScale, Tooltip, Legend } from 'chart.js';
import { Chart as ReactChart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import type { Trade } from '@/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, TimeSeriesScale, CandlestickController, CandlestickElement, Tooltip, Legend);

interface CandleChartProps {
  trades: Trade[];
}

interface CandlestickPoint {
  x: string;
  o: number;
  h: number;
  l: number;
  c: number;
}

export function CandleChart({ trades }: CandleChartProps) {
  const { labels, data } = useMemo(() => {
    const grouped: Record<string, CandlestickPoint> = {};

    const sortedTrades = [...trades]
      .filter((trade) => trade.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    sortedTrades.forEach((trade) => {
      const price = trade.sellPrice ?? trade.buyPrice ?? (trade.quantity ? trade.turnover / trade.quantity : 0);
      if (!price || price <= 0) return;

      const dateKey = trade.date;
      const label = new Date(dateKey).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

      if (!grouped[dateKey]) {
        grouped[dateKey] = { x: label, o: price, h: price, l: price, c: price };
      } else {
        const point = grouped[dateKey];
        point.h = Math.max(point.h, price);
        point.l = Math.min(point.l, price);
        point.c = price;
      }
    });

    const points = Object.values(grouped).slice(-20);
    const labels = points.map((p) => p.x);

    return { labels, data: points };
  }, [trades]);

  if (data.length === 0) {
    return <p className="text-[var(--text-muted)] text-sm text-center py-10">No trade data available for candlestick rendering.</p>;
  }

  return (
    <ReactChart
      type="candlestick"
      data={{
        datasets: [
          {
            label: 'Daily Price Range',
            data,
            color: {
              up: '#22c55e',
              down: '#ef4444',
              unchanged: '#64748b',
            },
          } as any,
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const item = context.raw as CandlestickPoint;
                return `O: ${formatCurrency(item.o)}  H: ${formatCurrency(item.h)}  L: ${formatCurrency(item.l)}  C: ${formatCurrency(item.c)}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', maxRotation: 0, minRotation: 0 },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (value) => formatCurrency(value as number),
            },
          },
        },
      }}
    />
  );
}
