'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import { getRoleFromSession } from '@/lib/auth';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'investor' | 'guest')[];
  redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, redirectTo }: AuthGuardProps) {
  const router = useRouter();
  const { role, setRole } = useAppStore();

  useEffect(() => {
    const savedRole = getRoleFromSession();
    if (savedRole && !role) {
      setRole(savedRole);
    } else if (!savedRole && !role) {
      router.replace(redirectTo || '/login');
    }
  }, [role, setRole, router, redirectTo]);

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role as 'admin' | 'investor' | 'guest')) {
    router.replace(redirectTo || '/dashboard');
    return null;
  }

  return <>{children}</>;
}
