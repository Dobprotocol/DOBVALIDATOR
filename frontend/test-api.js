// Simple API testing script for DOB Validator
// Run this in the browser console or use curl commands

const API_BASE = 'http://localhost:3000/api'

// Test 1: Request authentication challenge
async function testChallenge() {
  console.log('🔐 Testing authentication challenge...')
  
  const response = await fetch(`${API_BASE}/auth/challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress: 'GABC123456789012345678901234567890123456789012345678901234567890'
    })
  })
  
  const data = await response.json()
  console.log('Challenge response:', data)
  return data
}

// Test 2: Verify signature (mock)
async function testVerify(walletAddress, signature, challenge) {
  console.log('✅ Testing signature verification...')
  
  const response = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      signature,
      challenge
    })
  })
  
  const data = await response.json()
  console.log('Verification response:', data)
  return data
}

// Test 3: Create profile (requires authentication)
async function testCreateProfile(token) {
  console.log('👤 Testing profile creation...')
  
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'John Doe',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      phone: '+1234567890',
      website: 'https://techcorp.com',
      bio: 'Technology enthusiast'
    })
  })
  
  const data = await response.json()
  console.log('Profile creation response:', data)
  return data
}

// Test 4: Get profile (requires authentication)
async function testGetProfile(token) {
  console.log('📋 Testing profile retrieval...')
  
  const response = await fetch(`${API_BASE}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const data = await response.json()
  console.log('Profile retrieval response:', data)
  return data
}

// Test 5: Create submission (requires authentication)
async function testCreateSubmission(token) {
  console.log('📝 Testing submission creation...')
  
  const response = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      deviceName: 'Industrial Robot X1',
      deviceType: 'Manufacturing Equipment',
      serialNumber: 'ROB-X1-2024-001',
      manufacturer: 'TechCorp Industries',
      model: 'X1 Pro',
      yearOfManufacture: '2024',
      condition: 'Excellent',
      specifications: 'Advanced robotic arm with AI capabilities for manufacturing automation',
      purchasePrice: '50000',
      currentValue: '45000',
      expectedRevenue: '100000',
      operationalCosts: '5000'
    })
  })
  
  const data = await response.json()
  console.log('Submission creation response:', data)
  return data
}

// Test 6: Get submissions (requires authentication)
async function testGetSubmissions(token) {
  console.log('📊 Testing submissions retrieval...')
  
  const response = await fetch(`${API_BASE}/submissions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const data = await response.json()
  console.log('Submissions retrieval response:', data)
  return data
}

// Test 7: Generate certificate (requires authentication)
async function testGenerateCertificate(token, deviceId) {
  console.log('🏆 Testing certificate generation...')
  
  const response = await fetch(`${API_BASE}/certificates/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      deviceId,
      deviceName: 'Industrial Robot X1',
      operatorName: 'John Doe',
      validationDate: '2024-01-01',
      certificateType: 'comprehensive',
      metadata: {
        validationScore: 95,
        inspector: 'Admin User'
      }
    })
  })
  
  const data = await response.json()
  console.log('Certificate generation response:', data)
  return data
}

// Test 8: Verify certificate (public endpoint)
async function testVerifyCertificate(certificateId) {
  console.log('🔍 Testing certificate verification...')
  
  const response = await fetch(`${API_BASE}/certificates/${certificateId}/verify`)
  
  const data = await response.json()
  console.log('Certificate verification response:', data)
  return data
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API tests...')
  
  try {
    // Test 1: Get challenge
    const challengeData = await testChallenge()
    
    // Test 2: Verify signature (using mock data)
    const verifyData = await testVerify(
      'GABC123456789012345678901234567890123456789012345678901234567890',
      'mock_signature_here',
      challengeData.challenge
    )
    
    if (verifyData.token) {
      const token = verifyData.token
      
      // Test 3: Create profile
      await testCreateProfile(token)
      
      // Test 4: Get profile
      await testGetProfile(token)
      
      // Test 5: Create submission
      const submissionData = await testCreateSubmission(token)
      
      // Test 6: Get submissions
      await testGetSubmissions(token)
      
      // Test 7: Generate certificate
      if (submissionData.submission?.id) {
        const certificateData = await testGenerateCertificate(token, submissionData.submission.id)
        
        // Test 8: Verify certificate
        if (certificateData.certificate?.id) {
          await testVerifyCertificate(certificateData.certificate.id)
        }
      }
    }
    
    console.log('✅ All tests completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export functions for manual testing
window.testAPI = {
  testChallenge,
  testVerify,
  testCreateProfile,
  testGetProfile,
  testCreateSubmission,
  testGetSubmissions,
  testGenerateCertificate,
  testVerifyCertificate,
  runAllTests
}

console.log('🧪 API test functions loaded! Use testAPI.runAllTests() to run all tests.') 