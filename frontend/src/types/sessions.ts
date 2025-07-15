// Types for sessions and session classes

export interface Session {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date?: string;
  weekdays: string[]; // Array of strings (e.g., ["monday", "tuesday"])
  max_capacity: number;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionClass {
  id: string;
  session_id: string;
  class_id: string;
  price_override?: number;
  capacity_override?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  classes?: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    color_scheme: string;
    location: string;
  };
} 