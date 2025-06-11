export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface ClassRegistration {
  id: string;
  user_id: string;
  class_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DanceClass {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
} 