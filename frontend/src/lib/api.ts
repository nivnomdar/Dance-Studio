import { supabase } from './supabase';
import { Class } from '../types/class';
import { RegistrationWithDetails, CreateRegistrationRequest } from '../types/registration';
import { calculateRetryDelay } from '../utils/constants';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

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
      const response = await fetchFn();
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Try to get error details from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse JSON, use the status text
      }
      
      console.error(`fetchWithRetryAndQueue: HTTP error ${response.status}: ${errorMessage}`);
      throw new Error(errorMessage);
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
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
      cachedSession = session;
      sessionCacheTime = now;
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
  // Shop API
  shop: {
    async getCategories(): Promise<any[]> {
      return fetchWithRetryAndQueue<any[]>(() =>
        fetch(`${API_BASE_URL}/shop/categories`)
      ).catch(error => {
        console.error('Shop API getCategories error:', error);
        return [];
      });
    },

    async getCategoriesAdmin(): Promise<any[]> {
      return fetchWithRetryAndQueue<any[]>(async () => {
        const headers = await getAuthHeaders();
        return fetch(`${API_BASE_URL}/shop/categories/admin`, { headers });
      }).catch(error => {
        console.error('Shop API getCategoriesAdmin error:', error);
        return [];
      });
    },

    async getProducts(params?: { category_id?: string }): Promise<any[]> {
      const query = params?.category_id ? `?category_id=${encodeURIComponent(params.category_id)}` : '';
      return fetchWithRetryAndQueue<any[]>(() =>
        fetch(`${API_BASE_URL}/shop/products${query}`)
      ).catch(error => {
        console.error('Shop API getProducts error:', error);
        return [];
      });
    },

    // Admin endpoints
    async createCategory(payload: { name: string; parent_id?: string | null; description?: string | null }): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() =>
        fetch(`${API_BASE_URL}/shop/categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })
      );
    },

    async updateCategory(id: string, payload: Partial<{ name: string; parent_id: string | null; description: string | null; is_active: boolean }>): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() =>
        fetch(`${API_BASE_URL}/shop/categories/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        })
      );
    },

    async deleteCategory(id: string): Promise<{ message: string }> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<{ message: string }>(() =>
        fetch(`${API_BASE_URL}/shop/categories/${id}`, {
          method: 'DELETE',
          headers
        })
      );
    },

    async createProduct(payload: any): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() =>
        fetch(`${API_BASE_URL}/shop/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })
      );
    },

    async updateProduct(id: string, payload: any): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() =>
        fetch(`${API_BASE_URL}/shop/products/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        })
      );
    },

    async deleteProduct(id: string): Promise<{ message: string }> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<{ message: string }>(() =>
        fetch(`${API_BASE_URL}/shop/products/${id}`, {
          method: 'DELETE',
          headers
        })
      );
    }
  },
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
      try {
        const response = await fetch(`${API_BASE_URL}/classes/${id}`);
        if (response.status === 404) {
          // Class not found — do not retry, return null gracefully
          return null;
        }
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if ((errorData as any)?.message) errorMessage = (errorData as any).message;
            else if ((errorData as any)?.error) errorMessage = (errorData as any).error;
          } catch {}
          throw new Error(errorMessage);
        }
        return (await response.json()) as Class;
      } catch (error) {
        console.error('Classes API getById error:', error);
        return null;
      }
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
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/admin/overview`, { headers })
      ).catch(error => {
        console.error('Admin API getOverview error:', error);
        return { totalClasses: 0, totalRegistrations: 0, totalSessions: 0 };
      });
    },

    async getClasses(): Promise<Class[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<Class[]>(() => 
        fetch(`${API_BASE_URL}/admin/classes`, { headers })
      ).catch(error => {
        console.error('Admin API getClasses error:', error);
        return [];
      });
    },

    async getRegistrations(): Promise<RegistrationWithDetails[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<RegistrationWithDetails[]>(() => 
        fetch(`${API_BASE_URL}/admin/registrations`, { headers })
      ).catch(error => {
        console.error('Admin API getRegistrations error:', error);
        return [];
      });
    },

    async getSessions(): Promise<any[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/admin/sessions`, { headers })
      ).catch(error => {
        console.error('Admin API getSessions error:', error);
        return [];
      });
    },

    async getCalendar(): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/admin/calendar`, { headers })
      ).catch(error => {
        console.error('Admin API getCalendar error:', error);
        return {};
      });
    },

    async getProfiles(search?: string): Promise<any[]> {
      const headers = await getAuthHeaders();
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/profiles/admin${searchParam}`, { headers })
      ).catch(error => {
        console.error('Admin API getProfiles error:', error);
        return [];
      });
    }
    ,
    async getOrders(): Promise<any[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/admin/orders`, { headers })
      ).catch(error => {
        console.error('Admin API getOrders error:', error);
        return [];
      });
    }
  },

  // Orders API (user)
  orders: {
    async getMy(): Promise<any[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/orders`, { headers })
      );
    },
    async getById(id: string): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/orders/${id}`, { headers })
      );
    }
  },

  // Contact API
  contact: {
    async submitMessage(payload: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<{ message: string; id: string }>{
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      return fetchWithRetryAndQueue<{ message: string; id: string }>(() =>
        fetch(`${API_BASE_URL}/contact`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })
      );
    },

    async getMessages(): Promise<any[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any[]>(() =>
        fetch(`${API_BASE_URL}/admin/contact/messages`, { headers })
      ).catch(error => {
        console.error('Contact API getMessages error:', error);
        return [];
      });
    },

    async updateStatus(id: string, status: 'new' | 'read' | 'replied'): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() =>
        fetch(`${API_BASE_URL}/admin/contact/messages/${id}/status`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status })
        })
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
    },

    async createSession(sessionData: any): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/sessions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(sessionData)
        })
      );
    },

    async updateSession(id: string, sessionData: any): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/sessions/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(sessionData)
        })
      );
    },

    async deleteSession(id: string): Promise<void> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<void>(() => 
        fetch(`${API_BASE_URL}/sessions/${id}`, {
          method: 'DELETE',
          headers
        }).then(response => {
          if (!response.ok) {
            throw new ApiError(response.status, 'Failed to delete session');
          }
          return response;
        })
      );
    },

    // Session Classes Management
    async getAllSessionClasses(): Promise<any[]> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any[]>(() => 
        fetch(`${API_BASE_URL}/sessions/session-classes/all`, { headers })
      );
    },

    async addClassToSession(sessionId: string, classId: string, price: number, isTrial: boolean = false, maxUsesPerUser?: number): Promise<any> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<any>(() => 
        fetch(`${API_BASE_URL}/sessions/session-classes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            session_id: sessionId,
            class_id: classId,
            price,
            is_trial: isTrial,
            max_uses_per_user: maxUsesPerUser
          })
        })
      );
    },

    async removeClassFromSession(sessionId: string, classId: string): Promise<void> {
      const headers = await getAuthHeaders();
      return fetchWithRetryAndQueue<void>(() => 
        fetch(`${API_BASE_URL}/sessions/session-classes/${sessionId}/${classId}`, {
          method: 'DELETE',
          headers
        }).then(response => {
          if (!response.ok) {
            throw new ApiError(response.status, 'Failed to remove class from session');
          }
          return response;
        })
      );
    }
  }
}; 