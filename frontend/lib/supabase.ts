import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          name: string | null
          role: 'OPERATOR' | 'ADMIN'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          name?: string | null
          role?: 'OPERATOR' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          name?: string | null
          role?: 'OPERATOR' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string | null
          industry: string | null
          website: string | null
          description: string | null
          contact_person: string | null
          phone: string | null
          address: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string | null
          industry?: string | null
          website?: string | null
          description?: string | null
          contact_person?: string | null
          phone?: string | null
          address?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string | null
          industry?: string | null
          website?: string | null
          description?: string | null
          contact_person?: string | null
          phone?: string | null
          address?: string | null
          country?: string | null
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
      drafts: {
        Row: {
          id: string
          device_name: string
          device_type: string
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
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          device_name?: string
          device_type?: string
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
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          device_name?: string
          device_type?: string
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
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      certificates: {
        Row: {
          id: string
          certificate_hash: string
          stellar_tx_hash: string | null
          issued_at: string
          expires_at: string | null
          status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
          submission_id: string
          user_id: string
          metadata: any
        }
        Insert: {
          id?: string
          certificate_hash: string
          stellar_tx_hash?: string | null
          issued_at?: string
          expires_at?: string | null
          status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
          submission_id: string
          user_id: string
          metadata?: any
        }
        Update: {
          id?: string
          certificate_hash?: string
          stellar_tx_hash?: string | null
          issued_at?: string
          expires_at?: string | null
          status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
          submission_id?: string
          user_id?: string
          metadata?: any
        }
      }
    }
  }
} 