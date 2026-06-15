'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import { logOut, setRoleInSession } from '@/lib/auth';
import { showToast } from '@/components/ui/Toast';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

/**
 * Auto-logout after inactivity. Resets timer on user interaction.
 */
export function useSessionTimeout() {
  const router = useRouter();
  const { role, setRole } = useAppStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(async () => {
    if (!role) return;
    try {
      await logOut();
    } catch {
      // ignore logout errors
    }
    setRole(null);
    setRoleInSession(null);
    sessionStorage.clear();
    showToast('Session expired due to inactivity', 'warning');
    router.push('/login');
  }, [role, setRole, router]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (role) {
      timeoutRef.current = setTimeout(handleLogout, TIMEOUT_MS);
    }
  }, [role, handleLogout]);

  useEffect(() => {
    if (!role) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [role, resetTimer]);
}
