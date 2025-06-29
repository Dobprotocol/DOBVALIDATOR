const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001' // For backend-only endpoints

// Check if we're in development/testing mode
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname.includes('vercel.app') ||
         window.location.hostname.includes('vercel.app')
}

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
        
        // Handle both real auth token format and mock token format
        if (parsedAuth.token) {
          // Real auth token format: { token: string, expiresIn: string, walletAddress: string, expiresAt: number }
          return parsedAuth.token
        } else if (parsedAuth.access_token) {
          // Mock session format: { access_token: string, refresh_token: string, ... }
          return parsedAuth.access_token
        } else if (typeof parsedAuth === 'string') {
          // Direct token string
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

  // New Supabase-based wallet login
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

  // Profile - Modified to use local storage in development mode
  async getProfile() {
    if (isDevelopmentMode()) {
      console.log('🔧 [Development Mode] Using local storage for profile')
      const localProfile = this.getLocalProfile()
      if (localProfile) {
        console.log('✅ [Development Mode] Profile found in local storage:', localProfile)
        return { success: true, profile: localProfile }
      } else {
        console.log('❌ [Development Mode] No profile found in local storage')
        throw new Error('Profile not found')
      }
    }
    
    return this.request<{ success: boolean; profile: any }>('/api/profile')
  }

  async createProfile(profileData: { name: string; company?: string; email: string }) {
    if (isDevelopmentMode()) {
      console.log('🔧 [Development Mode] Creating profile in local storage')
      const profileToCreate = {
        ...profileData,
        id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      this.setLocalProfile(profileToCreate)
      console.log('✅ [Development Mode] Profile created in local storage')
      return { success: true, profile: profileToCreate }
    }
    
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
}

export const apiService = new ApiService()
export default apiService