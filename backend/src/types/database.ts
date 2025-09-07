export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface DatabaseConnection {
  isConnected: boolean;
  error?: string;
}

export interface QueryResult<T = any> {
  data: T[];
  count: number;
  error?: string;
}

export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          long_description: string | null
          price: number
          duration: number | null
          level: string | null
          age_group: string | null
          max_participants: number | null
          location: string | null
          included: string | null
          image_url: string | null
          video_url: string | null
          category: string | null
          color_scheme: string | null
          registration_type: string | null
          class_type: string | null // סוג הקרדיטים שהשיעור מציע: group, private, או both
          group_credits: number | null // כמות הקרדיטים הקבוצתיים שהמשתמש מקבל
          private_credits: number | null // כמות הקרדיטים האישיים שהמשתמש מקבל
          is_active: boolean
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          long_description?: string | null
          price: number
          duration?: number | null
          level?: string | null
          age_group?: string | null
          max_participants?: number | null
          location?: string | null
          included?: string | null
          image_url?: string | null
          video_url?: string | null
          category?: string | null
          color_scheme?: string | null
          registration_type?: string | null
          class_type?: string | null
          group_credits?: number | null
          private_credits?: number | null
          is_active?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          long_description?: string | null
          price?: number
          duration?: number | null
          level?: string | null
          age_group?: string | null
          max_participants?: number | null
          location?: string | null
          included?: string | null
          image_url?: string | null
          video_url?: string | null
          category?: string | null
          color_scheme?: string | null
          registration_type?: string | null
          class_type?: string | null
          group_credits?: number | null
          private_credits?: number | null
          is_active?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... existing code ...
    }
  }
}

 