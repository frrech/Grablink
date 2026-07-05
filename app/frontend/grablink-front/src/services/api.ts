const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ShareResponse {
  code: string;
  url: string;
  expiresAt: string;
}

export interface AccessResponse {
  code: string;
  url: string;
  title?: string;
  expiresAt: string;
  createdAt: string;
  qrCode?: string;
}

class GrablinkAPI {
  async createShare(url: string): Promise<ShareResponse> {
    const response = await fetch(`${API_BASE_URL}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create share');
    }

    return response.json();
  }

  async accessShare(code: string): Promise<AccessResponse> {
    const response = await fetch(`${API_BASE_URL}/share/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to access share');
    }

    return response.json();
  }
}

export const grablinkAPI = new GrablinkAPI();
