// Test the new auth test endpoint
const API_BASE = 'http://localhost:3003/api'

async function testAuthEndpoint() {
  console.log('🧪 Testing auth test endpoint...')
  
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
    
    // Test 1: Call the auth test endpoint with valid token
    console.log('\n1️⃣ Testing auth endpoint with valid token...')
    const authResponse = await fetch(`${API_BASE}/test-auth`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const authData = await authResponse.json()
    console.log('Status:', authResponse.status)
    console.log('Response:', authData)
    
    // Test 2: Call the auth test endpoint without token
    console.log('\n2️⃣ Testing auth endpoint without token...')
    const authNoTokenResponse = await fetch(`${API_BASE}/test-auth`)
    const authNoTokenData = await authNoTokenResponse.json()
    console.log('Status:', authNoTokenResponse.status)
    console.log('Response:', authNoTokenData)
    
    // Test 3: Call the auth test endpoint with invalid token
    console.log('\n3️⃣ Testing auth endpoint with invalid token...')
    const authInvalidResponse = await fetch(`${API_BASE}/test-auth`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here'
      }
    })
    
    const authInvalidData = await authInvalidResponse.json()
    console.log('Status:', authInvalidResponse.status)
    console.log('Response:', authInvalidData)
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAuthEndpoint() 