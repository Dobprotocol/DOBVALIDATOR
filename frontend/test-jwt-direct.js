// Test JWT verification directly in the API
const API_BASE = 'http://localhost:3003/api'

async function testJWTViaAPI() {
  console.log('🧪 Testing JWT verification directly via API...')
  
  try {
    const jwt = require('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
    
    const token = jwt.sign(
      { 
        walletAddress,
        type: 'user',
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    console.log('🔑 Generated token:', token.substring(0, 50) + '...')
    
    // Test 1: Call the verification endpoint with debug parameter
    console.log('\n1️⃣ Testing verification endpoint with debug parameter...')
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
    
    // Test 3: Call the verification endpoint with invalid token
    console.log('\n3️⃣ Testing verification endpoint with invalid token...')
    const verifyInvalidResponse = await fetch(`${API_BASE}/auth/verify?debug=challenges`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here'
      }
    })
    
    const verifyInvalidData = await verifyInvalidResponse.json()
    console.log('Status:', verifyInvalidResponse.status)
    console.log('Response:', verifyInvalidData)
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testJWTViaAPI() 