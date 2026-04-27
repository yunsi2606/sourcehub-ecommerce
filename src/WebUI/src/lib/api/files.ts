import { apiFetch } from './client';

export interface UploadResponse {
  url: string;
  fullUrl: string;
  fileName: string;
  fileSize: number;
}

export const fileApi = {
  uploadTemp: async (file: File, token: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<UploadResponse>('/files/upload', {
      method: 'POST',
      token,
      body: formData,
    });
  },

  uploadMediaTemp: async (file: File, token: string): Promise<UploadResponse & { mimeType: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<UploadResponse & { mimeType: string }>('/files/upload-media', {
      method: 'POST',
      token,
      body: formData,
    });
  }
};
