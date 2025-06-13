// Base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Content-related API calls
export const contentApi = {
  getAll: () => fetcher('/content'),
  getById: (id: string) => fetcher(`/content/${id}`),
  create: (data: any) => fetcher('/content', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetcher(`/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetcher(`/content/${id}`, {
    method: 'DELETE',
  }),
};

// User-related API calls
export const userApi = {
  getProfile: () => fetcher('/users/profile'),
  updateProfile: (data: any) => fetcher('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// IPFS-related API calls
export const ipfsApi = {
  uploadFile: (formData: FormData) => {
    return fetch(`${API_BASE_URL}/ipfs/upload`, {
      method: 'POST',
      body: formData, // No Content-Type header as it's set automatically with FormData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    });
  },
};

// Subscription-related API calls
export const subscriptionApi = {
  getSubscriptions: () => fetcher('/subscriptions'),
  getByUser: (userId: string) => fetcher(`/subscriptions/user/${userId}`),
  subscribe: (data: any) => fetcher('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Export all API services
const api = {
  content: contentApi,
  user: userApi,
  ipfs: ipfsApi,
  subscription: subscriptionApi,
};

export default api; 