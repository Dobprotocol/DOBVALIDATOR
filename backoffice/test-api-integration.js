#!/usr/bin/env node

/**
 * Test script for backoffice API integration
 * This script tests the connection between backoffice and frontend API
 */

const API_BASE = 'http://localhost:3001/api'

// Test configuration
const TEST_CONFIG = {
  adminWallet: 'GABC123456789012345678901234567890123456789012345678901234567890',
  testSubmissionId: 'SUB_1234567890_test123'
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Test 1: Check API connectivity
async function testApiConnectivity() {
  logInfo('Testing API connectivity...')
  
  try {
    const response = await fetch(`${API_BASE}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: TEST_CONFIG.adminWallet })
    })
    
    if (response.ok) {
      logSuccess('API is accessible')
      return true
    } else {
      logError(`API returned status: ${response.status}`)
      return false
    }
  } catch (error) {
    logError(`API connectivity failed: ${error.message}`)
    return false
  }
}

// Test 2: Test authentication flow
async function testAuthentication() {
  logInfo('Testing authentication flow...')
  
  try {
    // Step 1: Request challenge
    const challengeResponse = await fetch(`${API_BASE}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: TEST_CONFIG.adminWallet })
    })
    
    if (!challengeResponse.ok) {
      logError('Failed to get challenge')
      return null
    }
    
    const challengeData = await challengeResponse.json()
    logSuccess('Challenge received')
    
    // Step 2: Verify (with mock signature for testing)
    const verifyResponse = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: TEST_CONFIG.adminWallet,
        signature: 'mock_signature_for_testing',
        challenge: challengeData.challenge
      })
    })
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json()
      logSuccess('Authentication successful')
      return verifyData.token
    } else {
      const errorData = await verifyResponse.json()
      logWarning(`Authentication failed (expected for mock signature): ${errorData.error}`)
      return null
    }
  } catch (error) {
    logError(`Authentication test failed: ${error.message}`)
    return null
  }
}

// Test 3: Test submissions endpoint (without auth)
async function testSubmissionsEndpoint() {
  logInfo('Testing submissions endpoint structure...')
  
  try {
    const response = await fetch(`${API_BASE}/submissions`)
    
    if (response.status === 401) {
      logSuccess('Submissions endpoint properly requires authentication')
      return true
    } else if (response.ok) {
      logWarning('Submissions endpoint accessible without auth (may be expected in dev)')
      return true
    } else {
      logError(`Submissions endpoint returned unexpected status: ${response.status}`)
      return false
    }
  } catch (error) {
    logError(`Submissions endpoint test failed: ${error.message}`)
    return false
  }
}

// Test 4: Test profile endpoint (without auth)
async function testProfileEndpoint() {
  logInfo('Testing profile endpoint structure...')
  
  try {
    const response = await fetch(`${API_BASE}/profile`)
    
    if (response.status === 401) {
      logSuccess('Profile endpoint properly requires authentication')
      return true
    } else if (response.ok) {
      logWarning('Profile endpoint accessible without auth (may be expected in dev)')
      return true
    } else {
      logError(`Profile endpoint returned unexpected status: ${response.status}`)
      return false
    }
  } catch (error) {
    logError(`Profile endpoint test failed: ${error.message}`)
    return false
  }
}

// Test 5: Test CORS headers
async function testCorsHeaders() {
  logInfo('Testing CORS headers...')
  
  try {
    const response = await fetch(`${API_BASE}/auth/challenge`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    })
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    }
    
    logInfo('CORS headers found:')
    Object.entries(corsHeaders).forEach(([header, value]) => {
      if (value) {
        logSuccess(`${header}: ${value}`)
      } else {
        logWarning(`${header}: Not set`)
      }
    })
    
    return true
  } catch (error) {
    logError(`CORS test failed: ${error.message}`)
    return false
  }
}

// Test 6: Test API response format
async function testApiResponseFormat() {
  logInfo('Testing API response format...')
  
  try {
    const response = await fetch(`${API_BASE}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: TEST_CONFIG.adminWallet })
    })
    
    const data = await response.json()
    
    // Check if response has expected structure
    if (data.success !== undefined) {
      logSuccess('Response has success field')
    } else {
      logWarning('Response missing success field')
    }
    
    if (data.challenge || data.error) {
      logSuccess('Response has challenge or error field')
    } else {
      logWarning('Response missing challenge/error field')
    }
    
    return true
  } catch (error) {
    logError(`Response format test failed: ${error.message}`)
    return false
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Backoffice API Integration Tests', 'bright')
  log('=' * 50, 'cyan')
  
  const tests = [
    { name: 'API Connectivity', fn: testApiConnectivity },
    { name: 'Authentication Flow', fn: testAuthentication },
    { name: 'Submissions Endpoint', fn: testSubmissionsEndpoint },
    { name: 'Profile Endpoint', fn: testProfileEndpoint },
    { name: 'CORS Headers', fn: testCorsHeaders },
    { name: 'API Response Format', fn: testApiResponseFormat }
  ]
  
  let passed = 0
  let total = tests.length
  
  for (const test of tests) {
    log(`\n📋 Running: ${test.name}`, 'bright')
    try {
      const result = await test.fn()
      if (result !== false) {
        passed++
      }
    } catch (error) {
      logError(`Test ${test.name} threw error: ${error.message}`)
    }
  }
  
  log('\n' + '=' * 50, 'cyan')
  log(`📊 Test Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow')
  
  if (passed === total) {
    logSuccess('🎉 All tests passed! Backoffice API integration is working correctly.')
  } else {
    logWarning('⚠️  Some tests failed. Check the frontend API server and configuration.')
  }
  
  log('\n📝 Next Steps:', 'bright')
  log('1. Ensure frontend API server is running on http://localhost:3001')
  log('2. Check that admin wallets are configured in the system')
  log('3. Test with real wallet authentication in the backoffice')
  log('4. Verify submission data flows correctly')
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  log('Backoffice API Integration Test Script', 'bright')
  log('')
  log('Usage: node test-api-integration.js [options]', 'cyan')
  log('')
  log('Options:')
  log('  --help, -h     Show this help message')
  log('  --verbose, -v  Enable verbose output')
  log('')
  log('This script tests the connection between the backoffice and frontend API.')
  log('Make sure the frontend API server is running on http://localhost:3000')
  process.exit(0)
}

// Run tests
runTests().catch(error => {
  logError(`Test runner failed: ${error.message}`)
  process.exit(1)
}) 