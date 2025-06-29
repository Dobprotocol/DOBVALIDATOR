// Test profile API with a valid JWT token
const API_BASE = 'http://localhost:3003/api'

// Simple JWT generation for testing (using the same secret as the API)
function generateTestToken(walletAddress) {
  const jwt = require('jsonwebtoken')
  // Use the same fallback as the API
  const ***REMOVED*** = process.env.***REMOVED*** || 'your-secret-key-change-in-production'
  
  console.log('🔑 Using ***REMOVED***:', ***REMOVED*** ? ***REMOVED***.substring(0, 20) + '...' : 'fallback value')
  
  return jwt.sign(
    { 
      walletAddress,
      type: 'user',
      iat: Math.floor(Date.now() / 1000),
    },
    ***REMOVED***,
    { expiresIn: '7d' }
  )
}

async function testProfileWithToken() {
  console.log('🧪 Testing Profile API with valid JWT token...')
  
  try {
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
    const token = generateTestToken(walletAddress)
    
    console.log('🔑 Generated test token:', token.substring(0, 50) + '...')
    
    // Test 1: Profile GET with valid token
    console.log('\n1️⃣ Testing profile GET with valid token...')
    const profileGetResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const profileGetData = await profileGetResponse.json()
    console.log('Status:', profileGetResponse.status)
    console.log('Response:', profileGetData)
    
    // Test 2: Profile POST with valid token
    console.log('\n2️⃣ Testing profile POST with valid token...')
    const profilePostResponse = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        phone: '+1234567890',
        website: 'https://example.com',
        bio: 'Test bio for profile creation'
      })
    })
    
    const profilePostData = await profilePostResponse.json()
    console.log('Status:', profilePostResponse.status)
    console.log('Response:', profilePostData)
    
    // Test 3: Profile GET again to see if it was created
    console.log('\n3️⃣ Testing profile GET again after creation...')
    const profileGetAgainResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const profileGetAgainData = await profileGetAgainResponse.json()
    console.log('Status:', profileGetAgainResponse.status)
    console.log('Response:', profileGetAgainData)
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProfileWithToken() 