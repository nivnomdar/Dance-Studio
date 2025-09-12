// Admin Overview Types
export interface SessionData {
  id: string;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  weekdays: number[];
  max_capacity: number;
  is_active: boolean;
  specificDate?: string;
  linkedClassesCount?: number;
  registrationsCount?: number;
  activeRegistrationsCount?: number;
  totalRevenue?: number;
  occupancyRate?: number;
  sessionClasses?: any[];
  registrations?: any[];
  linkedClasses?: string[];
  upcomingActiveRegistrations?: any[];
}

export interface AdminOverviewProps {
  profile: any; // UserProfile type
}

export interface AdminData {
  classes: any[];
  sessions: any[];
  registrations: any[];
  session_classes: any[];
  profiles: any[];
  overview: any;
  messages: any[]; // Add messages property
}

export interface SummaryStats {
  totalSessions: number;
  activeSessions: number;
  totalRegistrations: number;
  totalRevenue: number;
  avgOccupancy: number;
}

export interface TimeEntry {
  time: string;
  registrations: any[];
}

export interface RegistrationByTime {
  [key: string]: TimeEntry;
}

// Constants
export const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const DAYS_IN_WEEK = 7;
export const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000; 