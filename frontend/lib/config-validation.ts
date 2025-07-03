/**
 * Configuration validation for production
 * This validates environment variables at build time to catch issues early
 */

interface Config {
  FRONTEND_URL: string
  BACKEND_URL: string
  BACKOFFICE_URL: string
  // Removed Supabase references
  STELLAR_NETWORK: 'testnet' | 'public'
  STELLAR_HORIZON_URL: string
}

function validateConfig(): Config {
  const errors: string[] = []
  
  // Required environment variables
  const requiredVars = {
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_BACKOFFICE_URL: process.env.NEXT_PUBLIC_BACKOFFICE_URL,
    // Removed Supabase references
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_STELLAR_HORIZON_URL: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL,
  }
  
  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  })
  
  // Validate URL formats
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  const backofficeUrl = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3002'
  
  // Check for URL conflicts (prevent loops)
  if (frontendUrl === backendUrl) {
    errors.push('FRONTEND_URL and BACKEND_URL cannot be the same')
  }
  
  if (frontendUrl === backofficeUrl) {
    errors.push('FRONTEND_URL and BACKOFFICE_URL cannot be the same')
  }
  
  if (backendUrl === backofficeUrl) {
    errors.push('BACKEND_URL and BACKOFFICE_URL cannot be the same')
  }
  
  // Validate Stellar network
  const stellarNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK
  if (stellarNetwork && !['testnet', 'public'].includes(stellarNetwork)) {
    errors.push('STELLAR_NETWORK must be either "testnet" or "public"')
  }
  
  // Throw error if any validation failed
  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    throw new Error('Configuration validation failed. Check your environment variables.')
  }
  
  return {
    FRONTEND_URL: frontendUrl,
    BACKEND_URL: backendUrl,
    BACKOFFICE_URL: backofficeUrl,
    // Removed Supabase references
    STELLAR_NETWORK: (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'public') || 'testnet',
    STELLAR_HORIZON_URL: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL!,
  }
}

// Export validated config
export const config = validateConfig()

// Individual URL getters for convenience
export const getFrontendUrl = () => config.FRONTEND_URL
export const getBackendUrl = () => config.BACKEND_URL
export const getBackofficeUrl = () => config.BACKOFFICE_URL 