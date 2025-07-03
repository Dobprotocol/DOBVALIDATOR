/**
 * Modern API Client with proper error handling and configuration
 * Follows best practices for production applications
 */

import { config } from './config-validation'

// API Response types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API Error class
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request configuration
interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
}

// API Client class
class ApiClient {
  private baseUrl: string
  private defaultTimeout = 10000 // 10 seconds
  private defaultRetries = 3

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.BACKEND_URL
  }

  // Generic request method with proper error handling
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      ...fetchOptions
    } = options

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseUrl}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData.code
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408)
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        500
      )
    }
  }

  // Authentication methods
  async generateChallenge(walletAddress: string): Promise<ApiResponse<{ challenge: string }>> {
    return this.request('/api/auth/challenge', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    })
  }

  async verifySignature(
    walletAddress: string, 
    signature: string, 
    challenge: string
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, challenge }),
    })
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/api/profile')
  }

  async createProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.request('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }

  // Submission methods
  async getSubmissions(options?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (options?.status) params.append('status', options.status)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/submissions${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  async submitDevice(formData: FormData): Promise<ApiResponse<any>> {
    return this.request('/api/submissions', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types for external use
export type { ApiResponse, RequestConfig }
export { ApiError } 