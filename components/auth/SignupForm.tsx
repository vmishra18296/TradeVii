'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { signUpInvestor, resetPassword } from '@/lib/auth';

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      showToast('Enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      await signUpInvestor(email, password, name, mobile);
      showToast('Signup successful! Please wait for admin approval.', 'success');
      router.push('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      showToast(message, 'error');
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            required
            minLength={2}
            maxLength={80}
          />
        </div>
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
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile (10 digits)</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="9876543210"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            required
            pattern="[0-9]{10}"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Sign Up
        </Button>
        <p className="text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
