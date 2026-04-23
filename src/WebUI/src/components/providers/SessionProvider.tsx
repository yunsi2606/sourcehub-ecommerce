'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Mounts once at app root. Calls /api/auth/refresh to restore the in-memory
 * access token from the HttpOnly refresh_token cookie after a page reload.
 * Silent — does nothing if no session exists.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // Only attempt to refresh if we know the user has a session cookie
    import("js-cookie").then((Cookies) => {
      if (Cookies.default.get("user_role")) {
        fetch('/api/auth/refresh', { method: 'POST' })
          .then(async (res) => {
            if (!res.ok) {
              // If refresh fails (e.g. expired), clear the cookie
              Cookies.default.remove("user_role", { path: '/' });
              return;
            }
            const data = await res.json();
            setAuth(data.user, data.accessToken);
          })
          .catch(() => {
            // Network error - ignore silently
          });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
