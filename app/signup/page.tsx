'use client';

import { SignupForm } from '@/components/auth/SignupForm';
import { ToastContainer } from '@/components/ui/Toast';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <span className="text-white font-bold text-2xl">TV</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Sign up as an investor</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl shadow-black/5">
          <SignupForm />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
