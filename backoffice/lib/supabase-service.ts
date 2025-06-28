import { supabase } from './supabase'
import type { Database } from './supabase'

type Submission = Database['public']['Tables']['submissions']['Row']
type User = Database['public']['Tables']['users']['Row']
type AdminReview = Database['public']['Tables']['admin_reviews']['Row']

interface SubmissionWithUser extends Submission {
  user: User
}

export class BackofficeSupabaseService {
  // Get all submissions with user data
  async getAllSubmissionsWithUsers(options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('submissions')
      .select(`
        *,
        user:users(*)
      `)
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
    return data as SubmissionWithUser[]
  }

  // Get submissions by status
  async getSubmissionsByStatus(status: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        user:users(*)
      `)
      .eq('status', status)
      .order('submitted_at', { ascending: false })

    if (error) throw error
    return data as SubmissionWithUser[]
  }

  // Update submission status
  async updateSubmissionStatus(submissionId: string, status: string) {
    const { data, error } = await supabase
      .from('submissions')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', submissionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Create or update admin review
  async upsertAdminReview(reviewData: {
    submission_id: string
    notes?: string
    technical_score?: number
    regulatory_score?: number
    financial_score?: number
    environmental_score?: number
    overall_score?: number
    decision?: 'APPROVED' | 'REJECTED'
  }) {
    const { data, error } = await supabase
      .from('admin_reviews')
      .upsert({
        ...reviewData,
        decision_at: reviewData.decision ? new Date().toISOString() : null,
        reviewed_at: new Date().toISOString()
      }, { onConflict: 'submission_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get admin review for submission
  async getAdminReview(submissionId: string) {
    const { data, error } = await supabase
      .from('admin_reviews')
      .select('*')
      .eq('submission_id', submissionId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }
    return data
  }

  // Get submission with user and review data
  async getSubmissionWithDetails(submissionId: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        user:users(*),
        admin_review:admin_reviews(*)
      `)
      .eq('id', submissionId)
      .single()
    
    if (error) throw error
    return data
  }

  // Get pending submissions count
  async getPendingSubmissionsCount() {
    const { count, error } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')

    if (error) throw error
    return count || 0
  }

  // Get submissions statistics
  async getSubmissionsStats() {
    const { data, error } = await supabase
      .from('submissions')
      .select('status')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0
    }

    data?.forEach(submission => {
      switch (submission.status) {
        case 'PENDING':
          stats.pending++
          break
        case 'UNDER_REVIEW':
          stats.underReview++
          break
        case 'APPROVED':
          stats.approved++
          break
        case 'REJECTED':
          stats.rejected++
          break
      }
    })

    return stats
  }
}

export const backofficeSupabaseService = new BackofficeSupabaseService() 