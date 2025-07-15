// Application constants and configuration

// API Configuration
export const API_BASE_URL = 'http://localhost:5000/api';

// Cache Configuration
export const CACHE_DURATION = 30000; // 30 seconds

// Day names mapping
export const DAY_NAMES_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;

// Default times for classes
export const DEFAULT_CLASS_TIMES = ['18:00', '19:00', '20:00'];

// Debounce delays
export const DEBOUNCE_DELAYS = {
  SESSIONS_DATA: 500, // 500ms
  TIMES_LOADING: 300, // 300ms
  SPOTS_CHECKING: 200 // 200ms
} as const; 