'use client';

import { formatCurrency } from '@/lib/utils';

interface KPI {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

interface KPICardsProps {
  totalInvestment: number;
  todayTurnover: number;
  todayPL: number;
  investorCount: number;
  yearlyTurnover: number;
  roi: string;
}

export function KPICards({
  totalInvestment,
  todayTurnover,
  todayPL,
  investorCount,
  yearlyTurnover,
  roi,
}: KPICardsProps) {
  const kpis: KPI[] = [
    {
      label: 'Total Investment',
      value: formatCurrency(totalInvestment),
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-indigo-400',
    },
    {
      label: "Today's Turnover",
      value: formatCurrency(todayTurnover),
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      color: 'text-blue-400',
    },
    {
      label: "Today's P&L",
      value: formatCurrency(todayPL),
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: todayPL >= 0 ? 'text-emerald-400' : 'text-red-400',
      trend: todayPL >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Investors',
      value: String(investorCount),
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'text-purple-400',
    },
    {
      label: 'Yearly Turnover',
      value: formatCurrency(yearlyTurnover),
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-cyan-400',
    },
    {
      label: 'ROI',
      value: roi + '%',
      icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-indigo-500/30 transition-all hover:-translate-y-0.5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${kpi.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={kpi.icon} />
            </svg>
            <span className="text-xs text-[var(--text-muted)] font-medium">{kpi.label}</span>
          </div>
          <p className={`text-lg font-bold ${kpi.trend === 'negative' ? 'text-red-400' : kpi.trend === 'positive' ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
            {kpi.value}
          </p>
        </div>
      ))}
    </div>
  );
}
