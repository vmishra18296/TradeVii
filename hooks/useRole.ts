'use client';

import { useAppStore } from '@/stores/useAppStore';
import type { UserRole } from '@/types';

/**
 * Hook that returns role info and helper booleans.
 */
export function useRole() {
  const role = useAppStore((s) => s.role);

  return {
    role,
    isAdmin: role === 'admin',
    isInvestor: role === 'investor',
    isGuest: role === 'guest',
    isAuthenticated: role !== null,
    canWrite: role === 'admin',
    canViewAll: role === 'admin' || role === 'guest',
  };
}
