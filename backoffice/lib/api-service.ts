// API Service for DOB Validator Backend
// Base URL: https://validator.dobprotocol.com

const API_BASE_URL = 'https://validator.dobprotocol.com'

// Types for the backend API
export interface Submission {
  id: string
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
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  submitted_at: string
  updated_at: string
  user_id: string
  user?: User
  admin_review?: AdminReview
}

export interface User {
  id: string
  wallet_address: string
  email: string | null
  name: string | null
  role: 'USER' | 'ADMIN'
  created_at: string
  updated_at: string
}

export interface AdminReview {
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

export interface SubmissionsStats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
}

class ApiService {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    return headers
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Get all submissions with optional filters
  async getAllSubmissions(options?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<Submission[]> {
    const params = new URLSearchParams()
    
    if (options?.status) {
      params.append('status', options.status)
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString())
    }
    if (options?.offset) {
      params.append('offset', options.offset.toString())
    }

    const queryString = params.toString()
    const endpoint = `/api/submissions${queryString ? `?${queryString}` : ''}`
    
    return this.request<Submission[]>(endpoint)
  }

  // Get submissions by status
  async getSubmissionsByStatus(status: string): Promise<Submission[]> {
    return this.getAllSubmissions({ status })
  }

  // Get a single submission by ID
  async getSubmissionById(id: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${id}`)
  }

  // Update submission status
  async updateSubmissionStatus(
    submissionId: string,
    status: string
  ): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
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
  }): Promise<AdminReview> {
    return this.request<AdminReview>('/api/admin-reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
  }

  // Get admin review for submission
  async getAdminReview(submissionId: string): Promise<AdminReview | null> {
    try {
      return await this.request<AdminReview>(`/api/admin-reviews/${submissionId}`)
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }

  // Get submission with full details (user and review)
  async getSubmissionWithDetails(submissionId: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${submissionId}/details`)
  }

  // Get pending submissions count
  async getPendingSubmissionsCount(): Promise<number> {
    const submissions = await this.getSubmissionsByStatus('PENDING')
    return submissions.length
  }

  // Get submissions statistics
  async getSubmissionsStats(): Promise<SubmissionsStats> {
    const allSubmissions = await this.getAllSubmissions()
    
    const stats: SubmissionsStats = {
      total: allSubmissions.length,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
    }

    allSubmissions.forEach(submission => {
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

  // Admin authentication (placeholder for now)
  async authenticateAdmin(walletAddress: string, signature: string): Promise<{ token: string }> {
    return this.request<{ token: string }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    })
  }

  // Get current admin profile
  async getAdminProfile(): Promise<User> {
    return this.request<User>('/api/auth/profile')
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export the class for testing
export { ApiService } 