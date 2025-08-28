// Cookie manager for terms acceptance
// This helps prevent the terms modal from showing repeatedly across browser sessions

const TERMS_COOKIE_NAME = 'ladance_terms_accepted';
const TERMS_COOKIE_EXPIRY_DAYS = 365; // 1 year

export interface TermsCookieData {
  accepted: boolean;
  timestamp: number;
  userId?: string;
}

export class TermsCookieManager {
  /**
   * Get cookie value by name
   */
  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  /**
   * Set terms acceptance cookie with proper expiration
   */
  static setTermsAccepted(userId?: string): void {
    // Calculate expiration date (1 year from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TERMS_COOKIE_EXPIRY_DAYS);
    
    // Get current domain for cookie
    const domain = window.location.hostname === 'localhost' ? '' : `.${window.location.hostname}`;
    
    // Set cookie with proper expiration, domain, and path
    const cookieString = `${TERMS_COOKIE_NAME}=true; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict${domain ? `; domain=${domain}` : ''}`;
    document.cookie = cookieString;
    
    console.log('TermsCookieManager: Set terms accepted cookie for user:', userId);
    console.log('TermsCookieManager: Cookie string:', cookieString);
    console.log('TermsCookieManager: Cookie expires:', expiryDate.toUTCString());
    
    // Verify cookie was set
    const verification = this.getCookie(TERMS_COOKIE_NAME);
    console.log('TermsCookieManager: Cookie verification after setting:', verification);
  }

  /**
   * Get terms acceptance status from cookie
   */
  static getTermsAccepted(): TermsCookieData | null {
    const cookieValue = this.getCookie(TERMS_COOKIE_NAME);
    
    if (cookieValue === 'true') {
      return {
        accepted: true,
        timestamp: Date.now(),
        userId: undefined
      };
    }
    
    return null;
  }

  /**
   * Check if terms are accepted for a specific user
   */
  static isTermsAcceptedForUser(userId?: string): boolean {
    const cookieValue = this.getCookie(TERMS_COOKIE_NAME);
    return cookieValue === 'true';
  }

  /**
   * Clear terms acceptance cookie
   */
  static clearTermsCookie(): void {
    // Clear cookie by setting it to expire immediately
    document.cookie = `${TERMS_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    console.log('TermsCookieManager: Cleared terms cookie');
  }

  /**
   * Update terms cookie when user changes
   */
  static updateTermsCookieForUser(userId: string): void {
    // Simply set the cookie to true
    this.setTermsAccepted(userId);
  }

  /**
   * Clean up old profile cache cookies and localStorage entries
   * This removes duplicate profile data while preserving current user data
   */
  static cleanupOldProfileCache(currentUserId: string): void {
    try {
      // Get all cookies
      const cookies = document.cookie.split(';');
      
      // Find and remove old profile cache cookies
      cookies.forEach(cookie => {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith('profile_')) {
          const cookieName = trimmedCookie.split('=')[0];
          
          // Don't remove current user's profile cache
          if (!cookieName.includes(currentUserId)) {
            // Remove old profile cookie
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            console.log(`TermsCookieManager: Removed old profile cookie: ${cookieName}`);
          }
        }
      });

      // Clean up localStorage profile cache
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('profile_') && !key.includes(currentUserId)) {
          keysToRemove.push(key);
        }
      }

      // Remove old profile localStorage entries
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`TermsCookieManager: Removed old profile localStorage: ${key}`);
      });

      console.log('TermsCookieManager: Profile cache cleanup completed');
    } catch (error) {
      console.error('TermsCookieManager: Error during profile cache cleanup:', error);
    }
  }

  /**
   * Validate and clean up terms cookie data
   * This ensures cookie data is consistent with current user
   */
  static validateAndCleanupTermsCookie(currentUserId: string): void {
    try {
      // Clean up old profile cache
      this.cleanupOldProfileCache(currentUserId);
    } catch (error) {
      console.error('TermsCookieManager: Error during terms cookie validation:', error);
    }
  }

  /**
   * Get clean profile data without duplicates
   * This returns only the current user's profile data
   */
  static getCleanProfileData(currentUserId: string): any {
    try {
      // Get current user's profile from localStorage
      const profileKey = `profile_${currentUserId}`;
      const profileData = localStorage.getItem(profileKey);
      
      if (profileData) {
        return JSON.parse(profileData);
      }
      
      return null;
    } catch (error) {
      console.error('TermsCookieManager: Error getting clean profile data:', error);
      return null;
    }
  }

  /**
   * Emergency cleanup - removes all old cookies and localStorage entries
   * Use this when you want to start fresh
   */
  static emergencyCleanup(): void {
    try {
      console.log('TermsCookieManager: Starting emergency cleanup...');
      
      // Clear all profile cookies
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith('profile_')) {
          const cookieName = trimmedCookie.split('=')[0];
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
          console.log(`TermsCookieManager: Removed cookie: ${cookieName}`);
        }
      });

      // Clear all profile localStorage entries
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('profile_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`TermsCookieManager: Removed localStorage: ${key}`);
      });

      console.log('TermsCookieManager: Emergency cleanup completed');
    } catch (error) {
      console.error('TermsCookieManager: Error during emergency cleanup:', error);
    }
  }
}
