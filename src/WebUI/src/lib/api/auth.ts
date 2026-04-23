import { apiFetch } from './client';
import { AuthResponse, AuthUser } from '@/types/api';

async function proxyFetch<T>(path: string, body?: Record<string, unknown>, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    proxyFetch<AuthResponse>('/api/auth/login', body),

  register: (body: { fullName: string; email: string; password: string }) =>
    proxyFetch<AuthResponse>('/api/auth/register', body),

  logout: (token: string) =>
    proxyFetch<void>('/api/auth/logout', undefined, token),

  me: (token: string) =>
    apiFetch<AuthUser>('/auth/me', { token }),
};
