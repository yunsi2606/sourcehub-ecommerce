import { apiFetch } from './client';
import { Category, Tag } from '@/types/api';

export const categoryApi = {
  getAll: () => apiFetch<Category[]>('/categories'),
  create: (name: string, token: string) => apiFetch<Category>('/categories', { 
    method: 'POST', 
    body: JSON.stringify({ name }),
    token 
  }),
};

export const tagApi = {
  getAll: () => apiFetch<Tag[]>('/tags'),
  create: (name: string, token: string) => apiFetch<Tag>('/tags', { 
    method: 'POST', 
    body: JSON.stringify({ name }),
    token 
  }),
};
