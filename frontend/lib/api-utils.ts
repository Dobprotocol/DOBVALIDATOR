/**
 * Utility function to safely get the backend URL and prevent loops
 * This ensures that the frontend never calls itself as the backend
 */
export function getSafeBackendUrl(): string {
  let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  
  // Production override: always use production backend in production
  if (process.env.NODE_ENV === 'production') {
    backendUrl = 'https://v.dobprotocol.com'
  }
  
  // Safety check: prevent calling the frontend domain as backend
  if (backendUrl.includes('validator.dobprotocol.com')) {
    console.warn('⚠️ Backend URL points to frontend domain, redirecting to v.dobprotocol.com')
    backendUrl = 'https://v.dobprotocol.com'
  }
  
  console.log('🔍 Using backend URL:', backendUrl)
  return backendUrl
} 