// Cookie manager for terms acceptance
// This helps prevent the terms modal from showing repeatedly across browser sessions

const TERMS_COOKIE_NAME = 'ladance_terms_accepted';
const TERMS_STORAGE_KEY = 'ladance_terms_accepted_storage';
const TERMS_COOKIE_EXPIRY_DAYS = 365; // 1 year

export interface TermsCookieData {
  accepted: boolean;
  timestamp: number;
  userId?: string;
}

export class TermsCookieManager {
  /**
   * Set terms acceptance cookie and localStorage backup
   */
  static setTermsAccepted(userId?: string): void {
    const cookieData: TermsCookieData = {
      accepted: true,
      timestamp: Date.now(),
      userId
    };

    // Set cookie
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TERMS_COOKIE_EXPIRY_DAYS);

    const cookieValue = encodeURIComponent(JSON.stringify(cookieData));
    const cookieString = `${TERMS_COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    document.cookie = cookieString;
    
    // Set localStorage backup
    try {
      localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(cookieData));
    } catch (error) {
      console.warn('TermsCookieManager: Could not set localStorage backup:', error);
    }
    
    console.log('TermsCookieManager: Set terms accepted cookie for user:', userId);
    console.log('TermsCookieManager: Cookie string:', cookieString);
  }

  /**
   * Get terms acceptance status from cookie or localStorage backup
   */
  static getTermsAccepted(): TermsCookieData | null {
    // Try cookie first
    try {
      const cookies = document.cookie.split(';');
      const termsCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${TERMS_COOKIE_NAME}=`)
      );

      if (termsCookie) {
        const cookieValue = termsCookie.split('=')[1];
        const decodedValue = decodeURIComponent(cookieValue);
        const cookieData: TermsCookieData = JSON.parse(decodedValue);

        // Validate cookie data
        if (this.isValidTermsData(cookieData)) {
          // Check if cookie is expired
          if (!this.isExpired(cookieData)) {
            return cookieData;
          } else {
            console.log('TermsCookieManager: Cookie expired, removing');
            this.clearTermsCookie();
          }
        }
      }
    } catch (error) {
      console.error('TermsCookieManager: Error reading terms cookie:', error);
    }

    // Try localStorage backup
    try {
      const storageData = localStorage.getItem(TERMS_STORAGE_KEY);
      if (storageData) {
        const parsedData: TermsCookieData = JSON.parse(storageData);
        if (this.isValidTermsData(parsedData) && !this.isExpired(parsedData)) {
          console.log('TermsCookieManager: Using localStorage backup');
          return parsedData;
        }
      }
    } catch (error) {
      console.error('TermsCookieManager: Error reading localStorage backup:', error);
    }

    return null;
  }

  /**
   * Check if terms data is valid
   */
  private static isValidTermsData(data: any): data is TermsCookieData {
    return data && 
           typeof data.accepted === 'boolean' && 
           typeof data.timestamp === 'number' &&
           data.timestamp > 0;
  }

  /**
   * Check if terms data is expired
   */
  private static isExpired(data: TermsCookieData): boolean {
    const now = Date.now();
    const dataAge = now - data.timestamp;
    const maxAge = TERMS_COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert to milliseconds
    return dataAge > maxAge;
  }

  /**
   * Check if terms are accepted for a specific user
   */
  static isTermsAcceptedForUser(userId?: string): boolean {
    const data = this.getTermsAccepted();
    
    if (!data || !data.accepted) {
      return false;
    }

    // If no userId specified, just check if accepted
    if (!userId) {
      return data.accepted;
    }

    // If userId specified, check if it matches the data
    return data.accepted && data.userId === userId;
  }

  /**
   * Clear terms acceptance cookie and localStorage
   */
  static clearTermsCookie(): void {
    // Clear cookie
    const expiryDate = new Date(0); // Set to past date to expire immediately
    const cookieString = `${TERMS_COOKIE_NAME}=; expires=${expiryDate.toUTCString()}; path=/`;
    document.cookie = cookieString;
    
    // Clear localStorage
    try {
      localStorage.removeItem(TERMS_STORAGE_KEY);
    } catch (error) {
      console.warn('TermsCookieManager: Could not clear localStorage backup:', error);
    }
    
    console.log('TermsCookieManager: Cleared terms cookie and localStorage');
  }

  /**
   * Update terms cookie when user changes
   */
  static updateTermsCookieForUser(userId: string): void {
    const existingData = this.getTermsAccepted();
    
    if (existingData && existingData.accepted) {
      // Update the cookie with the new userId
      this.setTermsAccepted(userId);
    }
  }
}
