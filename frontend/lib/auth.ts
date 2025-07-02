// Authentication utilities for the frontend
import { apiService } from './api-service'

export interface AuthToken {
  token: string
  expiresIn: string
  walletAddress: string
}

export interface ChallengeResponse {
  challenge: string
  message: string
}

// Store auth token in localStorage
export const storeAuthToken = (token: string, expiresIn: string, walletAddress: string) => {
  const authData: AuthToken = {
    token,
    expiresIn,
    walletAddress
  }
  localStorage.setItem('authToken', JSON.stringify(authData))
}

// Get auth token from localStorage
export const getAuthToken = (): AuthToken | null => {
  if (typeof window === 'undefined') return null
  
  const authData = localStorage.getItem('authToken')
  if (!authData) return null
  
  try {
    const token = JSON.parse(authData)
    
    // Check if this is a mock/test token
    if (token.token && token.token.startsWith('dev_fallback_token_')) {
      console.warn('⚠️ Detected mock/test token. Please authenticate properly to get a real JWT token.')
      return null
    }
    
    return token
  } catch {
    return null
  }
}

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('authToken')
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const authToken = getAuthToken()
  if (!authToken?.token) {
    return false
  }
  
  // All tokens are considered valid if they exist
    return true
  
  // For real JWTs, we could add additional validation here if needed
  return true
}

// Get authorization header for API requests
export const getAuthHeader = (): { Authorization: string } | {} => {
  const authToken = getAuthToken()
  if (!authToken?.token) return {}
  
  return {
    Authorization: `Bearer ${authToken.token}`
  }
}

// Request a challenge for wallet signature
export const requestChallenge = async (walletAddress: string): Promise<ChallengeResponse> => {
  try {
    const response = await apiService.generateChallenge(walletAddress)
    return {
      challenge: response.challenge,
      message: 'Please sign this challenge with your wallet to authenticate'
    }
  } catch (error) {
    console.error('Failed to request challenge:', error)
    throw new Error('Failed to request challenge')
  }
}

// Verify wallet signature and get JWT token
export const verifySignature = async (
  walletAddress: string, 
  signature: string, 
  challenge: string
): Promise<AuthToken> => {
  console.log('🔍 Verifying signature...')
  console.log('🔍 Wallet address:', walletAddress)
  console.log('🔍 Challenge:', challenge)
  console.log('🔍 Signature:', signature.substring(0, 20) + '...')
  
  try {
    const response = await apiService.verifySignature(walletAddress, signature, challenge)
    console.log('✅ Verification successful:', response)
    
    return {
      token: response.token,
      expiresIn: '7d', // Default expiration
      walletAddress
    }
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw new Error('Failed to verify signature')
  }
}

// Complete authentication flow using verify endpoint
export const authenticateWallet = async (walletAddress: string, signature: string, challenge: string) => {
  try {
    console.log('🚀 Starting JWT-based authentication...')
    
    // Use the verify endpoint to get JWT token
    const response = await apiService.verifySignature(walletAddress, signature, challenge)
    console.log('✅ Verification successful:', response)
    
    // Store the JWT token
    const authToken = {
      token: response.token,
      expiresIn: response.expiresIn || '7d',
      walletAddress
    }
    
    storeAuthToken(authToken.token, authToken.expiresIn, authToken.walletAddress)
    console.log('✅ JWT token stored in localStorage')
    return authToken
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    throw error
  }
}

// Logout user
export const logout = () => {
  const authToken = getAuthToken()
  
  // Clear frontend storage
  removeAuthToken()
  localStorage.removeItem('stellarPublicKey')
  localStorage.removeItem('stellarWallet')
  localStorage.removeItem('userProfile')
  
  // Clear backend session if we have wallet address
  if (authToken?.walletAddress) {
    // Note: In a real app, you'd call an API endpoint to clear the session
    // For now, we'll just clear local storage
    console.log('🚪 Logging out wallet:', authToken.walletAddress)
  }
  
  // Clear session storage as well
  sessionStorage.clear()
  
  window.dispatchEvent(new Event('walletStateChange'))
}

// Make authenticated API request
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const authHeader = getAuthHeader()
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeader,
    },
  })

  if (response.status === 401) {
    // Token expired or invalid, logout user
    logout()
    throw new Error('Authentication expired')
  }

  return response
} 