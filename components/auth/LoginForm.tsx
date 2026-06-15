'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import {
  signInInvestor,
  setRoleInSession,
  setLoggedInvestorName,
  setLoggedInvestorMobile,
  resetPassword,
} from '@/lib/auth';
import { getSignupRequests } from '@/lib/database';
import { useAppStore } from '@/stores/useAppStore';

export function LoginForm() {
  const [mode, setMode] = useState<'investor' | 'guest'>('investor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();
  const { setRole, setInvestorInfo } = useAppStore();


  async function handleInvestorLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { uid } = await signInInvestor(email, password);
      // Fetch actual name and mobile from signup requests
      const requests = await getSignupRequests();
      const userRequest = requests.find((r) => r.uid === uid);
      const investorDisplayName = userRequest?.name || email.split('@')[0];
      const investorMobileNum = userRequest?.mobile || '';

      setRole('investor');
      setRoleInSession('investor');
      setLoggedInvestorName(investorDisplayName);
      setLoggedInvestorMobile(investorMobileNum);
      setInvestorInfo(investorDisplayName, investorMobileNum);
      showToast(`Welcome back, ${investorDisplayName}!`, 'success');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      showToast(message, 'error');
    }
    setLoading(false);
  }

  function handleGuestLogin() {
    setRole('guest');
    setRoleInSession('guest');
    showToast('Logged in as Guest', 'info');
    router.push('/dashboard');
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mode tabs */}
      <div className="flex rounded-lg bg-slate-800/50 p-1 mb-6">
        {(['investor', 'guest'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === m
                ? 'bg-indigo-600 text-white shadow'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Investor form */}
      {mode === 'investor' && (
        <form onSubmit={handleInvestorLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setResetEmail(email); setShowForgotPassword(true); }}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Forgot Password?
            </button>
            <p className="text-sm text-[var(--text-muted)]">
              <a href="/signup" className="text-indigo-400 hover:text-indigo-300">
                Sign up
              </a>
            </p>
          </div>
        </form>
      )}

      {/* Guest */}
      {mode === 'guest' && (
        <div className="text-center space-y-4">
          <p className="text-[var(--text-muted)] text-sm">
            Explore the dashboard with read-only access. No sign-up required.
          </p>
          <Button onClick={handleGuestLogin} className="w-full">
            Continue as Guest
          </Button>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Reset Password</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">Enter your email and we&apos;ll send a password reset link.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setResetLoading(true);
              try {
                await resetPassword(resetEmail);
                showToast('Reset email sent! Check your inbox.', 'success');
                setShowForgotPassword(false);
                setResetEmail('');
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Failed to send reset email';
                showToast(msg, 'error');
              }
              setResetLoading(false);
            }} className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                autoComplete="email"
              />
              <div className="flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowForgotPassword(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={resetLoading} className="flex-1">
                  Send Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
