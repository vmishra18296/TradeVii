'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id || '');

  function handleChange(tabId: string) {
    setActive(tabId);
    onChange?.(tabId);
  }

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-[var(--border)] mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${active === tab.id
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-slate-600'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400">
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
