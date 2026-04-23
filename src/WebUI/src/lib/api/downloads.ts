import { apiFetch } from './client';
import { OrderItem, DownloadUrlResponse } from '@/types/api';

export const downloadApi = {
  getMyDownloads: (token: string) =>
    apiFetch<OrderItem[]>('/downloads/my', { token }),

  getDownloadUrl: (orderItemId: string, fileId: string, token: string) =>
    apiFetch<DownloadUrlResponse>(`/downloads/${orderItemId}/${fileId}`, { token }),
};
