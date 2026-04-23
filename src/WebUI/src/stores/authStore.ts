'use client';

import { create } from 'zustand';
import { AuthUser } from '@/types/api';
import Cookies from 'js-cookie';

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => {
    Cookies.set('user_role', user.role, { expires: 7, path: '/' });
    set({ user, accessToken });
  },
  clearAuth: () => {
    Cookies.remove('user_role', { path: '/' });
    set({ user: null, accessToken: null });
  },
}));
