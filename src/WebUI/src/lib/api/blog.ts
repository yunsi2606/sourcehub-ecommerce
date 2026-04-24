import { apiFetch } from './client';
import type {
  PostListResponse, PostDetailDto, BlogCategoryDto,
  CreatePostRequest, BlogCategoryRequest
} from '@/types/api';


export const blogApi = {
  getList: (params?: { search?: string; blogCategoryId?: string; tagSlug?: string; isFeatured?: boolean; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.blogCategoryId) searchParams.append('blogCategoryId', params.blogCategoryId);
    if (params?.tagSlug) searchParams.append('tagSlug', params.tagSlug);
    if (params?.isFeatured !== undefined) searchParams.append('isFeatured', String(params.isFeatured));
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    return apiFetch<PostListResponse>(`/posts?${searchParams.toString()}`);
  },

  getBySlug: (slug: string) => {
    return apiFetch<PostDetailDto>(`/posts/${slug}`);
  },

  getCategories: () => {
    return apiFetch<BlogCategoryDto[]>('/posts/categories');
  }
};

export const adminBlogApi = {
  // Posts
  getList: (accessToken: string, params?: { status?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    return apiFetch<PostListResponse>(`/posts/admin?${searchParams.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  },

  getById: (accessToken: string, id: string) => {
    return apiFetch<PostDetailDto>(`/posts/admin/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  },

  create: (accessToken: string, data: CreatePostRequest) => {
    return apiFetch<PostDetailDto>('/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  update: (accessToken: string, id: string, data: Partial<CreatePostRequest>) => {
    return apiFetch<PostDetailDto>(`/posts/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  delete: (accessToken: string, id: string) => {
    return apiFetch(`/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  },

  // Categories
  createCategory: (accessToken: string, data: BlogCategoryRequest) => {
    return apiFetch<BlogCategoryDto>('/posts/categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  updateCategory: (accessToken: string, id: string, data: BlogCategoryRequest) => {
    return apiFetch<BlogCategoryDto>(`/posts/categories/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  deleteCategory: (accessToken: string, id: string) => {
    return apiFetch(`/posts/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  },

  // Media (Direct to post, though we use generic files API for temp uploads)
  deleteMedia: (accessToken: string, postId: string, mediaId: string) => {
    return apiFetch(`/posts/${postId}/media/${mediaId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }
};
