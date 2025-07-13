import { Class } from '../types/class';
import { Registration, RegistrationWithDetails, CreateRegistrationRequest } from '../types/registration';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('API Service: API_BASE_URL:', API_BASE_URL);

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

// פונקציה לקבלת headers עם authorization
async function getAuthHeaders(): Promise<HeadersInit> {
  console.log('getAuthHeaders: Starting...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('getAuthHeaders: Session result:', { session: session ? 'exists' : 'null', error });
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      console.log('getAuthHeaders: Added Authorization header');
    } else {
      console.log('getAuthHeaders: No access token found');
    }

    console.log('getAuthHeaders: Final headers:', headers);
    return headers;
  } catch (error) {
    console.error('getAuthHeaders: Error getting session:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
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
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        headers
      });
      return handleResponse<RegistrationWithDetails[]>(response);
    },

    async getMy(): Promise<RegistrationWithDetails[]> {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/registrations/my`, {
        headers
      });
      return handleResponse<RegistrationWithDetails[]>(response);
    },

    async getById(id: string): Promise<RegistrationWithDetails | null> {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        headers
      });
      return handleResponse<RegistrationWithDetails | null>(response);
    },

    async create(data: CreateRegistrationRequest, accessToken?: string): Promise<RegistrationWithDetails> {
      console.log('API Service: create() called');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('API Service: Added Authorization header with provided token');
      } else {
        console.log('API Service: No access token provided');
      }
      
      console.log('API Service: Creating registration with headers:', headers);
      console.log('API Service: Request URL:', `${API_BASE_URL}/registrations`);
      console.log('API Service: Request data:', data);
      
      try {
        const response = await fetch(`${API_BASE_URL}/registrations`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });
        
        console.log('API Service: Response status:', response.status);
        console.log('API Service: Response ok:', response.ok);
        
        return handleResponse<RegistrationWithDetails>(response);
      } catch (error) {
        console.error('API Service: Fetch error:', error);
        throw error;
      }
    },

    async updateStatus(id: string, status: string, accessToken?: string): Promise<RegistrationWithDetails> {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        const authHeaders = await getAuthHeaders();
        Object.assign(headers, authHeaders);
      }

      console.log('API Service: updateStatus called with:', { id, status, headers });
      console.log('API Service: Request URL:', `${API_BASE_URL}/registrations/${id}/status`);
      console.log('API Service: Request body:', JSON.stringify({ status }));
      
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      
      console.log('API Service: updateStatus response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service: Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return handleResponse<RegistrationWithDetails>(response);
    },

    async cancelRegistration(id: string, accessToken?: string): Promise<RegistrationWithDetails> {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        const authHeaders = await getAuthHeaders();
        Object.assign(headers, authHeaders);
      }

      console.log('API Service: cancelRegistration called with:', { id, headers });
      console.log('API Service: Request URL:', `${API_BASE_URL}/registrations/${id}/cancel`);
      
      const response = await fetch(`${API_BASE_URL}/registrations/${id}/cancel`, {
        method: 'PUT',
        headers
      });
      
      console.log('API Service: cancelRegistration response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service: Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return handleResponse<RegistrationWithDetails>(response);
    },

    async delete(id: string): Promise<{ message: string }> {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE',
        headers
      });
      return handleResponse<{ message: string }>(response);
    }
  }
}; 