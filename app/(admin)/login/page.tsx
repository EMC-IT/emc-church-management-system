'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginForm from '@/components/auth/login-form';
import { ChurchLogo } from '@/components/landing/church-logo';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137A96]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 flex flex-col justify-between py-8 px-4">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <ChurchLogo />
      </div>

      <div className="w-full max-w-md mx-auto my-auto">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-extrabold text-[#0C2738] mb-2 tracking-tight">
            Members & Staff Portal
          </h1>
          <p className="font-body text-[#475569] text-sm">
            Sign in to access your church administration and ministry dashboard
          </p>
        </div>
        <LoginForm />
      </div>

      <div className="text-center text-xs text-[#64748B] py-4">
        © {new Date().getFullYear()} Empowerment Mountain Church. All rights reserved.
      </div>
    </div>
  );
}
