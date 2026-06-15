'use client';

import { create } from 'zustand';
import type { Trade, Investor, Account, UserRole, Notification, ThemeMode } from '@/types';

interface AppState {
  // Data
  trades: Trade[];
  investors: Investor[];
  account: Account | null;

  // Auth
  role: UserRole;
  investorName: string;
  investorMobile: string;

  // UI
  sidebarOpen: boolean;
  loading: boolean;
  theme: ThemeMode;

  // Notifications
  notifications: Notification[];

  // Actions
  setTrades: (trades: Trade[]) => void;
  setInvestors: (investors: Investor[]) => void;
  setAccount: (account: Account | null) => void;
  setRole: (role: UserRole) => void;
  setInvestorInfo: (name: string, mobile: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Computed helpers
  getTotalInvestment: () => number;
  getTodayTurnover: () => number;
  getTodayPL: () => number;
  getYearlyTurnover: () => number;
  getWinRate: () => number;
  getActiveInvestors: () => number;
  getMonthlyPL: () => number;
  getStreakDays: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  trades: [],
  investors: [],
  account: null,
  role: null,
  investorName: '',
  investorMobile: '',
  sidebarOpen: false,
  loading: true,
  theme: 'dark',
  notifications: [],

  setTrades: (trades) => set({ trades }),
  setInvestors: (investors) => set({ investors }),
  setAccount: (account) => set({ account }),
  setRole: (role) => set({ role }),
  setInvestorInfo: (name, mobile) => set({ investorName: name, investorMobile: mobile }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoading: (loading) => set({ loading }),
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradevii_theme', theme);
    }
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  addNotification: (notification) => {
    const n: Notification = {
      ...notification,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      read: false,
    };
    set((s) => ({ notifications: [n, ...s.notifications].slice(0, 50) }));
  },
  markNotificationRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
  },
  clearNotifications: () => set({ notifications: [] }),

  getTotalInvestment: () => {
    return get().investors.reduce((s, i) => s + (i.amount || 0), 0);
  },

  getTodayTurnover: () => {
    const today = new Date().toISOString().split('T')[0];
    return get()
      .trades.filter((t) => t.date === today)
      .reduce((s, t) => s + (t.turnover || 0), 0);
  },

  getTodayPL: () => {
    const today = new Date().toISOString().split('T')[0];
    return get()
      .trades.filter((t) => t.date === today)
      .reduce((s, t) => s + (t.netPL || 0), 0);
  },

  getYearlyTurnover: () => {
    const year = String(new Date().getFullYear());
    return get()
      .trades.filter((t) => t.date && t.date.startsWith(year))
      .reduce((s, t) => s + (t.turnover || 0), 0);
  },

  getWinRate: () => {
    const trades = get().trades;
    if (trades.length === 0) return 0;
    const wins = trades.filter((t) => t.netPL > 0).length;
    return (wins / trades.length) * 100;
  },

  getActiveInvestors: () => {
    return get().investors.filter((i) => !i.status || i.status === 'active').length;
  },

  getMonthlyPL: () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return get()
      .trades.filter((t) => t.date && t.date.startsWith(month))
      .reduce((s, t) => s + (t.netPL || 0), 0);
  },

  getStreakDays: () => {
    const trades = get().trades;
    if (trades.length === 0) return 0;
    const dates = [...new Set(trades.map((t) => t.date))].sort().reverse();
    let streak = 0;
    for (const d of dates) {
      const dayPL = trades.filter((t) => t.date === d).reduce((s, t) => s + (t.netPL || 0), 0);
      if (dayPL > 0) streak++;
      else break;
    }
    return streak;
  },
}));
