// Utility functions for API configuration in backoffice
import { logWithDOBArt } from './utils'

/**
 * Get the safe backend URL for production
 * Forces the production backend URL in production environment
 */
export function getSafeBackendUrl(): string {
  // In production, always use the production backend URL
  if (typeof window !== 'undefined' && window.location.hostname === 'backoffice.dobprotocol.com') {
    logWithDOBArt('Using production backend URL', 'info')
    return 'https://v.dobprotocol.com'
  }
  
  // In development, use the environment variable or default
  const devUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  logWithDOBArt(`Using development backend URL: ${devUrl}`, 'info')
  return devUrl
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  const isProd = typeof window !== 'undefined' && window.location.hostname === 'backoffice.dobprotocol.com'
  if (isProd) {
    logWithDOBArt('Running in production environment', 'info')
  } else {
    logWithDOBArt('Running in development environment', 'info')
  }
  return isProd
} 