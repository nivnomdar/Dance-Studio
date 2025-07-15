import { Class } from '../types/class';
import { Registration, RegistrationWithDetails, CreateRegistrationRequest } from '../types/registration';
import { supabase } from './supabase';
import { calculateRetryDelay } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';


class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function fetchWithRetry<T>(
  fetchFn: () => Promise<Response>, 
  maxRetries: number = 2
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {

      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });
      
      const response = await Promise.race([
        fetchFn(),
        timeoutPromise
      ]);
      
      if (response.status === 429 && attempt < maxRetries) {
        const waitTime = calculateRetryDelay(attempt, 1000); // 1s, 2s, 4s
        await delay(waitTime);
        continue;
      }
      
      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error;

      
      if (error instanceof ApiError && error.status === 429 && attempt < maxRetries) {
        const waitTime = calculateRetryDelay(attempt, 1000); // 1s, 2s, 4s
        await delay(waitTime);
        continue;
      }
      
      // If it's not a 429 error or we've exhausted retries, throw the error
      throw error;
    }
  }
  
  throw lastError;
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

  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  } catch (error) {

    return {
      'Content-Type': 'application/json',
    };
  }
}

export const apiService = {
  // Classes API
  classes: {
    async getAll(): Promise<Class[]> {
      return fetchWithRetry<Class[]>(() => 
        fetch(`${API_BASE_URL}/classes`)
      );
    },

    async getById(id: string): Promise<Class | null> {
      return fetchWithRetry<Class | null>(() => 
        fetch(`${API_BASE_URL}/classes/${id}`)
      );
    },

    async getBySlug(slug: string): Promise<Class | null> {
      return fetchWithRetry<Class | null>(() => 
        fetch(`${API_BASE_URL}/classes/slug/${slug}`)
      );
    }
  },

  // Registrations API
  registrations: {
    async getAll(): Promise<RegistrationWithDetails[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetry<RegistrationWithDetails[]>(() => 
        fetch(`${API_BASE_URL}/registrations`, { headers })
      );
    },

    async getMy(): Promise<RegistrationWithDetails[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetry<RegistrationWithDetails[]>(() => 
        fetch(`${API_BASE_URL}/registrations/my`, { headers })
      );
    },

    async getById(id: string): Promise<RegistrationWithDetails | null> {
      const headers = await getAuthHeaders();
      return fetchWithRetry<RegistrationWithDetails | null>(() => 
        fetch(`${API_BASE_URL}/registrations/${id}`, { headers })
      );
    },

    async create(data: CreateRegistrationRequest, accessToken?: string): Promise<RegistrationWithDetails> {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      return fetchWithRetry<RegistrationWithDetails>(() => 
        fetch(`${API_BASE_URL}/registrations`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        })
      );
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


      
      return fetchWithRetry<RegistrationWithDetails>(() => 
        fetch(`${API_BASE_URL}/registrations/${id}/status`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status })
        })
      );
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


      
      return fetchWithRetry<RegistrationWithDetails>(() => 
        fetch(`${API_BASE_URL}/registrations/${id}/cancel`, {
          method: 'PUT',
          headers
        })
      );
    },

    async delete(id: string): Promise<{ message: string }> {
      const headers = await getAuthHeaders();
      return fetchWithRetry<{ message: string }>(() => 
        fetch(`${API_BASE_URL}/registrations/${id}`, {
          method: 'DELETE',
          headers
        })
      );
    }
  },

  // Admin API
  admin: {
    async getOverview(): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetry<any>(() => 
        fetch(`${API_BASE_URL}/classes/admin/overview`, { headers })
      );
    },

    async getCalendar(): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetry<any>(() => 
        fetch(`${API_BASE_URL}/classes/admin/calendar`, { headers })
      );
    }
  }
}; 