// Test the verification endpoint directly
const API_BASE = 'http://localhost:3002/api'

async function testVerificationEndpoint() {
  console.log('🧪 Testing verification endpoint directly...')
  
  try {
    // Test 1: Call the verification endpoint with a valid token
    console.log('\n1️⃣ Testing verification endpoint with valid token...')
    
    const jwt = require('jsonwebtoken')
    const ***REMOVED*** = process.env.***REMOVED*** || 'your-secret-key-change-in-production'
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
    
    const token = jwt.sign(
      { 
        walletAddress,
        type: 'user',
        iat: Math.floor(Date.now() / 1000),
      },
      ***REMOVED***,
      { expiresIn: '7d' }
    )
    
    console.log('🔑 Generated token:', token.substring(0, 50) + '...')
    
    // Call the verification endpoint with debug parameter
    const verifyResponse = await fetch(`${API_BASE}/auth/verify?debug=challenges`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const verifyData = await verifyResponse.json()
    console.log('Status:', verifyResponse.status)
    console.log('Response:', verifyData)
    
    // Test 2: Call the verification endpoint without token
    console.log('\n2️⃣ Testing verification endpoint without token...')
    const verifyNoTokenResponse = await fetch(`${API_BASE}/auth/verify?debug=challenges`)
    const verifyNoTokenData = await verifyNoTokenResponse.json()
    console.log('Status:', verifyNoTokenResponse.status)
    console.log('Response:', verifyNoTokenData)
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testVerificationEndpoint() 