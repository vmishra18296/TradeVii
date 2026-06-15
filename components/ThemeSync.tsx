'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export function ThemeSync() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  // Restore theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tradevii_theme') as 'dark' | 'light' | null;
    if (saved && saved !== theme) {
      setTheme(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  return null;
}
