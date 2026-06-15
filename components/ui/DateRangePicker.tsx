'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  onApply: (from: string, to: string) => void;
  onClear?: () => void;
}

const presets = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'This Year', days: -1 },
  { label: 'All Time', days: -2 },
];

export function DateRangePicker({ onApply, onClear }: DateRangePickerProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function applyPreset(days: number) {
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];

    if (days === -2) {
      onClear?.();
      setFrom('');
      setTo('');
      return;
    }

    let fromDate: Date;
    if (days === -1) {
      fromDate = new Date(today.getFullYear(), 0, 1);
    } else if (days === 0) {
      fromDate = today;
    } else {
      fromDate = new Date(today.getTime() - days * 86400000);
    }

    const fromStr = fromDate.toISOString().split('T')[0];
    setFrom(fromStr);
    setTo(toStr);
    onApply(fromStr, toStr);
  }

  function handleApply() {
    if (from && to) {
      onApply(from, to);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <button
          key={p.label}
          onClick={() => applyPreset(p.days)}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-[var(--text-primary)] transition-colors"
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <span className="text-[var(--text-muted)] text-xs">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleApply}
          disabled={!from || !to}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
