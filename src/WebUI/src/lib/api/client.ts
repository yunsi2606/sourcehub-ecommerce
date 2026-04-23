import { useAuthStore } from '@/stores/authStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

// Prevent multiple simultaneous refresh calls
let refreshPromise: Promise<string | null> | null = null

export async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
    .then(async (res) => {
      if (!res.ok) {
        useAuthStore.getState().clearAuth()
        return null
      }
      const data = await res.json()
      useAuthStore.getState().setAuth(data.user, data.accessToken)
      return data.accessToken as string
    })
    .catch(() => {
      useAuthStore.getState().clearAuth()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

type FetchOptions = RequestInit & {
  token?: string
  _retry?: boolean
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, _retry, ...fetchOptions } = options

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { 
    ...fetchOptions, 
    headers,
    credentials: 'include' // Bắt buộc để browser tự động gửi và nhận cookie httpOnly
  })

  // Auto-refresh on 401 (expired access token), retry once
  if (res.status === 401 && !_retry && token) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      return apiFetch<T>(path, { ...options, token: newToken, _retry: true })
    }
    throw new Error('Session expired. Please log in again.')
  }

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API error ${res.status}: ${error}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
