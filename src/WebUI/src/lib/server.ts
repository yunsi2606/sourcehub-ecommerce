process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { AuthUser } from "@/types/api";

// Chỉnh lại dùng thẳng HTTPS port 7169.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:7169/api/v1';

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

export interface ApiError {
  error: string;
}

async function post<T>(path: string, body: unknown, cookie?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error((data as ApiError).error ?? 'Request failed');
  return data as T;
}

// Server-side only — reads Set-Cookie from .NET to forward to browser
export async function serverLogin(email: string, password: string, cookie?: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Login failed');
  const setCookie = res.headers.get('set-cookie');
  return { data: data as AuthResult, setCookie };
}

export async function serverRegister(fullName: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Registration failed');
  const setCookie = res.headers.get('set-cookie');
  return { data: data as AuthResult, setCookie };
}

export async function serverRefresh(refreshToken: string) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const setCookie = res.headers.get('set-cookie');
  return { data: data as AuthResult, setCookie };
}

export async function serverLogout(refreshToken: string, accessToken: string) {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      Cookie: `refresh_token=${refreshToken}`,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
