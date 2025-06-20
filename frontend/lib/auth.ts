// Authentication utilities for the frontend

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
  const response = await fetch('/api/auth/challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  })

  if (!response.ok) {
    throw new Error('Failed to request challenge')
  }

  const data = await response.json()
  return data
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
  
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress, signature, challenge }),
  })

  console.log('📊 Verify response status:', response.status)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('❌ Verification failed:', errorData)
    throw new Error('Failed to verify signature')
  }

  const data = await response.json()
  console.log('✅ Verification successful:', data)
  
  return {
    token: data.token,
    expiresIn: data.expiresIn,
    walletAddress
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