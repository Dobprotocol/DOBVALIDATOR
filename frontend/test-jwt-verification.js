// Test JWT token generation and verification
const jwt = require('jsonwebtoken')

function testJWT() {
  console.log('🧪 Testing JWT token generation and verification...')
  
  const ***REMOVED*** = process.env.***REMOVED*** || 'your-secret-key-change-in-production'
  const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
  
  console.log('🔑 ***REMOVED***:', ***REMOVED*** ? ***REMOVED***.substring(0, 20) + '...' : 'fallback value')
  
  try {
    // Generate token
    const token = jwt.sign(
      { 
        walletAddress,
        type: 'user',
        iat: Math.floor(Date.now() / 1000),
      },
      ***REMOVED***,
      { expiresIn: '7d' }
    )
    
    console.log('✅ Token generated:', token.substring(0, 50) + '...')
    
    // Verify token
    const payload = jwt.verify(token, ***REMOVED***)
    console.log('✅ Token verified successfully')
    console.log('📋 Payload:', payload)
    
    // Test with wrong secret
    try {
      jwt.verify(token, 'wrong-secret')
      console.log('❌ Should have failed with wrong secret')
    } catch (error) {
      console.log('✅ Correctly failed with wrong secret:', error.message)
    }
    
    // Test with malformed token
    try {
      jwt.verify('malformed-token', ***REMOVED***)
      console.log('❌ Should have failed with malformed token')
    } catch (error) {
      console.log('✅ Correctly failed with malformed token:', error.message)
    }
    
    console.log('\n✅ JWT test completed successfully!')
    
  } catch (error) {
    console.error('❌ JWT test failed:', error)
  }
}

testJWT() 