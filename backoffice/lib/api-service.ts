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
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api' 
      : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
    
    this.baseUrl = baseUrl
    
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

  // Transform backend submission data to frontend format
  private transformSubmission(backendSubmission: any): Submission {
    return {
      id: backendSubmission.id || '',
      deviceName: backendSubmission.deviceName || '',
      deviceType: backendSubmission.deviceType || '',
      serialNumber: backendSubmission.serialNumber || '',
      manufacturer: backendSubmission.manufacturer || '',
      model: backendSubmission.model || '',
      yearOfManufacture: backendSubmission.yearOfManufacture || '',
      condition: backendSubmission.condition || '',
      specifications: backendSubmission.specifications || '',
      purchasePrice: backendSubmission.purchasePrice || '',
      currentValue: backendSubmission.currentValue || '',
      expectedRevenue: backendSubmission.expectedRevenue || '',
      operationalCosts: backendSubmission.operationalCosts || '',
      operatorWallet: backendSubmission.user?.walletAddress || backendSubmission.operatorWallet || '',
      status: backendSubmission.status || 'pending',
      submittedAt: backendSubmission.submittedAt || '',
      updatedAt: backendSubmission.updatedAt || '',
      files: (backendSubmission.files || []).map((file: any) => ({
        filename: file.filename || '',
        path: file.path || '',
        documentType: file.documentType || ''
      })),
      adminNotes: backendSubmission.adminReview?.notes || backendSubmission.adminNotes || null,
      adminScore: backendSubmission.adminReview?.overallScore || backendSubmission.adminScore || null,
      adminDecision: backendSubmission.adminReview?.decision?.toLowerCase() || backendSubmission.adminDecision || null,
      adminDecisionAt: backendSubmission.adminReview?.decisionAt || backendSubmission.adminDecisionAt || null,
      certificateId: backendSubmission.certificate?.id || backendSubmission.certificateId || null
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
    
    const response = await this.makeRequest<any>(endpoint)
    
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          submissions: response.data.submissions?.map((s: any) => this.transformSubmission(s)) || [],
          pagination: {
            total: response.data.total || 0,
            limit: response.data.limit || 10,
            offset: response.data.offset || 0,
            hasMore: response.data.hasMore || false
          }
        }
      }
    }
    
    return response as ApiResponse<SubmissionsResponse>
  }

  // Get a specific submission by ID
  async getSubmission(id: string): Promise<ApiResponse<Submission>> {
    const response = await this.makeRequest<any>(`/submissions/${id}`)
    
    if (response.success && response.data?.submission) {
      return {
        success: true,
        data: this.transformSubmission(response.data.submission)
      }
    }
    
    return response as ApiResponse<Submission>
  }

  // Update a submission (admin only)
  async updateSubmission(
    id: string, 
    updates: Partial<Submission>
  ): Promise<ApiResponse<Submission>> {
    // Transform frontend updates to backend format
    const backendUpdates: any = { ...updates }
    
    // Handle admin review data
    if (updates.adminNotes !== undefined) {
      backendUpdates.adminNotes = updates.adminNotes
    }
    
    if (updates.adminScore !== undefined) {
      backendUpdates.adminScore = updates.adminScore
    }
    
    if (updates.adminDecision !== undefined) {
      backendUpdates.adminDecision = updates.adminDecision
    }
    
    if (updates.adminDecisionAt !== undefined) {
      backendUpdates.adminDecisionAt = updates.adminDecisionAt
    }
    
    const response = await this.makeRequest<any>(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates)
    })
    
    if (response.success && response.data?.submission) {
      return {
        success: true,
        data: this.transformSubmission(response.data.submission)
      }
    }
    
    return response as ApiResponse<Submission>
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