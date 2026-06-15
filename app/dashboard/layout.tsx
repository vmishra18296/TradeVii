'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastContainer } from '@/components/ui/Toast';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function DashboardContent({ children }: { children: React.ReactNode }) {
  useFirebaseData();
  useSessionTimeout();
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardContent>{children}</DashboardContent>
    </AuthGuard>
  );
}
