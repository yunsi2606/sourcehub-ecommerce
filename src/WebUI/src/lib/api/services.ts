import { apiFetch } from './client';
import { ServiceProjectDto } from '@/types/api';

// Customer endpoint
export const serviceProjectApi = {
  getMyProjects: (token: string) =>
    apiFetch<ServiceProjectDto[]>('/service-projects/my', { token }),
};

// Admin endpoints
export const adminServiceProjectApi = {
  getAll: (token: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch<ServiceProjectDto[]>(`/service-projects${query}`, { token });
  },

  update: (id: string, body: unknown, token: string) =>
    apiFetch<void>(`/service-projects/${id}`, { method: 'PUT', body: JSON.stringify(body), token }),
};
