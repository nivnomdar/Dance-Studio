import { Class } from '../types/class';
import { Registration, RegistrationWithDetails, CreateRegistrationRequest } from '../types/registration';

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
    async getAll(): Promise<Class[]> {
      const response = await fetch(`${API_BASE_URL}/classes`);
      return handleResponse<Class[]>(response);
    },

    async getById(id: string): Promise<Class | null> {
      const response = await fetch(`${API_BASE_URL}/classes/${id}`);
      return handleResponse<Class | null>(response);
    },

    async getBySlug(slug: string): Promise<Class | null> {
      const response = await fetch(`${API_BASE_URL}/classes/slug/${slug}`);
      return handleResponse<Class | null>(response);
    }
  },

  // Registrations API
  registrations: {
    async getAll(): Promise<RegistrationWithDetails[]> {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        credentials: 'include'
      });
      return handleResponse<RegistrationWithDetails[]>(response);
    },

    async getMy(): Promise<RegistrationWithDetails[]> {
      const response = await fetch(`${API_BASE_URL}/registrations/my`, {
        credentials: 'include'
      });
      return handleResponse<RegistrationWithDetails[]>(response);
    },

    async getById(id: string): Promise<RegistrationWithDetails | null> {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        credentials: 'include'
      });
      return handleResponse<RegistrationWithDetails | null>(response);
    },

    async create(data: CreateRegistrationRequest): Promise<RegistrationWithDetails> {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      return handleResponse<RegistrationWithDetails>(response);
    },

    async updateStatus(id: string, status: string): Promise<RegistrationWithDetails> {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      return handleResponse<RegistrationWithDetails>(response);
    },

    async delete(id: string): Promise<{ message: string }> {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      return handleResponse<{ message: string }>(response);
    }
  }
}; 