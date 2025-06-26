const API_BASE_URL = '' // Use relative URLs to call frontend API routes

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const authData = localStorage.getItem('authToken')
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData)
        if (parsedAuth.token) {
      config.headers = {
        ...config.headers,
            'Authorization': `Bearer ${parsedAuth.token}`,
          }
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error)
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication
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

  // Submissions
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

  async getSubmission(id: string) {
    return this.request<{ success: boolean; submission: any }>(`/api/submissions/${id}`)
  }

  async createSubmission(submissionData: any) {
    return this.request<{ success: boolean; submission: any }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    })
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