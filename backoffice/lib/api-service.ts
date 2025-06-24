// API service for backoffice to communicate with the backend
export interface Submission {
  id: string
  deviceName: string
  deviceType: string
  serialNumber: string
  manufacturer: string
  model: string
  yearOfManufacture: string
  condition: string
  specifications: string
  purchasePrice: string
  currentValue: string
  expectedRevenue: string
  operationalCosts: string
  operatorWallet: string
  status: 'pending' | 'under review' | 'approved' | 'rejected' | 'draft'
  submittedAt: string
  updatedAt: string
  files: Array<{
    filename: string
    path: string
    documentType: string
  }>
  adminNotes: string | null
  adminScore: number | null
  adminDecision: 'approved' | 'rejected' | null
  adminDecisionAt: string | null
  certificateId: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SubmissionsResponse {
  submissions: Submission[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

class ApiService {
  private baseUrl: string
  private getAuthToken: () => string | null

  constructor() {
    // In development, the backoffice runs on port 3000 and frontend API on port 3001
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:3001/api'
    
    this.getAuthToken = () => {
      const authData = localStorage.getItem('authToken')
      if (authData) {
        try {
          const parsed = JSON.parse(authData)
          return parsed.token || authData
        } catch {
          return authData
        }
      }
      return null
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken()
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      }
    }

    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Get all submissions (admin only)
  async getSubmissions(params?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<SubmissionsResponse>> {
    const queryParams = new URLSearchParams()
    
    if (params?.status) queryParams.append('status', params.status)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const endpoint = `/submissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    return this.makeRequest<SubmissionsResponse>(endpoint)
  }

  // Get a specific submission by ID
  async getSubmission(id: string): Promise<ApiResponse<Submission>> {
    return this.makeRequest<Submission>(`/submissions/${id}`)
  }

  // Update a submission (admin only)
  async updateSubmission(
    id: string, 
    updates: Partial<Submission>
  ): Promise<ApiResponse<Submission>> {
    return this.makeRequest<Submission>(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  // Get user profile
  async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/profile')
  }

  // Check if current user is authenticated
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null
  }

  // Get authentication token
  getToken(): string | null {
    return this.getAuthToken()
  }
}

export const apiService = new ApiService() 