const fetch = require('node-fetch')

const FRONTEND_BASE_URL = 'http://localhost:3000'
const BACKEND_BASE_URL = 'https://v.dobprotocol.com'

// Real JWT token from the authentication flow
const REAL_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNsZGYxbnUwMDAxZXZ0YXdkMnMydnZ5IiwiaWF0IjoxNzUxNDI1OTk0LCJleHAiOjE3NTIwMzA3OTR9.PsI2Bycr7PPKZ9JPaenfAeSJVSRCkunwFuNl8eV3L6c'

async function testDraftsEndpoint() {
  console.log('🧪 Testing drafts endpoint...')
  
  try {
    // Test 1: Check if frontend drafts endpoint exists
    console.log('\n1️⃣ Testing frontend /api/drafts endpoint...')
    
    const response = await fetch(`${FRONTEND_BASE_URL}/api/drafts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REAL_JWT}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Frontend response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Frontend drafts endpoint working:', data)
    } else {
      const error = await response.text()
      console.log('❌ Frontend drafts endpoint error:', error)
    }

    // Test 2: Check if backend drafts endpoint exists
    console.log('\n2️⃣ Testing backend /api/drafts endpoint...')
    
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/drafts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REAL_JWT}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Backend response status:', backendResponse.status)
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend drafts endpoint working:', data)
    } else {
      const error = await backendResponse.text()
      console.log('❌ Backend drafts endpoint error:', error)
    }

  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testDraftsEndpoint() 