/**
 * Utility function to safely get the backend URL and prevent loops
 * This ensures that the frontend never calls itself as the backend
 */
export function getSafeBackendUrl(): string {
  // If running in the browser and on the production frontend, always use the production backend
  if (typeof window !== 'undefined' && window.location.hostname === 'validator.dobprotocol.com') {
    console.log('🔍 [getSafeBackendUrl] Detected production frontend domain, using v.dobprotocol.com');
    return 'https://v.dobprotocol.com';
  }

  // If running on the server in production, use the production backend
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 [getSafeBackendUrl] NODE_ENV=production, using v.dobprotocol.com');
    return 'https://v.dobprotocol.com';
  }
  
  // Otherwise, use the environment variable or fallback to localhost
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  console.log('🔍 [getSafeBackendUrl] Using backendUrl:', backendUrl);
  return backendUrl;
} 