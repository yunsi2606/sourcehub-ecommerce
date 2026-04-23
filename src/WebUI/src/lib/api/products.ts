import { apiFetch } from './client';
import { ProductListResponse, ProductDetail } from '@/types/api';

// Public endpoints
export const productApi = {
  getList: (params: Record<string, unknown> = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch<ProductListResponse>(`/products${query ? `?${query}` : ''}`);
  },

  getBySlug: (slug: string) =>
    apiFetch<ProductDetail>(`/products/${slug}`),
};

// Admin endpoints
export const adminProductApi = {
  getList: (token: string, params: Record<string, unknown> = {}) => {
    const query = new URLSearchParams(
      Object.entries({ ...params, isActive: undefined }) // admin sees all
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch<ProductListResponse>(`/products${query ? `?${query}` : ''}`, { token });
  },

  getById: (id: string, token: string) =>
    apiFetch<ProductDetail>(`/products/admin/${id}`, { token }),

  create: (body: unknown, token: string) =>
    apiFetch<ProductDetail>('/products', { method: 'POST', body: JSON.stringify(body), token }),

  update: (id: string, body: unknown, token: string) =>
    apiFetch<ProductDetail>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body), token }),

  delete: (id: string, token: string) =>
    apiFetch<void>(`/products/${id}`, { method: 'DELETE', token }),

  uploadFile: (id: string, file: File, fileType: "Image" | "Video" | "SourceCodeArchive", isPreview: boolean, token: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);
    formData.append("isPreview", String(isPreview));
    return apiFetch(`/products/${id}/files`, { method: 'POST', body: formData, token });
  },
};
