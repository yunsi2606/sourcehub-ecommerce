import { apiFetch } from './client';
import { NotificationResponse } from '@/types/api';

export const notificationApi = {
  getAll: (token: string, unreadOnly = false) =>
    apiFetch<NotificationResponse>(`/notifications?unreadOnly=${unreadOnly}`, { token }),

  markRead: (id: string, token: string) =>
    apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token }),

  markAllRead: (token: string) =>
    apiFetch('/notifications/read-all', { method: 'PATCH', token }),
};
