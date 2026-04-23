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

    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

    // We use a raw fetch here because apiFetch sets Content-Type to application/json
    // For FormData, the browser must automatically set Content-Type to multipart/form-data with the correct boundary
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'omit' // Admin endpoint usually expects Bearer token
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Upload failed');
    }

    return res.json();
  }
};
