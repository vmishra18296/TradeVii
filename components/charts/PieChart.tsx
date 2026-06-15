'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { Investor } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#6366f1', '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308'];

interface PieChartProps {
  investors: Investor[];
}

export function PieChart({ investors }: PieChartProps) {
  const chartData = useMemo(() => {
    if (investors.length === 0) {
      return {
        labels: ['No investors'],
        datasets: [{ data: [1], backgroundColor: ['#1e293b'], borderWidth: 0 }],
      };
    }
    return {
      labels: investors.map((i) => i.name),
      datasets: [
        {
          data: investors.map((i) => i.amount),
          backgroundColor: COLORS.slice(0, investors.length),
          borderWidth: 0,
        },
      ],
    };
  }, [investors]);

  return (
    <Doughnut
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 },
          },
        },
      }}
    />
  );
}
