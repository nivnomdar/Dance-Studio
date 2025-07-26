import { Registration, RegistrationWithDetails, CreateRegistrationRequest } from '../types/registration';
import { apiService } from './api';

// Cache for storing registration data
const registrationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

const getCacheKey = (userId: string, type: string = 'my') => `${type}_registrations_${userId}`;

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

export const registrationsService = {
  // Get all registrations (admin only)
  async getAllRegistrations(): Promise<RegistrationWithDetails[]> {
    try {
      const data = await apiService.registrations.getAll();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch registrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get user's own registrations with caching and deduplication
  async getMyRegistrations(userId?: string): Promise<RegistrationWithDetails[]> {
    if (!userId) {
      // Fallback to direct API call if no userId provided
      try {
        const data = await apiService.registrations.getMy();
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch my registrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const cacheKey = getCacheKey(userId, 'my');
    
    // Check cache first
    const cached = registrationCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    // Check if there's already a pending request
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const data = await apiService.registrations.getMy();
        
        // Cache the result
        registrationCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        return data;
      } finally {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    })();

    // Store the pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  },

  // Clear cache for a specific user (call this when data changes)
  clearUserCache(userId: string): void {
    const cacheKey = getCacheKey(userId, 'my');
    registrationCache.delete(cacheKey);
    pendingRequests.delete(cacheKey);
  },

  // Clear all cache
  clearAllCache(): void {
    registrationCache.clear();
    pendingRequests.clear();
  },

  // Get registration by ID
  async getRegistrationById(id: string): Promise<RegistrationWithDetails | null> {
    try {
      const data = await apiService.registrations.getById(id);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Create new registration
  async createRegistration(data: CreateRegistrationRequest, accessToken?: string): Promise<RegistrationWithDetails> {
    try {
      const result = await apiService.registrations.create(data, accessToken);
      // Clear cache after creating new registration
      if (data.user_id) {
        this.clearUserCache(data.user_id);
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to create registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Update registration status (admin only)
  async updateRegistrationStatus(id: string, status: string, accessToken?: string): Promise<RegistrationWithDetails> {
    try {
      const data = await apiService.registrations.updateStatus(id, status, accessToken);
      return data;
    } catch (error) {
      throw new Error(`Failed to update registration status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Cancel registration (user can cancel own)
  async cancelRegistration(id: string, accessToken?: string): Promise<RegistrationWithDetails> {
    try {
      const data = await apiService.registrations.cancelRegistration(id, accessToken);
      // Clear cache after cancellation
      if (data.user_id) {
        this.clearUserCache(data.user_id);
      }
      return data;
    } catch (error) {
      throw new Error(`Failed to cancel registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Delete registration
  async deleteRegistration(id: string): Promise<{ message: string }> {
    try {
      const result = await apiService.registrations.delete(id);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}; 