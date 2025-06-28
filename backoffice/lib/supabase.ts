import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (same as frontend)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          name: string | null
          role: 'USER' | 'ADMIN'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          name?: string | null
          role?: 'USER' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          name?: string | null
          role?: 'USER' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          device_name: string
          device_type: string
          custom_device_type: string | null
          location: string
          serial_number: string
          manufacturer: string
          model: string
          year_of_manufacture: string
          condition: string
          specifications: string
          purchase_price: string
          current_value: string
          expected_revenue: string
          operational_costs: string
          status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          device_name: string
          device_type: string
          custom_device_type?: string | null
          location: string
          serial_number: string
          manufacturer: string
          model: string
          year_of_manufacture: string
          condition: string
          specifications: string
          purchase_price: string
          current_value: string
          expected_revenue: string
          operational_costs: string
          status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          device_name?: string
          device_type?: string
          custom_device_type?: string | null
          location?: string
          serial_number?: string
          manufacturer?: string
          model?: string
          year_of_manufacture?: string
          condition?: string
          specifications?: string
          purchase_price?: string
          current_value?: string
          expected_revenue?: string
          operational_costs?: string
          status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      admin_reviews: {
        Row: {
          id: string
          notes: string | null
          technical_score: number | null
          regulatory_score: number | null
          financial_score: number | null
          environmental_score: number | null
          overall_score: number | null
          decision: 'APPROVED' | 'REJECTED' | null
          decision_at: string | null
          reviewed_at: string
          submission_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          technical_score?: number | null
          regulatory_score?: number | null
          financial_score?: number | null
          environmental_score?: number | null
          overall_score?: number | null
          decision?: 'APPROVED' | 'REJECTED' | null
          decision_at?: string | null
          reviewed_at?: string
          submission_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          technical_score?: number | null
          regulatory_score?: number | null
          financial_score?: number | null
          environmental_score?: number | null
          overall_score?: number | null
          decision?: 'APPROVED' | 'REJECTED' | null
          decision_at?: string | null
          reviewed_at?: string
          submission_id?: string
        }
      }
    }
  }
} 