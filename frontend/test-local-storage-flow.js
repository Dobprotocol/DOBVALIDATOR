// Test script for local storage profile flow
// Run this in the browser console to test the flow

console.log('🧪 Testing Local Storage Profile Flow...')

// Clear any existing data
localStorage.clear()
console.log('✅ Cleared localStorage')

// Simulate wallet connection
const mockWalletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3BAL3ZN'
localStorage.setItem('stellarPublicKey', mockWalletAddress)
console.log('✅ Set wallet address:', mockWalletAddress)

// Simulate authentication
const mockAuthToken = {
  token: 'dev_fallback_token_' + Date.now(),
  expiresIn: '7d',
  walletAddress: mockWalletAddress,
  expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
}
localStorage.setItem('authToken', JSON.stringify(mockAuthToken))
console.log('✅ Set auth token')

// Test profile creation
const mockProfile = {
  name: 'Test User',
  company: 'Test Company',
  email: 'test@example.com',
  walletAddress: mockWalletAddress,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  id: 'local_' + Date.now()
}

// Store profile in both locations
localStorage.setItem('userProfile', JSON.stringify(mockProfile))
localStorage.setItem(`localProfile_${mockWalletAddress}`, JSON.stringify(mockProfile))
console.log('✅ Created mock profile:', mockProfile)

// Test profile retrieval
const retrievedProfile = localStorage.getItem(`localProfile_${mockWalletAddress}`)
const userProfile = localStorage.getItem('userProfile')
console.log('✅ Retrieved profile from localProfile:', retrievedProfile ? 'found' : 'not found')
console.log('✅ Retrieved profile from userProfile:', userProfile ? 'found' : 'not found')

// Test API service simulation
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname.includes('vercel.app')
}

const getLocalProfile = () => {
  if (!isDevelopmentMode()) return null
  
  try {
    const walletAddress = mockWalletAddress
    if (!walletAddress) return null
    
    const profileKey = `localProfile_${walletAddress}`
    const profileData = localStorage.getItem(profileKey)
    return profileData ? JSON.parse(profileData) : null
  } catch (error) {
    console.error('Failed to get local profile:', error)
    return null
  }
}

const profile = getLocalProfile()
console.log('✅ API service simulation - profile found:', profile ? 'yes' : 'no')

if (profile) {
  console.log('✅ Profile details:', {
    name: profile.name,
    company: profile.company,
    email: profile.email,
    id: profile.id
  })
}

console.log('🎉 Local storage flow test completed!')
console.log('📝 Next steps:')
console.log('1. Navigate to the app')
console.log('2. Connect wallet (should auto-authenticate)')
console.log('3. Should redirect to dashboard if profile exists')
console.log('4. Or redirect to profile creation if no profile')
console.log('5. Profile creation should work with local storage') 