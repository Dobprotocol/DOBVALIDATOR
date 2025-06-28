import { supabase } from './supabase'
import type { Database } from './supabase'

type Submission = Database['public']['Tables']['submissions']['Row']
type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
type Draft = Database['public']['Tables']['drafts']['Row']
type DraftInsert = Database['public']['Tables']['drafts']['Insert']

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
    role?: 'OPERATOR' | 'ADMIN'
  }) {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'wallet_address' })
      .select()
      .single()
    
    if (error) throw error
    return data
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
}

export const supabaseService = new SupabaseService() 