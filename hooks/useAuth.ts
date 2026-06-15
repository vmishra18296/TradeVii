'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, getRoleFromSession } from '@/lib/auth';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Hook that monitors Firebase auth state and syncs with Zustand store.
 */
export function useAuth() {
  const { role, setRole, investorName, investorMobile } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const savedRole = getRoleFromSession();
    if (savedRole) {
      setRole(savedRole);
    }
  }, [setRole]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user && role === 'investor') {
        setRole(null);
        router.push('/login');
      }
    });
    return unsubscribe;
  }, [role, setRole, router]);

  return {
    role,
    isAdmin: role === 'admin',
    isInvestor: role === 'investor',
    isGuest: role === 'guest',
    isAuthenticated: role !== null,
    investorName,
    investorMobile,
  };
}
