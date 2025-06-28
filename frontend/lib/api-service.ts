const API_BASE_URL = 'http://localhost:3001' // For backend-only endpoints

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('authToken')
      if (authData) {
        const parsedAuth = JSON.parse(authData)
        return parsedAuth.token || null
      }
    } catch (error) {
      console.error('Failed to parse auth token:', error)
    }
    return null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use absolute URL for backend-only endpoints, but relative for Next.js API routes
    const isFrontendApi = endpoint.startsWith('/api/')
    const url = isFrontendApi ? endpoint : `${this.baseUrl}${endpoint}`
    
    // Add cache-busting headers for browser compatibility
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers,
    }

    // Add authorization header if token exists
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint not found')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication (use Next.js API routes)
  async generateChallenge(walletAddress: string) {
    return this.request<{ success: boolean; challenge: string }>('/api/auth/challenge', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    })
  }

  async verifySignature(walletAddress: string, signature: string, challenge: string) {
    return this.request<{ success: boolean; token: string; user: any }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, challenge }),
    })
  }

  // Profile
  async getProfile() {
    return this.request<{ success: boolean; profile: any }>('/api/profile')
  }

  async createProfile(profileData: { name: string; company?: string; email: string }) {
    return this.request<{ success: boolean; profile: any }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }

  // Submissions (use backend API)
  async getSubmissions(options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    const params = new URLSearchParams()
    if (options?.status) params.append('status', options.status)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())

    const queryString = params.toString()
    const endpoint = `/api/submissions${queryString ? `?${queryString}` : ''}`

    return this.request<{
      success: boolean
      submissions: any[]
      total: number
      hasMore: boolean
    }>(endpoint)
  }

  async getDrafts(options?: {
    limit?: number
    offset?: number
  }) {
    const params = new URLSearchParams()
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())

    const queryString = params.toString()
    const endpoint = `/api/drafts${queryString ? `?${queryString}` : ''}`

    return this.request<{
      success: boolean
      drafts: any[]
      total: number
      hasMore: boolean
    }>(endpoint)
  }

  async getSubmission(id: string) {
    return this.request<{ success: boolean; submission: any }>(`/api/submissions/${id}`)
  }

  async createSubmission(submissionData: any) {
    return this.request<{ success: boolean; submission: any }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    })
  }

  // Device submission (use frontend API route)
  async submitDevice(formData: FormData) {
    const token = this.getAuthToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        const error = new Error(data.error || 'Submission failed')
        ;(error as any).status = response.status
        ;(error as any).errors = data.errors
        throw error
      }

      return data
    } catch (error) {
      console.error('Device submission failed:', error)
      throw error
    }
  }

  // Admin endpoints
  async updateSubmissionStatus(id: string, status: string, adminNotes?: string) {
    return this.request<{ success: boolean; submission: any }>(`/api/submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    })
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health')
  }
}

export const apiService = new ApiService()
export default apiService 