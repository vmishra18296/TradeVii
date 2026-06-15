'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { PerformanceOverviewPoint } from '@/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PerformanceOverviewChartProps {
  chartData: PerformanceOverviewPoint[];
  investedCapital: number;
}

export function PerformanceOverviewChart({ chartData, investedCapital }: PerformanceOverviewChartProps) {
  const { profit, loss, winRate, totalTurnover, netPL } = useMemo(() => {
    const profit = chartData.reduce((sum, point) => sum + (point.pl > 0 ? point.pl : 0), 0);
    const loss = chartData.reduce((sum, point) => sum + (point.pl < 0 ? Math.abs(point.pl) : 0), 0);
    const netPL = profit - loss;
    const totalTurnover = chartData.reduce((sum, point) => sum + point.turnover, 0);
    const winRate = chartData.length > 0 ? Math.round((chartData.filter((p) => p.pl > 0).length / chartData.length) * 100) : 0;
    return { profit, loss, winRate, totalTurnover, netPL };
  }, [chartData]);

  const data = useMemo(
    () => ({
      labels: ['Invested', 'Profit', 'Loss'],
      datasets: [
        {
          data: investedCapital === 0 && profit === 0 && loss === 0 ? [1, 0, 0] : [investedCapital, profit, loss],
          backgroundColor: ['rgba(59,130,246,0.75)', 'rgba(34,197,94,0.75)', 'rgba(239,68,68,0.75)'],
          borderColor: ['rgba(59,130,246,0.9)', 'rgba(34,197,94,0.9)', 'rgba(239,68,68,0.9)'],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [investedCapital, profit, loss]
  );

  return (
    <div className="relative h-[340px] sm:h-[360px]">
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', boxWidth: 12, padding: 16, usePointStyle: true },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed as number;
                  return `${context.label}: ${formatCurrency(value)}`;
                },
              },
            },
          },
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Net P&L</p>
        <p className={`text-3xl font-bold ${netPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(netPL)}
        </p>
        <div className="mt-2 space-y-1 text-[var(--text-muted)] text-xs">
          <p>{winRate}% win rate</p>
          <p>{formatCurrency(totalTurnover)} turnover</p>
          <p>Invested {formatCurrency(investedCapital)}</p>
        </div>
      </div>
    </div>
  );
}
