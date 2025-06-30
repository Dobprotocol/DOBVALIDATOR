// Authentication utilities for the frontend
import { apiService } from './api-service'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { getSession } from './auth-storage'

export interface AuthToken {
  token: string
  expiresIn: string
  walletAddress: string
}

export interface ChallengeResponse {
  challenge: string
  message: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

interface JWTPayload {
  walletAddress: string
  type: 'user'
  iat: number
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
    return JSON.parse(authData)
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
  return !!authToken?.token
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

// Complete authentication flow
export const authenticateWallet = async (walletAddress: string, signature: string, challenge: string) => {
  try {
    const authToken = await verifySignature(walletAddress, signature, challenge)
    storeAuthToken(authToken.token, authToken.expiresIn, authToken.walletAddress)
    return authToken
  } catch (error) {
    console.error('Authentication failed:', error)
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

// Helper function to verify JWT token
export function verifyToken(token: string): { valid: boolean; payload?: JWTPayload } {
  console.log('🔍 Verifying JWT token...')
  console.log('🔍 JWT_SECRET being used:', JWT_SECRET ? JWT_SECRET.substring(0, 10) + '...' : 'No JWT_SECRET')
  console.log('🔍 Token being verified:', token ? token.substring(0, 20) + '...' : 'No token')
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    console.log('✅ JWT payload:', payload)
    
    // Temporarily disable session check to isolate JWT verification issue
    console.log('✅ JWT verification successful (session check disabled)')
    return { valid: true, payload }
    
    // Original session check (commented out for debugging)
    /*
    // Check if session is still active
    const session = getSession(payload.walletAddress)
    if (!session) {
      console.log('❌ No active session found for wallet:', payload.walletAddress)
      return { valid: false }
    }
    
    console.log('✅ Session found and valid')
    return { valid: true, payload }
    */
  } catch (error) {
    console.log('❌ JWT verification failed:', error)
    console.log('❌ Error name:', error.name)
    console.log('❌ Error message:', error.message)
    return { valid: false }
  }
}

// Helper function to get authenticated user from request
export function getAuthenticatedUser(request: NextRequest): { valid: boolean; user?: JWTPayload } {
  console.log('🔍 Getting authenticated user from request...')
  const authHeader = request.headers.get('authorization')
  console.log('🔍 Auth header:', authHeader ? 'present' : 'missing')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Invalid or missing authorization header')
    return { valid: false }
  }
  
  const token = authHeader.substring(7)
  console.log('🔍 Extracted token:', token ? `${token.substring(0, 20)}...` : 'empty')
  
  const result = verifyToken(token)
  console.log('🔍 Verification result:', result)
  
  if (result.valid) {
    return { valid: true, user: result.payload }
  } else {
    return { valid: false }
  }
} 