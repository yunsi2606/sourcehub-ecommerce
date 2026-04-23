import { apiFetch } from './client';
import { CreateOrderRequest, OrderDetail, OrderSummary } from '@/types/api';

// Customer endpoints
export const orderApi = {
  create: (body: CreateOrderRequest, token: string) =>
    apiFetch<OrderDetail>('/orders', { method: 'POST', body: JSON.stringify(body), token }),

  getMyOrders: (token: string, params: Record<string, unknown> = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch<OrderSummary[]>(`/orders/my${query ? `?${query}` : ''}`, { token });
  },

  getDetail: (id: string, token: string) =>
    apiFetch<OrderDetail>(`/orders/${id}`, { token }),
};

// Admin endpoints
export const adminOrderApi = {
  getAll: (token: string, params: Record<string, unknown> = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch<OrderSummary[]>(`/orders${query ? `?${query}` : ''}`, { token });
  },

  getDetail: (id: string, token: string) =>
    apiFetch<OrderDetail>(`/orders/admin/${id}`, { token }),

  fulfill: (id: string, token: string) =>
    apiFetch<void>(`/orders/${id}/fulfill`, { method: 'POST', token }),
};
