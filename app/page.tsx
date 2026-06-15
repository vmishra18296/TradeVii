'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function LandingPage() {
  const [activeChart, setActiveChart] = useState<'weekly' | 'monthly'>('weekly');

  // Static demo stats for the landing page (no private data exposure)
  const tradingStats = {
    totalPL: 0,
    totalTurnover: 0,
    wins: 0,
    losses: 0,
    winRate: '0',
    totalTrades: 0,
    todayPL: 0,
  };

  const investmentStats = {
    totalInvested: 0,
    activeInvestors: 0,
    totalInvestors: 0,
    avgInvestment: 0,
  };

  // Empty chart data for display
  const chartData = useMemo(() => {
    const days = activeChart === 'weekly' ? 7 : 30;
    const data: { date: string; pl: number; turnover: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        pl: 0,
        turnover: 0,
      });
    }
    return data;
  }, [activeChart]);

  const maxPL = Math.max(...chartData.map((d) => Math.abs(d.pl)), 1);
  const maxTurnover = Math.max(...chartData.map((d) => d.turnover), 1);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <nav className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">TV</span>
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">Tradevii</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live Trading Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--text-primary)] mb-6 leading-tight">
            Smart Investment
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Portfolio Manager
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
            Track trades, manage investors, and monitor live portfolio performance with
            real-time analytics and transparent profit sharing.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
              Start Free
            </Link>
            <Link href="/login" className="px-8 py-3.5 text-base font-semibold bg-[var(--bg-card)] border border-[var(--border)] hover:border-indigo-500/40 text-[var(--text-primary)] rounded-xl transition-all hover:-translate-y-0.5">
              Guest Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Live Trading Stats */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 text-center hover:border-emerald-500/30 transition-all">
            <p className="text-xs uppercase text-[var(--text-muted)] font-medium mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${tradingStats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(tradingStats.totalPL)}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{tradingStats.totalTrades} trades executed</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 text-center hover:border-purple-500/30 transition-all">
            <p className="text-xs uppercase text-[var(--text-muted)] font-medium mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-purple-400">{tradingStats.winRate}%</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{tradingStats.wins}W / {tradingStats.losses}L</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 text-center hover:border-cyan-500/30 transition-all">
            <p className="text-xs uppercase text-[var(--text-muted)] font-medium mb-1">Turnover</p>
            <p className="text-2xl font-bold text-cyan-400">{formatCurrency(tradingStats.totalTurnover)}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Cumulative volume</p>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 text-center hover:border-amber-500/30 transition-all">
            <p className="text-xs uppercase text-[var(--text-muted)] font-medium mb-1">Today&apos;s P&L</p>
            <p className={`text-2xl font-bold ${tradingStats.todayPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(tradingStats.todayPL)}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Real-time tracking</p>
          </div>
        </div>
      </section>

      {/* Advanced Chart Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Performance Overview</h2>
            <p className="text-[var(--text-muted)] mt-1">Real-time trading performance chart</p>
          </div>
          <div className="flex gap-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1">
            <button
              onClick={() => setActiveChart('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeChart === 'weekly' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setActiveChart('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeChart === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
          {/* P&L Bar Chart */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">Daily Profit & Loss</h3>
            <div className="flex items-end gap-1 h-48">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-medium text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(d.pl)}
                  </div>
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${d.pl >= 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                    style={{ height: `${Math.max((Math.abs(d.pl) / maxPL) * 100, 4)}%` }}
                  />
                  <span className="text-[9px] text-[var(--text-muted)] mt-2 truncate w-full text-center">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Turnover Line indicator */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">Daily Turnover</h3>
            <div className="flex items-end gap-1 h-32">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-medium text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(d.turnover)}
                  </div>
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all duration-300"
                    style={{ height: `${Math.max((d.turnover / maxTurnover) * 100, 2)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment Data */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-4">Investment Portfolio</h2>
        <p className="text-center text-[var(--text-muted)] mb-12">Transparent investment tracking with guaranteed returns</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Investment summary cards */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Total Corpus</h3>
                <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full font-medium">Live</span>
              </div>
              <p className="text-3xl font-bold text-indigo-400">{formatCurrency(investmentStats.totalInvested)}</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">Across {investmentStats.totalInvestors} investors</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-xs text-[var(--text-muted)] uppercase font-medium">Active Investors</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{investmentStats.activeInvestors}</p>
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-xs text-[var(--text-muted)] uppercase font-medium">Avg. Investment</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{formatCurrency(investmentStats.avgInvestment)}</p>
              </div>
            </div>
          </div>

          {/* Returns breakdown */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Returns Structure</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-muted)]">Fixed Annual Return</span>
                  <span className="text-sm font-bold text-emerald-400">9%</span>
                </div>
                <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-muted)]">Profit Sharing</span>
                  <span className="text-sm font-bold text-purple-400">10%</span>
                </div>
                <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full w-[50%] bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-muted)]">Win Rate Performance</span>
                  <span className="text-sm font-bold text-indigo-400">{tradingStats.winRate}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" style={{ width: `${tradingStats.winRate}%` }} />
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)]">Compounding interest calculated daily. Profit share distributed monthly based on trading performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-4">
          Everything you need to manage investments
        </h2>
        <p className="text-center text-[var(--text-muted)] mb-16 max-w-xl mx-auto">Powerful tools for tracking, analyzing, and growing your portfolio</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Live Portfolio', desc: 'Real-time interest accrual with 9% annual fixed + trade profit sharing.', gradient: 'from-indigo-500/10 to-indigo-500/5', border: 'hover:border-indigo-500/40', icon: '📈' },
            { title: 'Trade Analytics', desc: 'Daily P&L charts, monthly turnover analysis, and performance insights.', gradient: 'from-purple-500/10 to-purple-500/5', border: 'hover:border-purple-500/40', icon: '📊' },
            { title: 'Excel Import', desc: 'Bulk upload trades from Excel files. Export reports with one click.', gradient: 'from-emerald-500/10 to-emerald-500/5', border: 'hover:border-emerald-500/40', icon: '📁' },
            { title: 'Investor Dashboard', desc: 'Each investor sees their personal portfolio, ROI, and projections.', gradient: 'from-cyan-500/10 to-cyan-500/5', border: 'hover:border-cyan-500/40', icon: '👥' },
            { title: 'Admin Controls', desc: 'Full control over trades, investors, approvals, and payouts.', gradient: 'from-amber-500/10 to-amber-500/5', border: 'hover:border-amber-500/40', icon: '⚙️' },
            { title: 'Mobile Ready', desc: 'Responsive design that works beautifully on all devices.', gradient: 'from-pink-500/10 to-pink-500/5', border: 'hover:border-pink-500/40', icon: '📱' },
          ].map((f) => (
            <div key={f.title} className={`bg-gradient-to-br ${f.gradient} bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 ${f.border} transition-all hover:-translate-y-1`}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback / Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-4">What Investors Say</h2>
        <p className="text-center text-[var(--text-muted)] mb-12">Trusted by investors who value transparency</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Rahul Sharma',
              role: 'Investor since 2024',
              message: 'Tradevii gives me complete transparency into where my money goes. The 9% fixed + profit share model is brilliant. I can track every trade in real time.',
              avatar: 'RS',
              color: 'from-indigo-500 to-purple-500',
              rating: 5,
            },
            {
              name: 'Priya Patel',
              role: 'Investor since 2025',
              message: 'The best investment platform I\'ve used. Monthly reports are detailed, withdrawals are smooth, and the team is very responsive. Highly recommend!',
              avatar: 'PP',
              color: 'from-emerald-500 to-cyan-500',
              rating: 5,
            },
            {
              name: 'Amit Verma',
              role: 'Investor since 2024',
              message: 'What I love most is the daily P&L tracking and the advanced analytics. It helps me understand exactly how my returns are being generated.',
              avatar: 'AV',
              color: 'from-amber-500 to-pink-500',
              rating: 5,
            },
          ].map((t) => (
            <div key={t.name} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 hover:border-indigo-500/20 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5">&ldquo;{t.message}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/10 border border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Ready to grow your wealth?</h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-lg mx-auto">Join our platform and start earning with transparent trading and guaranteed returns.</p>
            <Link href="/signup" className="inline-block px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">&copy; {new Date().getFullYear()} Tradevii. All rights reserved.</p>
      </footer>
    </div>
  );
}
