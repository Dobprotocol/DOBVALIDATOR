// Test utilities for local storage flow

export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         (typeof window !== 'undefined' && (
           window.location.hostname === 'localhost' ||
           window.location.hostname.includes('vercel.app')
         ))
}

export const clearTestData = () => {
  if (typeof window === 'undefined') return
  
  // Clear all profile-related data
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('localProfile_') || key === 'userProfile' || key === 'authToken' || key === 'stellarPublicKey')) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key))
  console.log('🧹 Cleared test data:', keysToRemove)
}

export const createTestProfile = (walletAddress: string, profileData: {
  name: string
  company?: string
  email: string
}) => {
  if (typeof window === 'undefined') return null
  
  const profile = {
    ...profileData,
    walletAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: `test_${Date.now()}`
  }
  
  // Store in both locations
  localStorage.setItem('userProfile', JSON.stringify(profile))
  localStorage.setItem(`localProfile_${walletAddress}`, JSON.stringify(profile))
  
  console.log('✅ Created test profile:', profile)
  return profile
}

export const createTestAuth = (walletAddress: string) => {
  if (typeof window === 'undefined') return null
  
  const authToken = {
    token: 'dev_fallback_token_' + Date.now(),
    expiresIn: '7d',
    walletAddress,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
  }
  
  localStorage.setItem('authToken', JSON.stringify(authToken))
  localStorage.setItem('stellarPublicKey', walletAddress)
  
  console.log('✅ Created test auth:', authToken)
  return authToken
}

export const getTestProfile = (walletAddress: string) => {
  if (typeof window === 'undefined') return null
  
  try {
    const profileKey = `localProfile_${walletAddress}`
    const profileData = localStorage.getItem(profileKey)
    return profileData ? JSON.parse(profileData) : null
  } catch (error) {
    console.error('Failed to get test profile:', error)
    return null
  }
}

export const setupTestFlow = (walletAddress: string, profileData: {
  name: string
  company?: string
  email: string
}) => {
  if (typeof window === 'undefined') return
  
  clearTestData()
  createTestAuth(walletAddress)
  createTestProfile(walletAddress, profileData)
  
  console.log('🎯 Test flow setup complete!')
  console.log('📝 You can now test the authentication and profile flow')
}

// Global test functions for browser console
if (typeof window !== 'undefined') {
  (window as any).testUtils = {
    clearTestData,
    createTestProfile,
    createTestAuth,
    getTestProfile,
    setupTestFlow,
    isDevelopmentMode
  }
  
  console.log('🧪 Test utilities loaded! Available as window.testUtils')
  console.log('📝 Usage examples:')
  console.log('  window.testUtils.setupTestFlow("GCTEST123", { name: "Test User", company: "Test Co", email: "test@example.com" })')
  console.log('  window.testUtils.clearTestData()')
  console.log('  window.testUtils.getTestProfile("GCTEST123")')
} 