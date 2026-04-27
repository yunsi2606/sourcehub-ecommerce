"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { GitGraph } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    const returnUrl = searchParams.get('returnUrl') || '/';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${baseUrl}/oauth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.accessToken);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-soft">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center text-white mb-4 hover:scale-105 transition-transform cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{t("loginTitle")}</h1>
          <p className="text-sm text-slate-500 mt-2">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("password")}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft flex items-center justify-center disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              t("signIn")
            )}
          </button>
        </form>

        <div className="mt-8 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <span className="relative bg-white px-4 text-xs text-slate-500 uppercase tracking-wider">{t("continueWith")}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center gap-2 h-11 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center gap-2 h-11 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
            Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          {t("noAccount")} <Link href="/auth/register" className="text-primary font-medium hover:underline">{t("signUp")}</Link>
        </p>
      </div>
    </div>
  );
}
