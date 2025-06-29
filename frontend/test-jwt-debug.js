// Test JWT verification by creating a simple debug endpoint
const API_BASE = 'http://localhost:3003/api'

async function testJWTDebug() {
  console.log('🧪 Testing JWT verification with debug endpoint...')
  
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
    
    // Test 1: Call the debug endpoint to see if JWT verification is working
    console.log('\n1️⃣ Testing debug endpoint with valid token...')
    const debugResponse = await fetch(`${API_BASE}/debug`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const debugData = await debugResponse.json()
    console.log('Status:', debugResponse.status)
    console.log('Response:', debugData)
    
    // Test 2: Call the debug endpoint without token
    console.log('\n2️⃣ Testing debug endpoint without token...')
    const debugNoTokenResponse = await fetch(`${API_BASE}/debug`)
    const debugNoTokenData = await debugNoTokenResponse.json()
    console.log('Status:', debugNoTokenResponse.status)
    console.log('Response:', debugNoTokenData)
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testJWTDebug() 