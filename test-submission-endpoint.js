const fetch = require('node-fetch')

const FRONTEND_BASE_URL = 'http://localhost:3003'
const BACKEND_BASE_URL = 'https://v.dobprotocol.com'

// Test JWT token (replace with a real one for testing)
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0FCQzEyMzQ1Njc4OTBBIiwiZXhwIjoxNzM1MDQ4MDAwLCJpYXQiOjE3MzQ0NDMyMDB9.test'

async function testSubmissionEndpoint() {
  console.log('🧪 Testing submission endpoint...')
  
  try {
    // Test 1: Check if frontend submit endpoint exists
    console.log('\n1️⃣ Testing frontend /api/submit endpoint...')
    
    const response = await fetch(`${FRONTEND_BASE_URL}/api/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceName: 'Test Device',
        deviceType: 'Test Type',
        location: 'Test Location',
        serialNumber: 'TEST-001',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        yearOfManufacture: '2024',
        condition: 'Excellent',
        specifications: 'Test specifications',
        purchasePrice: '10000',
        currentValue: '9000',
        expectedRevenue: '20000',
        operationalCosts: '1000'
      })
    })
    
    console.log(`Frontend response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Frontend submit endpoint working:', data)
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ Frontend submit endpoint error:', errorData)
    }
    
    // Test 2: Check if backend submissions endpoint exists
    console.log('\n2️⃣ Testing backend /api/submissions endpoint...')
    
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/api/submissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_JWT}`
      }
    })
    
    console.log(`Backend response status: ${backendResponse.status}`)
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend submissions endpoint working:', data)
    } else {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.log('❌ Backend submissions endpoint error:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testSubmissionEndpoint() 