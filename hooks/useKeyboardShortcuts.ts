'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Global keyboard shortcuts for power users.
 * Alt+D = Dashboard, Alt+T = Trading, Alt+I = Investors
 * Alt+A = Analytics, Alt+R = Reports, Alt+K = Toggle Theme
 * Escape = Close sidebar on mobile
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setSidebarOpen, toggleTheme, role } = useAppStore();

  useEffect(() => {
    if (!role) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
        return;
      }

      const shortcuts: ShortcutMap = {
        'alt+d': () => router.push('/dashboard'),
        'alt+t': () => router.push('/dashboard/trading'),
        'alt+i': () => router.push('/dashboard/investors'),
        'alt+a': () => router.push('/dashboard/analytics'),
        'alt+r': () => router.push('/dashboard/reports'),
        'alt+w': () => router.push('/dashboard/withdrawals'),
        'alt+j': () => router.push('/dashboard/journal'),
        'alt+k': () => toggleTheme(),
      };

      if (e.key === 'Escape') {
        setSidebarOpen(false);
        return;
      }

      const key = `${e.altKey ? 'alt+' : ''}${e.key.toLowerCase()}`;
      const action = shortcuts[key];
      if (action) {
        e.preventDefault();
        action();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [role, router, setSidebarOpen, toggleTheme]);
}
