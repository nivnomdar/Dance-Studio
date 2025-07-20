import { supabase } from './supabase';
import { Class } from '../types/class';
import { RegistrationWithDetails, CreateRegistrationRequest } from '../types/registration';
import { calculateRetryDelay } from '../utils/constants';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Request queue system to prevent rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent = 3; // Maximum 3 concurrent requests
  private activeRequests = 0;

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeRequests++;
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processNext();
        }
      });
      
      if (!this.processing) {
        this.processNext();
      }
    });
  }

  private processNext() {
    if (this.queue.length === 0 || this.activeRequests >= this.maxConcurrent) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const request = this.queue.shift();
    if (request) {
      request();
    }
  }
}

const requestQueue = new RequestQueue();

// Simple fetch with retry
const fetchWithRetryAndQueue = async <T>(
  fetchFn: () => Promise<Response>,
  retries = 1,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`fetchWithRetryAndQueue: attempt ${i + 1}/${retries + 1}`);
      const response = await fetchFn();
      console.log(`fetchWithRetryAndQueue: response status ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`fetchWithRetryAndQueue: received data:`, data);
        return data;
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      console.error(`fetchWithRetryAndQueue: HTTP error ${response.status}: ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`fetchWithRetryAndQueue: error on attempt ${i + 1}:`, lastError.message);
      
      if (i === retries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
              // console.log('API Error Response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(response.status, errorMessage);
  }
  return response.json();
}

// פונקציה לקבלת headers עם authorization - עם cache
let cachedSession: any = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5 דקות

// פונקציה לאיפוס ה-cache
export function clearSessionCache() {
  cachedSession = null;
  sessionCacheTime = 0;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const now = Date.now();
    
    // בדוק אם יש session cached ותקין
    if (cachedSession && (now - sessionCacheTime) < SESSION_CACHE_DURATION) {
      console.log('Using cached session');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };

      if (cachedSession.access_token) {
        headers['Authorization'] = `Bearer ${cachedSession.access_token}`;
      }
      return headers;
    }

    // אם אין cache או שהוא פג תוקף, קבל session חדש
    console.log('Fetching new session');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
      cachedSession = session;
      sessionCacheTime = now;
      console.log('Session cached');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }
}

export const apiService = {
  // Classes API
  classes: {
    async getAll(): Promise<Class[]> {
      return fetchWithRetryAndQueue<Class[]>(() => 
        fetch(`${API_BASE_URL}/classes`)
      );
    },

    async getAllForAdmin(): Promise<Class[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<Class[]>(() => 
        fetch(`${API_BASE_URL}/classes/admin`, { headers })
      );
    },

    async getById(id: string): Promise<Class | null> {
      return fetchWithRetryAndQueue<Class | null>(() => 
        fetch(`${API_BASE_URL}/classes/${id}`)
      );
    },

    async getBySlug(slug: string): Promise<Class | null> {
      return fetchWithRetryAndQueue<Class | null>(() => 
        fetch(`${API_BASE_URL}/classes/slug/${slug}`)
      );
    }
  },

  // Registrations API
  registrations: {
    async getAll(): Promise<RegistrationWithDetails[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<RegistrationWithDetails[]>(() => 
        fetch(`${API_BASE_URL}/registrations`, { headers })
      );
    },

    async getMy(): Promise<RegistrationWithDetails[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<RegistrationWithDetails[]>(() => 
        fetch(`${API_BASE_URL}/registrations/my`, { headers })
      );
    },

    async getById(id: string): Promise<RegistrationWithDetails | null> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<RegistrationWithDetails | null>(() => 
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
      
      // Debug log
          // console.log('API create registration - data:', data);
    // console.log('API create registration - headers:', headers);
      
      return fetchWithRetryAndQueue<RegistrationWithDetails>(() => 
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
      
      return fetchWithRetryAndQueue<RegistrationWithDetails>(() => 
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
      
      return fetchWithRetryAndQueue<RegistrationWithDetails>(() => 
        fetch(`${API_BASE_URL}/registrations/${id}/cancel`, {
          method: 'PUT',
          headers
        })
      );
    },

    async delete(id: string): Promise<{ message: string }> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<{ message: string }>(() => 
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
      const timestamp = Date.now();
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/classes/admin/overview?_t=${timestamp}`, { headers })
      );
    },

    async getClasses(): Promise<Class[]> {
      const headers = await getAuthHeaders();
      const timestamp = Date.now();
      return fetchWithRetryAndQueue<Class[]>(() => 
        fetch(`${API_BASE_URL}/classes?_t=${timestamp}`, { headers })
      );
    },

    async getRegistrations(): Promise<RegistrationWithDetails[]> {
      const headers = await getAuthHeaders();
      const timestamp = Date.now();
      return fetchWithRetryAndQueue<RegistrationWithDetails[]>(() => 
        fetch(`${API_BASE_URL}/registrations?_t=${timestamp}`, { headers })
      );
    },

    async getSessions(): Promise<any[]> {
      const headers = await getAuthHeaders();
      const timestamp = Date.now();
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/sessions/admin?_t=${timestamp}`, { headers })
      );
    },

    async getCalendar(): Promise<any> {
      const headers = await getAuthHeaders();
      const timestamp = Date.now();
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/classes/admin/calendar?_t=${timestamp}`, { headers })
      );
    }
  },

  // Sessions API
  sessions: {
    async getBatchCapacity(classId: string, date: string): Promise<any[]> {
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/sessions/capacity/batch/${classId}/${date}`)
      );
    },

    async getSessionClasses(): Promise<any[]> {
      const timestamp = Date.now();
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/sessions/session-classes?_t=${timestamp}`)
      );
    },

    async getAllSessions(): Promise<any[]> {
      const timestamp = Date.now();
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/sessions?_t=${timestamp}`)
      );
    }
  }
}; 