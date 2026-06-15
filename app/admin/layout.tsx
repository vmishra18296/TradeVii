'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAppStore } from '@/stores/useAppStore';
import { getRoleFromSession, verifyAdminPin, setRoleInSession } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/admin/settings', label: 'Settings', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { href: '/admin/logs', label: 'Activity Log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

function AdminLoginScreen() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const { setRole } = useAppStore();
  const router = useRouter();

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const lockRemaining = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 1000) : 0;

  // Countdown timer for lock
  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockedUntil!) {
        setLockedUntil(null);
        setAttempts(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    setLoading(true);
    try {
      const valid = await verifyAdminPin(pin);
      if (valid) {
        setRole('admin');
        setRoleInSession('admin');
        setAttempts(0);
        showToast('Welcome, Admin!', 'success');
        router.push('/dashboard');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockedUntil(Date.now() + 60000); // Lock for 60 seconds
          showToast('Too many failed attempts. Locked for 60 seconds.', 'error');
        } else {
          showToast(`Invalid PIN (${5 - newAttempts} attempts remaining)`, 'error');
        }
      }
    } catch {
      showToast('Login failed', 'error');
    }
    setPin('');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Access</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Enter your admin PIN to continue</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl shadow-black/5">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {isLocked && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                <p className="text-sm text-red-400 font-medium">Account locked</p>
                <p className="text-xs text-red-400/70 mt-1">Try again in {lockRemaining}s</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 6-digit PIN"
                disabled={isLocked}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-center text-lg tracking-widest disabled:opacity-50"
                required
                autoComplete="current-password"
                maxLength={10}
              />
            </div>
            <Button type="submit" loading={loading} disabled={isLocked} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-500/25">
              {isLocked ? `Locked (${lockRemaining}s)` : 'Access Admin Panel'}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)] mt-4">
            Not an admin?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300">
              Investor Login
            </a>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

function AdminContent({ children }: { children: React.ReactNode }) {
  useFirebaseData();
  useSessionTimeout();
  useKeyboardShortcuts();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 flex flex-col bg-[var(--bg-primary)] border-r border-[var(--border)] z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border)]">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-red-500/20">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-bold text-[var(--text-primary)]">Admin Panel</span>
          <button
            className="ml-auto lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-red-600/10 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/10'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }
                `}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Divider + Back to Dashboard */}
          <div className="pt-6 mt-4 border-t border-[var(--border)]">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </nav>

        <div className="px-5 py-4 border-t border-[var(--border)]">
          <div className="text-[10px] text-slate-600">Admin Panel v2.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header with sidebar toggle */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border)]">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-[var(--text-muted)]"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-full font-medium">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useAppStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const savedRole = getRoleFromSession();
    if (savedRole && !role) {
      setRole(savedRole);
    }
    setChecked(true);
  }, [role, setRole]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (role !== 'admin') {
    return <AdminLoginScreen />;
  }

  return <AdminContent>{children}</AdminContent>;
}
