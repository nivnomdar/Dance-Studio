// Centralized booking configuration

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Change later via VITE_BOOKING_DAYS_AHEAD in your .env, or just edit the fallback (7)
export const BOOKING_DAYS_AHEAD: number = parseNumber(import.meta.env.VITE_BOOKING_DAYS_AHEAD, 30);

// Centralized definition of a calendar week length used in date utilities
// Keep default as 7 to preserve current behavior; can be overridden via env
export const WEEK_LENGTH_DAYS: number = parseNumber(import.meta.env.VITE_WEEK_LENGTH_DAYS, 7);



