import { getSafeBackendUrl } from './api-utils'

const API_BASE_URL = getSafeBackendUrl() // For backend-only endpoints

// Check if we're in development/testing mode
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1'
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('authToken')
      console.log('🔍 Auth data from localStorage:', authData)
      
      if (authData) {
        const parsedAuth = JSON.parse(authData)
        console.log('🔍 Parsed auth data:', parsedAuth)
        
        // Handle both real auth token format and mock token format
        if (parsedAuth.token) {
          // Real auth token format: { token: string, expiresIn: string, walletAddress: string, expiresAt: number }
          console.log('🔍 Using real auth token format')
          return parsedAuth.token
        } else if (parsedAuth.access_token) {
          // Mock session format: { access_token: string, refresh_token: string, ... }
          console.log('🔍 Using mock session format')
          return parsedAuth.access_token
        } else if (typeof parsedAuth === 'string') {
          // Direct token string
          console.log('🔍 Using direct token string format')
          return parsedAuth
        }
      }
    } catch (error) {
      console.error('Failed to parse auth token:', error)
    }
    return null
  }

  private getWalletAddress(): string | null {
    try {
      const authData = localStorage.getItem('authToken')
      if (authData) {
        const parsedAuth = JSON.parse(authData)
        return parsedAuth.walletAddress || localStorage.getItem('stellarPublicKey')
      }
      return localStorage.getItem('stellarPublicKey')
    } catch (error) {
      console.error('Failed to get wallet address:', error)
      return localStorage.getItem('stellarPublicKey')
    }
  }

  // Local storage profile management for development/testing
  private getLocalProfile(): any | null {
    if (!isDevelopmentMode()) return null
    
    try {
      const walletAddress = this.getWalletAddress()
      if (!walletAddress) return null
      
      const profileKey = `localProfile_${walletAddress}`
      const profileData = localStorage.getItem(profileKey)
      return profileData ? JSON.parse(profileData) : null
    } catch (error) {
      console.error('Failed to get local profile:', error)
      return null
    }
  }

  private setLocalProfile(profileData: any): void {
    if (!isDevelopmentMode()) return
    
    try {
      const walletAddress = this.getWalletAddress()
      if (!walletAddress) return
      
      const profileKey = `localProfile_${walletAddress}`
      const profileToStore = {
        ...profileData,
        walletAddress,
        createdAt: profileData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: profileData.id || `local_${Date.now()}`
      }
      
      localStorage.setItem(profileKey, JSON.stringify(profileToStore))
      console.log('✅ [LocalStorage] Profile stored:', profileToStore)
    } catch (error) {
      console.error('Failed to set local profile:', error)
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // ALWAYS use the backend URL for all API calls to ensure consistency
    const url = `${this.baseUrl}${endpoint}`
    
    console.log(`🔍 URL resolution debug:`)
    console.log(`  - endpoint: ${endpoint}`)
    console.log(`  - baseUrl: ${this.baseUrl}`)
    console.log(`  - final url: ${url}`)
    
    // Check if this is a FormData request
    const isFormData = options.body instanceof FormData
    
    // Add cache-busting headers for browser compatibility
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }

    // Add any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    // Add authorization header if token exists
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      console.log(`🔍 Making API request to: ${url}`)
      console.log(`🔍 Headers:`, headers)
      if (isFormData) {
        console.log(`🔍 FormData entries:`, Array.from((options.body as FormData).entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`))
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
      })
      
      console.log(`🔍 Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`❌ API request failed: ${response.status}`, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ API request successful:`, data)
      return data
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

  // Wallet login
  async walletLogin(walletAddress: string, signature: string, challenge: string) {
    return this.request<{ 
      success: boolean; 
      access_token: string; 
      refresh_token: string; 
      user: any;
      session: any;
    }>('/api/auth/wallet-login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, challenge }),
    })
  }

  // Profile - Always query database using wallet address
  async getProfile() {
    console.log('🔍 Querying database for profile with wallet address:', this.getWalletAddress())
    
    // For development mode, try local storage first
    if (isDevelopmentMode()) {
      const localProfile = this.getLocalProfile()
      if (localProfile) {
        console.log('✅ Found local profile:', localProfile)
        return { success: true, profile: localProfile }
      }
    }
    
    // Try backend API
    try {
    return this.request<{ success: boolean; profile: any }>('/api/profile')
    } catch (error) {
      console.error('❌ Backend profile request failed:', error)
      
      // In development mode, if backend fails, create a default profile
      if (isDevelopmentMode()) {
        const walletAddress = this.getWalletAddress()
        if (walletAddress) {
          const defaultProfile = {
            id: `local_${Date.now()}`,
            walletAddress,
            name: 'Local User',
            email: `${walletAddress.substring(0, 8)}@local.dev`,
            company: 'Local Development',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          this.setLocalProfile(defaultProfile)
          console.log('✅ Created default local profile:', defaultProfile)
          return { success: true, profile: defaultProfile }
        }
      }
      
      throw error
    }
  }

  async createProfile(profileData: { name: string; company?: string; email: string; profileImage?: string }) {
    console.log('🔍 Creating profile in database with wallet address:', this.getWalletAddress())
    
    // For development mode, save to local storage
    if (isDevelopmentMode()) {
      const walletAddress = this.getWalletAddress()
      if (walletAddress) {
        const profile = {
          ...profileData,
          id: `local_${Date.now()}`,
          walletAddress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.setLocalProfile(profile)
        console.log('✅ Profile saved to local storage:', profile)
        return { success: true, profile }
      }
    }
    
    // Try backend API
    try {
    return this.request<{ success: boolean; profile: any }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
    } catch (error) {
      console.error('❌ Backend profile creation failed:', error)
      throw error
    }
  }

  // Upload profile image
  async uploadProfileImage(imageFile: File) {
    console.log('🔍 Uploading profile image')
    
    const formData = new FormData()
    formData.append('profileImage', imageFile)
    
    // Use the frontend API route which will proxy to the backend
    return this.request<{ success: boolean; imageUrl: string; profile: any }>('/api/profile/upload-image', {
      method: 'POST',
      body: formData,
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

  // Upload files during form process
  async uploadFiles(formData: FormData) {
    console.log('🔍 Uploading files to backend')
    
    // Use the frontend API route which will proxy to the backend
    return this.request<{ success: boolean; files: any[] }>('/api/upload-files', {
      method: 'POST',
      body: formData,
    })
  }

  // Submit device for verification
  async submitDevice(formData: FormData) {
    console.log('🔍 Submitting device for verification')
    
    // Convert FormData to JSON object for backend compatibility
    const submissionData: any = {}
    
    // Extract all form fields
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Skip files for now - they should be uploaded separately
        console.log(`🔍 Skipping file field: ${key}`)
        continue
      }
      submissionData[key] = value
    }
    
    console.log('🔍 Converted FormData to JSON:', submissionData)
    
    // Use the frontend API route which will proxy to the backend
    return this.request<{ success: boolean; submission: any }>('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(submissionData),
      })
  }

  // Delete draft
  async deleteDraft(draftId: string) {
    console.log('🔍 Deleting draft:', draftId)
    
    return this.request<{ success: boolean }>(`/api/drafts/${draftId}`, {
      method: 'DELETE',
    })
  }
}

export const apiService = new ApiService()
export default apiService