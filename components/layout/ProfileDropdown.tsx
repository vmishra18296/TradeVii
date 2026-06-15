'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import { useRole } from '@/hooks/useRole';
import { logOut, setRoleInSession } from '@/lib/auth';
import { getInitials } from '@/lib/utils';

export function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { role, investorName, setRole } = useAppStore();
  const { isAdmin } = useRole();

  const displayName = isAdmin ? 'Admin' : investorName || 'Guest';
  const initials = isAdmin ? 'A' : getInitials(displayName);
  const roleLabel = isAdmin ? 'Administrator' : role === 'investor' ? 'Investor' : 'Guest';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logOut();
    setRole(null);
    setRoleInSession(null);
    sessionStorage.clear();
    router.push('/login');
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        aria-label="Profile menu"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[#05080f] border border-slate-700 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Profile info */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
                <p className="text-xs text-[var(--text-muted)]">{roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {isAdmin && (
              <button
                onClick={() => { setOpen(false); router.push('/admin/logs'); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-[var(--text-primary)] transition-colors"
              >
                Admin Log
              </button>
            )}
            <button
              onClick={() => { setOpen(false); router.push('/dashboard/account'); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-[var(--text-primary)] transition-colors"
            >
              Account Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-[var(--border)] pt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
