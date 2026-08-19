'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAdminAuth } from '@/components/providers/AdminAuthProvider';
import { useToast } from '@/components/providers/ToastProvider';

function safeAdminRedirect(value: string | null): string {
  if (!value || !value.startsWith('/admin')) return '/admin';
  if (value.startsWith('//') || value.includes('@')) return '/admin';
  return value;
}

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isLoading } = useAdminAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeAdminRedirect(searchParams.get('redirect'));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        success('Authentication Successful', 'Welcome back to the Growthbridge Control Center.');
        router.push(redirect);
        router.refresh();
      } else {
        setErrorMsg(result.error || 'Login failed');
        error('Login Failed', result.error || 'Please check your credentials and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center py-12 relative overflow-hidden bg-[var(--surface-page)]">
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--gb-green-600)]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-[var(--gb-navy-600)]/30 blur-3xl rounded-full pointer-events-none opacity-40" />

      <Container size="md">
        <Card variant="glass" className="max-w-5xl mx-auto border-l-4 border-l-[var(--gb-green-600)] p-0 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 sm:p-10 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[var(--gradient-brand)] flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <Badge variant="green" className="text-[9px] uppercase tracking-widest">
                  MANAGEMENT PORTAL
                </Badge>
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Staff & Admin Login</h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Sign in to manage Growthbridge inquiries, talent applications, and projects.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Work Email *"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@growthbridge.org"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  maxLength={254}
                />
                <Input
                  label="Password *"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  maxLength={128}
                />

                {errorMsg && (
                  <div className="text-xs text-[var(--danger-text)] bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-xl px-3 py-2.5">
                    {errorMsg}
                  </div>
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={submitting || isLoading}>
                  {submitting || isLoading ? 'Signing in...' : 'Sign In to Control Center →'}
                </Button>

                <p className="text-[10px] text-center text-[var(--text-tertiary)] leading-relaxed pt-2">
                  Secure area. All access attempts are logged and audited.
                </p>
              </form>
            </div>

            <div className="hidden md:flex flex-col justify-between p-10 bg-[var(--surface-soft)] border-l border-[var(--border-subtle)] relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--gb-green-600)]/20 blur-3xl rounded-full pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--gradient-brand)] flex items-center justify-center font-bold text-white text-xl shadow-lg">GB</div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Growthbridge</h2>
                    <p className="text-[10px] text-[var(--chip-green-text)] font-semibold uppercase tracking-widest">Control Center v2.0</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Operational Command Center</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    The unified platform to manage Growthbridge&apos;s entire digital ecosystem — services, projects, talent, partners, and content — all without touching a single line of code.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ icon: '📊', label: 'Live Analytics' }, { icon: '👥', label: 'Talent Hub' }, { icon: '🚀', label: 'Projects' }, { icon: '⚙️', label: 'Divisions' }].map((f) => (
                    <div key={f.label} className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                      <span className="text-lg">{f.icon}</span>
                      <p className="text-[11px] font-bold text-[var(--text-primary)]">{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center text-[var(--text-secondary)]">Loading Login...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
