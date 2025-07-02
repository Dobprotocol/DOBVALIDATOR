const fetch = require('node-fetch')

const FRONTEND_BASE_URL = 'http://localhost:3000'
const BACKEND_BASE_URL = 'https://v.dobprotocol.com'

// Real JWT token from the authentication flow (replace with actual token)
const REAL_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNsZGYxbnUwMDAxZXZ0YXdkMnMydnZ5IiwiaWF0IjoxNzUxNDI1OTk0LCJleHAiOjE3NTIwMzA3OTR9.PsI2Bycr7PPKZ9JPaenfAeSJVSRCkunwFuNl8eV3L6c'

async function testSubmissionWithRealToken() {
  console.log('🧪 Testing submission with real JWT token...')
  
  try {
    // Test 1: Check if backend accepts the JWT token
    console.log('\n1️⃣ Testing backend authentication with JWT...')
    
    const authResponse = await fetch(`${BACKEND_BASE_URL}/api/submissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REAL_JWT}`
      }
    })
    
    console.log(`Backend auth response status: ${authResponse.status}`)
    
    if (authResponse.ok) {
      const data = await authResponse.json()
      console.log('✅ Backend authentication successful:', data)
    } else {
      const errorData = await authResponse.json().catch(() => ({}))
      console.log('❌ Backend authentication failed:', errorData)
    }
    
    // Test 2: Test frontend submission with real token
    console.log('\n2️⃣ Testing frontend submission with real JWT...')
    
    const submissionData = {
      deviceName: 'Test Industrial Robot',
      deviceType: 'Manufacturing Equipment',
      customDeviceType: 'Custom Robot Type',
      location: 'Test Factory, Test City',
      serialNumber: 'TEST-ROBOT-2024-001',
      manufacturer: 'TestCorp Industries',
      model: 'TestBot X1',
      yearOfManufacture: '2024',
      condition: 'Excellent',
      specifications: 'Advanced robotic arm with AI capabilities for manufacturing automation. Features include precision control, safety sensors, and integration with Industry 4.0 systems.',
      purchasePrice: '50000',
      currentValue: '45000',
      expectedRevenue: '100000',
      operationalCosts: '5000'
    }
    
    const response = await fetch(`${FRONTEND_BASE_URL}/api/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REAL_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    })
    
    console.log(`Frontend submission response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Frontend submission successful:', data)
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ Frontend submission failed:', errorData)
    }
    
    // Test 3: Test backend submission directly
    console.log('\n3️⃣ Testing backend submission directly...')
    
    const backendSubmissionResponse = await fetch(`${BACKEND_BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REAL_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    })
    
    console.log(`Backend submission response status: ${backendSubmissionResponse.status}`)
    
    if (backendSubmissionResponse.ok) {
      const data = await backendSubmissionResponse.json()
      console.log('✅ Backend submission successful:', data)
    } else {
      const errorData = await backendSubmissionResponse.json().catch(() => ({}))
      console.log('❌ Backend submission failed:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testSubmissionWithRealToken() 