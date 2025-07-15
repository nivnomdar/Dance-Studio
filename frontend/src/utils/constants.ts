// Application constants and configuration

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Cache Configuration
export const CACHE_DURATION = 30000; // 30 seconds

// Day names mapping
export const DAY_NAMES_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;

// Default times for classes
export const DEFAULT_CLASS_TIMES = ['18:00', '19:00', '20:00'];

// Debounce delays for different operations
export const DEBOUNCE_DELAYS = {
  SESSIONS_DATA: 300, // 300ms for sessions data loading
  TIMES_LOADING: 200, // 200ms for times loading
  SPOTS_CHECKING: 150, // 150ms for spots checking
  PROFILE_LOADING: 500, // 500ms for profile loading
  REGISTRATION_SUBMIT: 1000 // 1000ms for registration submission
};

/**
 * פונקציה משותפת לחישוב זמן המתנה ל-retry
 */
export const calculateRetryDelay = (retryCount: number, baseDelay: number = 1000): number => {
  return Math.pow(2, retryCount + 1) * baseDelay; // 2s, 4s, 8s, etc.
};

// Timeout constants
export const TIMEOUTS = {
  HEALTH_CHECK: 5000, // 5 seconds for health checks
  API_REQUEST: 10000, // 10 seconds for API requests
  SESSIONS_FETCH: 5000, // 5 seconds for sessions data
  SPOTS_CHECK: 5000 // 5 seconds for spots checking
};

/**
 * פונקציה משותפת ליצירת timeout promise
 */
export const createTimeoutPromise = (timeoutMs: number, errorMessage: string = 'Request timeout'): Promise<never> => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
}; 