// Test script to verify authentication flow
const API_BASE_URL = 'http://localhost:3002'

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...')
  
  // Test 1: Check if frontend is running
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Frontend health check:', healthResponse.status, healthData)
  } catch (error) {
    console.error('❌ Frontend not running:', error.message)
    return
  }
  
  // Test 2: Check profile endpoint without auth
  try {
    const profileResponse = await fetch(`${API_BASE_URL}/api/profile`)
    const profileData = await profileResponse.json()
    console.log('✅ Profile endpoint (no auth):', profileResponse.status, profileData)
  } catch (error) {
    console.error('❌ Profile endpoint error:', error.message)
  }
  
  // Test 3: Check backend URL (v.dobprotocol.com)
  const backendUrl = 'https://v.dobprotocol.com'
  console.log('🔍 Backend URL:', backendUrl)
  
  try {
    const backendHealthResponse = await fetch(`${backendUrl}/api/health`)
    console.log('✅ Backend health check:', backendHealthResponse.status)
  } catch (error) {
    console.error('❌ Backend not accessible:', error.message)
  }
  
  // Test 4: Test challenge endpoint
  try {
    const challengeResponse = await fetch(`${API_BASE_URL}/api/auth/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
      })
    })
    const challengeData = await challengeResponse.json()
    console.log('✅ Challenge endpoint:', challengeResponse.status, challengeData)
  } catch (error) {
    console.error('❌ Challenge endpoint error:', error.message)
  }
  
  // Test 5: Check environment variables (these should be set in Vercel)
  console.log('🔍 Environment check:')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
  console.log('- ***REMOVED***:', process.env.***REMOVED*** ? 'Set' : 'Not set')
  
  console.log('\n🎯 Next steps:')
  console.log('1. Open http://localhost:3002 in your browser')
  console.log('2. Connect your Stellar wallet')
  console.log('3. Check the browser console for authentication logs')
  console.log('4. The app should redirect to /dashboard or /profile based on authentication')
}

testAuthFlow().catch(console.error) 