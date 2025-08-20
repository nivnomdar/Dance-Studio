// Application constants and configuration

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Cache Configuration
export const CACHE_DURATION = 300000; // 5 minutes - increased to reduce API calls

// Day names mapping
export const DAY_NAMES_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;

// Registration types mapping
export const REGISTRATION_TYPES = {
  standard: { value: 'standard', label: 'רגילה' },
  appointment_only: { value: 'appointment_only', label: 'בתיאום' },
  subscription: { value: 'subscription', label: 'מנוי' }
} as const;

// Registration types options array for dropdowns
export const REGISTRATION_TYPE_OPTIONS = Object.values(REGISTRATION_TYPES);

// Helper function to translate registration type
export const translateRegistrationType = (registrationType: string): string => {
  const type = REGISTRATION_TYPES[registrationType as keyof typeof REGISTRATION_TYPES];
  return type?.label || registrationType;
};

// Default times for classes
export const DEFAULT_CLASS_TIMES = ['18:00', '19:00', '20:00'];

// Debounce delays for different operations
export const DEBOUNCE_DELAYS = {
  SESSIONS_DATA: 300, // 300ms for sessions data loading - reduced for faster loading
  TIMES_LOADING: 200, // 200ms for times loading - reduced for faster loading
  SPOTS_CHECKING: 300, // 300ms for spots checking - reduced for faster loading
  PROFILE_LOADING: 200, // 200ms for profile loading
  REGISTRATION_SUBMIT: 500 // 500ms for registration submission
};

/**
 * פונקציה משותפת לחישוב זמן המתנה ל-retry
 */
export const calculateRetryDelay = (retryCount: number, baseDelay: number = 1000): number => {
  return Math.pow(2, retryCount + 1) * baseDelay; // 2s, 4s, 8s, etc.
};

// Timeout constants
export const TIMEOUTS = {
  HEALTH_CHECK: 3000, // 3 seconds for health checks
  API_REQUEST: 8000, // 8 seconds for API requests
  SESSIONS_FETCH: 3000, // 3 seconds for sessions data
  SPOTS_CHECK: 3000 // 3 seconds for spots checking
};

/**
 * פונקציה משותפת ליצירת timeout promise
 */
export const createTimeoutPromise = (timeoutMs: number, errorMessage: string = 'Request timeout'): Promise<never> => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
}; 