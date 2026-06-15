'use client';

import { useAppStore } from '@/stores/useAppStore';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationCenter } from '@/components/ui/NotificationCenter';

export function Header() {
  const { setSidebarOpen } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-[var(--text-muted)]"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <ProfileDropdown />
      </div>
    </header>
  );
}
