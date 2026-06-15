'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'purple';
}

const colorMap = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

export function StatsCard({ title, value, change, changeLabel, icon, color = 'indigo' }: StatsCardProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
          {change != null && (
            <p className={`text-xs font-medium flex items-center gap-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                {change >= 0
                  ? <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                }
              </svg>
              {Math.abs(change).toFixed(1)}% {changeLabel || ''}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
