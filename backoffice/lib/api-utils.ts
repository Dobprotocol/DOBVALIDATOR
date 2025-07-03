// Utility functions for API configuration in backoffice

/**
 * Get the safe backend URL for production
 * Forces the production backend URL in production environment
 */
export function getSafeBackendUrl(): string {
  // In production, always use the production backend URL
  if (typeof window !== 'undefined' && window.location.hostname === 'backoffice.dobprotocol.com') {
    return 'https://v.dobprotocol.com'
  }
  
  // In development, use the environment variable or default
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === 'backoffice.dobprotocol.com'
} 