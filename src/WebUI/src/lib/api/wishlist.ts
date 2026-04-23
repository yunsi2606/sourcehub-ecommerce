import { apiFetch } from './client';
import { WishlistItem } from '@/types/api';

export const wishlistApi = {
  getAll: (token: string) => apiFetch<WishlistItem[]>('/wishlist', { token }),

  add: (productId: string, token: string) =>
    apiFetch(`/wishlist/${productId}`, { method: 'POST', token }),

  remove: (productId: string, token: string) =>
    apiFetch(`/wishlist/${productId}`, { method: 'DELETE', token }),

  check: (productId: string, token: string) =>
    apiFetch<{ inWishlist: boolean }>(`/wishlist/${productId}/check`, { token }),
};
