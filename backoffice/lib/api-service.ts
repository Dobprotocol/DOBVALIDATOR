// API Service for DOB Validator Backend
// Base URL: Use Next.js API routes for frontend endpoints, backend for backend-only endpoints

// Get the safe backend URL for production
function getSafeBackendUrl(): string {
  // In production, always use the production backend URL
  if (typeof window !== 'undefined' && window.location.hostname === 'backoffice.dobprotocol.com') {
    return 'https://v.dobprotocol.com'
  }
  
  // In development, use the environment variable or default
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
}

const API_BASE_URL = getSafeBackendUrl()

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

    let token: string | null = null;
    if (this.authToken) {
      if (typeof this.authToken === 'object' && 'token' in this.authToken) {
        token = (this.authToken as any).token;
      } else if (typeof this.authToken === 'string') {
        token = this.authToken;
      }
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Always use the backend URL for API calls
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    }

    try {
      console.log(`🔍 Making API request to: ${url}`)
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API Error ${response.status}: ${errorText}`)
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ API request successful:`, data)
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Utility to convert camelCase to snake_case
  private toSnakeCase(obj: any): any {
    console.log('🔍 toSnakeCase called with:', obj)
    if (Array.isArray(obj)) {
      console.log('🔍 Processing array of length:', obj.length)
      return obj.map((v) => this.toSnakeCase(v));
    }
    if (obj !== null && typeof obj === 'object') {
      console.log('🔍 Processing object with keys:', Object.keys(obj))
      const result = Object.fromEntries(
        Object.entries(obj).map(([k, v]) => {
          // Improved regex to handle camelCase to snake_case conversion
          const newKey = k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
          console.log(`🔍 Converting ${k} -> ${newKey}`)
          return [newKey, this.toSnakeCase(v)]
        })
      )
      console.log('🔍 toSnakeCase result:', result)
      return result
    }
    return obj;
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
    const response = await this.request<any>(endpoint)
    console.log('🔍 Raw API response:', response)
    const mappedSubmissions = this.toSnakeCase(response.submissions || [])
    console.log('🔍 Mapped submissions:', mappedSubmissions)
    return mappedSubmissions
  }

  // Get all drafts
  async getAllDrafts(options?: {
    limit?: number
    offset?: number
  }): Promise<any[]> {
    const params = new URLSearchParams()
    
    if (options?.limit) {
      params.append('limit', options.limit.toString())
    }
    if (options?.offset) {
      params.append('offset', options.offset.toString())
    }

    const queryString = params.toString()
    const endpoint = `/api/drafts${queryString ? `?${queryString}` : ''}`
    
    return this.request<any[]>(endpoint)
  }

  // Get submissions and drafts combined
  async getSubmissionsAndDrafts(options?: {
    limit?: number
    offset?: number
  }): Promise<{ submissions: Submission[], drafts: any[] }> {
    const [submissions, draftsResponse] = await Promise.all([
      this.getAllSubmissions(options),
      this.getAllDrafts(options)
    ])

    return {
      submissions,
      drafts: draftsResponse || []
    }
  }

  // Get submissions by status
  async getSubmissionsByStatus(status: string): Promise<Submission[]> {
    return this.getAllSubmissions({ status })
  }

  // Get a single submission by ID
  async getSubmissionById(id: string): Promise<Submission> {
    const response = await this.request<any>(`/api/submissions/${id}`)
    console.log('🔍 Raw submission response:', response)
    // Extract the submission object from the response and apply field mapping
    const submission = response.submission || response
    const mappedSubmission = this.toSnakeCase(submission)
    console.log('🔍 Mapped submission:', mappedSubmission)
    return mappedSubmission
  }

  // Update submission status
  async updateSubmissionStatus(
    submissionId: string,
    status: string
  ): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${submissionId}`, {
      method: 'PUT',
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
    return submissions && Array.isArray(submissions) ? submissions.length : 0
  }

  // Get submissions statistics
  async getSubmissionsStats(): Promise<SubmissionsStats> {
    const allSubmissions = await this.getAllSubmissions()
    const stats: SubmissionsStats = {
      total: allSubmissions && Array.isArray(allSubmissions) ? allSubmissions.length : 0,
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

  // Generate challenge for wallet authentication
  async generateChallenge(walletAddress: string): Promise<{ challenge: string }> {
    return this.request<{ challenge: string }>('/api/auth/challenge', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    })
  }

  // Verify signature and get JWT token
  async verifySignature(
    walletAddress: string,
    signature: string,
    challenge: string
  ): Promise<{ token: string }> {
    return this.request<{ token: string }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        signature,
        challenge,
      }),
    })
  }

  // Complete wallet login flow
  async walletLogin(
    walletAddress: string,
    signature: string,
    challenge: string
  ): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>('/api/auth/wallet-login', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        signature,
        challenge,
      }),
    })
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export the class for testing
export { ApiService } 