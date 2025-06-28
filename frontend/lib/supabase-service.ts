import { supabase } from './supabase'
import type { Database } from './supabase'

type Submission = Database['public']['Tables']['submissions']['Row']
type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
type Draft = Database['public']['Tables']['drafts']['Row']
type DraftInsert = Database['public']['Tables']['drafts']['Insert']
type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type Certificate = Database['public']['Tables']['certificates']['Row']
type CertificateInsert = Database['public']['Tables']['certificates']['Insert']

export class SupabaseService {
  // Get user by wallet address
  async getUserByWallet(walletAddress: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()
    
    if (error) throw error
    return data
  }

  // Create or update user
  async upsertUser(userData: {
    wallet_address: string
    email?: string
    name?: string
    company?: string
    role?: 'USER' | 'ADMIN'
  }) {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'wallet_address' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get profile by wallet address (legacy method)
  async getProfileByWallet(walletAddress: string) {
    // First get the user by wallet address
    const user = await this.getUserByWallet(walletAddress)
    if (!user) return null
    
    // Then get the profile by user_id
    return this.getProfileByUserId(user.id)
  }

  // Get profile by user ID
  async getProfileByUserId(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return data
  }

  // Create or update profile
  async upsertProfile(profileData: ProfileInsert) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete profile
  async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId)
    
    if (error) throw error
    return true
  }

  // Create submission
  async createSubmission(submissionData: SubmissionInsert) {
    const { data, error } = await supabase
      .from('submissions')
      .insert(submissionData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get user's submissions by wallet address
  async getUserSubmissions(walletAddress: string, options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    // First get the user by wallet address
    const user = await this.getUserByWallet(walletAddress)
    if (!user) {
      return []
    }

    let query = supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data
  }

  // Get all submissions (for admin)
  async getAllSubmissions(options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data
  }

  // Create or update draft
  async upsertDraft(draftData: DraftInsert & { id?: string }) {
    const { data, error } = await supabase
      .from('drafts')
      .upsert(draftData, { onConflict: 'id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get user's drafts by wallet address
  async getUserDrafts(walletAddress: string, options?: {
    limit?: number
    offset?: number
  }) {
    // First get the user by wallet address
    const user = await this.getUserByWallet(walletAddress)
    if (!user) {
      return []
    }

    let query = supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    
    if (error) throw error
    return data
  }

  // Get draft by ID
  async getDraftById(draftId: string) {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single()
    
    if (error) throw error
    return data
  }

  // Delete draft
  async deleteDraft(draftId: string) {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId)
    
    if (error) throw error
    return true
  }

  // Update submission status (for admin)
  async updateSubmissionStatus(submissionId: string, status: string) {
    const { data, error } = await supabase
      .from('submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', submissionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Create certificate
  async createCertificate(certificateData: CertificateInsert) {
    const { data, error } = await supabase
      .from('certificates')
      .insert(certificateData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get certificate by ID
  async getCertificateById(certificateId: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single()
    
    if (error) throw error
    return data
  }

  // Get certificate by hash
  async getCertificateByHash(certificateHash: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_hash', certificateHash)
      .single()
    
    if (error) throw error
    return data
  }

  // Get user's certificates by wallet address
  async getUserCertificates(walletAddress: string) {
    // First get the user by wallet address
    const user = await this.getUserByWallet(walletAddress)
    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

export const supabaseService = new SupabaseService() 