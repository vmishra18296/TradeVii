'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Card, Button, DateRangePicker, Tabs, Badge } from '@/components/ui';
import { formatCurrency, formatDate, todayStr } from '@/lib/utils';
import { calcInvestorInterestPrecise } from '@/lib/interest';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { trades, investors } = useAppStore();
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const filteredTrades = useMemo(() => {
    if (!dateRange) return trades;
    return trades.filter((t) => t.date >= dateRange.from && t.date <= dateRange.to);
  }, [trades, dateRange]);

  const totalPL = trades.reduce((s, t) => s + (t.netPL || 0), 0);
  const totalInvestment = investors.reduce((s, i) => s + (i.amount || 0), 0);

  // Investor report with interest calculations
  const investorReport = useMemo(() => {
    return investors.map((inv) => {
      const interest = calcInvestorInterestPrecise(inv.amount, inv.joinDate, trades, totalInvestment);
      return { ...inv, interest };
    });
  }, [investors, trades, totalInvestment]);

  // Daily summary report
  const dailySummary = useMemo(() => {
    const map = new Map<string, { pl: number; turnover: number; trades: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const existing = map.get(t.date) || { pl: 0, turnover: 0, trades: 0, wins: 0 };
      existing.pl += t.netPL || 0;
      existing.turnover += t.turnover || 0;
      existing.trades += 1;
      if ((t.netPL || 0) > 0) existing.wins += 1;
      map.set(t.date, existing);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([date, data]) => ({ date, ...data }));
  }, [filteredTrades]);

  // Monthly summary report
  const monthlySummary = useMemo(() => {
    const map = new Map<string, { pl: number; turnover: number; trades: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const month = t.date.slice(0, 7);
      const existing = map.get(month) || { pl: 0, turnover: 0, trades: 0, wins: 0 };
      existing.pl += t.netPL || 0;
      existing.turnover += t.turnover || 0;
      existing.trades += 1;
      if ((t.netPL || 0) > 0) existing.wins += 1;
      map.set(month, existing);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([month, data]) => ({ month, ...data, winRate: data.trades > 0 ? (data.wins / data.trades * 100) : 0 }));
  }, [filteredTrades]);

  function exportTrades() {
    const ws = XLSX.utils.json_to_sheet(
      filteredTrades.map((t) => ({
        Date: t.date, Stock: t.stock, Type: t.type, Quantity: t.quantity,
        'Buy Value': t.buyValue, 'Sell Value': t.sellValue, Turnover: t.turnover,
        'Net P&L': t.netPL, Strategy: t.strategy || '', Notes: t.notes || '',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trades');
    XLSX.writeFile(wb, `trades_report_${todayStr()}.xlsx`);
  }

  function exportInvestors() {
    const ws = XLSX.utils.json_to_sheet(
      investorReport.map((inv) => ({
        Name: inv.name, Phone: inv.phone, Email: inv.email || '',
        'Investment (₹)': inv.amount, 'Join Date': inv.joinDate,
        Status: inv.status || 'active',
        'Days Invested': inv.interest?.preciseDays?.toFixed(0) || 0,
        'Fixed Interest (₹)': inv.interest?.totalFixedInterest?.toFixed(2) || 0,
        'Profit Share (₹)': inv.interest?.tradeProfitShare?.toFixed(2) || 0,
        'Total Interest (₹)': inv.interest?.totalInterest?.toFixed(2) || 0,
        'Current Value (₹)': inv.interest?.totalAmount?.toFixed(2) || inv.amount,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Investors');
    XLSX.writeFile(wb, `investors_report_${todayStr()}.xlsx`);
  }

  function exportDailySummary() {
    const ws = XLSX.utils.json_to_sheet(
      dailySummary.map((d) => ({
        Date: d.date, 'Total Trades': d.trades, Wins: d.wins,
        'Win Rate (%)': d.trades > 0 ? ((d.wins / d.trades) * 100).toFixed(1) : '0',
        'Turnover (₹)': d.turnover, 'Net P&L (₹)': d.pl,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Summary');
    XLSX.writeFile(wb, `daily_summary_${todayStr()}.xlsx`);
  }

  function exportFullReport() {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Trades
    const wsTrades = XLSX.utils.json_to_sheet(filteredTrades.map((t) => ({
      Date: t.date, Stock: t.stock, Type: t.type, Qty: t.quantity,
      Buy: t.buyValue, Sell: t.sellValue, Turnover: t.turnover, 'P&L': t.netPL,
    })));
    XLSX.utils.book_append_sheet(wb, wsTrades, 'Trades');

    // Sheet 2: Investors
    const wsInv = XLSX.utils.json_to_sheet(investorReport.map((inv) => ({
      Name: inv.name, Amount: inv.amount, Joined: inv.joinDate,
      Interest: inv.interest?.totalInterest?.toFixed(2) || 0, Value: inv.interest?.totalAmount?.toFixed(2) || inv.amount,
    })));
    XLSX.utils.book_append_sheet(wb, wsInv, 'Investors');

    // Sheet 3: Monthly
    const wsMonthly = XLSX.utils.json_to_sheet(monthlySummary.map((m) => ({
      Month: m.month, Trades: m.trades, 'Win Rate': `${m.winRate.toFixed(1)}%`, Turnover: m.turnover, 'P&L': m.pl,
    })));
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly');

    XLSX.writeFile(wb, `tradevii_full_report_${todayStr()}.xlsx`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports & Export</h1>
        <Button onClick={exportFullReport}>Download Full Report (Excel)</Button>
      </div>

      {/* Date Range */}
      <Card>
        <DateRangePicker
          onApply={(from, to) => setDateRange({ from, to })}
          onClear={() => setDateRange(null)}
        />
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          tabs={[
            { id: 'daily', label: 'Daily Summary' },
            { id: 'monthly', label: 'Monthly Summary' },
            { id: 'investors', label: 'Investor Report' },
            { id: 'trades', label: 'Trade Log' },
          ]}
          defaultTab="daily"
        >
          {(tab) => {
            if (tab === 'daily') {
              return (
                <div>
                  <div className="flex justify-end mb-3">
                    <Button variant="ghost" onClick={exportDailySummary}>Export Daily</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left py-3 px-3 text-[var(--text-muted)] text-xs">Date</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Trades</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Wins</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Win Rate</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Turnover</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Net P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailySummary.slice(0, 30).map((d) => (
                          <tr key={d.date} className="border-b border-[var(--border)]/50 hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 text-slate-300">{formatDate(d.date)}</td>
                            <td className="py-2.5 px-3 text-right text-slate-300">{d.trades}</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400">{d.wins}</td>
                            <td className="py-2.5 px-3 text-right">
                              <Badge variant={d.trades > 0 && (d.wins / d.trades) >= 0.5 ? 'success' : 'error'}>
                                {d.trades > 0 ? ((d.wins / d.trades) * 100).toFixed(0) : 0}%
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(d.turnover)}</td>
                            <td className={`py-2.5 px-3 text-right font-semibold ${d.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatCurrency(d.pl)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            if (tab === 'monthly') {
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-3 text-[var(--text-muted)] text-xs">Month</th>
                        <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Trades</th>
                        <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Win Rate</th>
                        <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Turnover</th>
                        <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Net P&L</th>
                        <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let cumulative = 0;
                        return [...monthlySummary].reverse().map((m) => {
                          cumulative += m.pl;
                          return (
                            <tr key={m.month} className="border-b border-[var(--border)]/50 hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 text-[var(--text-primary)] font-medium">{m.month}</td>
                              <td className="py-2.5 px-3 text-right text-slate-300">{m.trades}</td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge variant={m.winRate >= 50 ? 'success' : 'error'}>{m.winRate.toFixed(0)}%</Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(m.turnover)}</td>
                              <td className={`py-2.5 px-3 text-right font-semibold ${m.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(m.pl)}
                              </td>
                              <td className={`py-2.5 px-3 text-right font-medium ${cumulative >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                                {formatCurrency(cumulative)}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              );
            }

            if (tab === 'investors') {
              return (
                <div>
                  <div className="flex justify-end mb-3">
                    <Button variant="ghost" onClick={exportInvestors}>Export Investors</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left py-3 px-3 text-[var(--text-muted)] text-xs">Name</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Investment</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Fixed Interest</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Profit Share</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Total Interest</th>
                          <th className="text-right py-3 px-3 text-[var(--text-muted)] text-xs">Current Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investorReport.map((inv, idx) => (
                          <tr key={idx} className="border-b border-[var(--border)]/50 hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 text-[var(--text-primary)] font-medium">{inv.name}</td>
                            <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(inv.amount)}</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400">{formatCurrency(inv.interest?.totalFixedInterest || 0)}</td>
                            <td className="py-2.5 px-3 text-right text-indigo-400">{formatCurrency(inv.interest?.tradeProfitShare || 0)}</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{formatCurrency(inv.interest?.totalInterest || 0)}</td>
                            <td className="py-2.5 px-3 text-right text-[var(--text-primary)] font-bold">{formatCurrency(inv.interest?.totalAmount || inv.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            // trades tab
            return (
              <div>
                <div className="flex justify-end mb-3">
                  <Button variant="ghost" onClick={exportTrades}>Export Trades</Button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-2">{filteredTrades.length} trades {dateRange ? `(${dateRange.from} to ${dateRange.to})` : '(all time)'}</p>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--bg-card)]">
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-2 px-3 text-[var(--text-muted)] text-xs">Date</th>
                        <th className="text-left py-2 px-3 text-[var(--text-muted)] text-xs">Stock</th>
                        <th className="text-left py-2 px-3 text-[var(--text-muted)] text-xs">Type</th>
                        <th className="text-right py-2 px-3 text-[var(--text-muted)] text-xs">Qty</th>
                        <th className="text-right py-2 px-3 text-[var(--text-muted)] text-xs">Turnover</th>
                        <th className="text-right py-2 px-3 text-[var(--text-muted)] text-xs">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredTrades].reverse().slice(0, 100).map((t, i) => (
                        <tr key={i} className="border-b border-[var(--border)]/50">
                          <td className="py-2 px-3 text-slate-300 text-xs">{formatDate(t.date)}</td>
                          <td className="py-2 px-3 text-[var(--text-primary)]">{t.stock}</td>
                          <td className="py-2 px-3 text-[var(--text-muted)] text-xs">{t.type}</td>
                          <td className="py-2 px-3 text-right text-slate-300">{t.quantity}</td>
                          <td className="py-2 px-3 text-right text-slate-300">{formatCurrency(t.turnover)}</td>
                          <td className={`py-2 px-3 text-right font-medium ${(t.netPL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(t.netPL)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }}
        </Tabs>
      </Card>
    </div>
  );
}
