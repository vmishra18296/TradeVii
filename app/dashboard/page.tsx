'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { calcInvestorInterest } from '@/lib/interest';
import { KPICards } from '@/components/dashboard/KPICards';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { TopInvestors } from '@/components/dashboard/TopInvestors';
import { LivePortfolio } from '@/components/dashboard/LivePortfolio';
import { PerformanceInsights } from '@/components/dashboard/PerformanceInsights';
import { DailyPLChart } from '@/components/charts/DailyPLChart';
import { PieChart } from '@/components/charts/PieChart';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  const { trades, investors, loading } = useAppStore();

  const totalInvestment = useMemo(
    () => investors.reduce((s, i) => s + (i.amount || 0), 0),
    [investors]
  );

  const todayTurnover = useAppStore((s) => s.getTodayTurnover());
  const todayPL = useAppStore((s) => s.getTodayPL());
  const yearlyTurnover = useAppStore((s) => s.getYearlyTurnover());

  const roi = useMemo(() => {
    if (totalInvestment <= 0) return '0';
    const totalProfit = investors.reduce((s, inv) => {
      const info = calcInvestorInterest(inv.amount || 0, inv.joinDate, trades, totalInvestment);
      return s + info.totalInterest;
    }, 0);
    return ((totalProfit / totalInvestment) * 100).toFixed(1);
  }, [investors, trades, totalInvestment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <KPICards
        totalInvestment={totalInvestment}
        todayTurnover={todayTurnover}
        todayPL={todayPL}
        investorCount={investors.length}
        yearlyTurnover={yearlyTurnover}
        roi={roi}
      />

      {/* Performance Insights */}
      <PerformanceInsights trades={trades} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Daily P&L Trend (30 Days)">
          <div className="h-64">
            <DailyPLChart trades={trades} />
          </div>
        </Card>
        <Card title="Investment Distribution">
          <div className="h-64">
            <PieChart investors={investors} />
          </div>
        </Card>
      </div>

      {/* Monthly chart */}
      <Card title="Monthly Turnover & P&L">
        <div className="h-72">
          <MonthlyChart trades={trades} />
        </div>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTrades trades={trades} />
        <TopInvestors investors={investors} trades={trades} />
      </div>

      {/* Live Portfolio */}
      <Card title="Live Investor Portfolio">
        <LivePortfolio investors={investors} trades={trades} />
      </Card>
    </div>
  );
}
