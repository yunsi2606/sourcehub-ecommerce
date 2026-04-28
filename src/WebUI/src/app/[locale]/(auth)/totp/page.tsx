"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { apiFetch } from "@/lib/api/client";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

/**
 * /auth/totp — Shown when Google OAuth login requires 2FA verification.
 * Receives ?tempToken=... from the backend redirect.
 */
export default function TotpVerifyPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tempToken = searchParams.get("tempToken") ?? "";
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (next.every((d) => d !== "")) handleSubmit(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtp(digits);
      inputs.current[5]?.focus();
      handleSubmit(pasted);
    }
    e.preventDefault();
  };

  const handleSubmit = async (code: string) => {
    if (code.length !== 6 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<{ accessToken: string; user: any }>("/oauth/totp/verify", {
        method: "POST",
        body: JSON.stringify({ tempToken, otp: code }),
      });

      // Also trigger refresh to get the HttpOnly cookie set in the Next.js layer
      await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });

      setAuth(data.user, data.accessToken);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã xác thực không đúng.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-slate-500">{t("failedLogin")} <Link href="/login" className="text-primary underline">{t("retry")}</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-8 shadow-soft text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("twoFactorTitle")}</h1>
        <p className="text-sm text-slate-500 mb-8">
          {t("openApp")} <strong>Google Authenticator</strong> {t("enterCode")}
        </p>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* 6-digit OTP input */}
        <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                ${digit ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-slate-50 text-slate-900"}
                focus:border-primary focus:ring-2 focus:ring-primary/20
                disabled:opacity-50`}
            />
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-primary text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("authenticating")}
          </div>
        )}

        <Link href="/login" className="mt-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-3 h-3" />
          {t("returnLogin")}
        </Link>
      </div>
    </div>
  );
}
