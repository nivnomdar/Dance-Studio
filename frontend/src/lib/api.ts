const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const apiService = {
  // Classes API
  classes: {
    async getAll(): Promise<any[]> {
      const response = await fetch(`${API_BASE_URL}/classes`);
      return handleResponse<any[]>(response);
    },

    async getById(id: string): Promise<any> {
      const response = await fetch(`${API_BASE_URL}/classes/${id}`);
      return handleResponse<any>(response);
    },

    async getBySlug(slug: string): Promise<any> {
      const response = await fetch(`${API_BASE_URL}/classes/slug/${slug}`);
      return handleResponse<any>(response);
    }
  }
}; 