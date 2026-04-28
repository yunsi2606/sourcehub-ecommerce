"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { useTranslations } from "next-intl";

/**
 * /auth/callback — Backend redirects here after successful OAuth login.
 * Reads ?accessToken=... from query, fetches user profile, then redirects.
 */
export default function OAuthCallbackPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const returnUrl = searchParams.get("returnUrl") || "/";

    if (!accessToken) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    // Fetch user profile using the new access token
    (async () => {
      try {
        // Trigger a refresh so the HttpOnly refresh cookie is set in Next.js server
        const data = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" }).then(r => r.json());
        if (data?.accessToken) {
          setAuth(data.user, data.accessToken);
        } else {
          // Fallback: use the access token directly from query
          const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (profileRes.ok) {
            const me = await profileRes.json();
            setAuth({ id: me.id, email: me.email, role: me.role, fullName: me.fullName, avatarUrl: me.avatarUrl }, accessToken);
          }
        }
        router.replace(returnUrl.startsWith("/") ? returnUrl : "/");
      } catch {
        clearAuth();
        router.replace("/login?error=oauth_failed");
      }
    })();
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">{t("authenticating")}</p>
      </div>
    </div>
  );
}
