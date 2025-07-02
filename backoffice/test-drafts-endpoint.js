#!/usr/bin/env node

/**
 * Test script for drafts endpoint
 * This script tests the drafts API endpoint with JWT authentication
 */

// For local dev only:
const API_BASE = process.env.NODE_ENV === 'production' ? 'https://v.dobprotocol.com/api' : 'http://localhost:3000/api';

// Test configuration
const TEST_CONFIG = {
  adminWallet: 'GAAKZ5PTQ7YLHTWQJQWEPAFOHEYFADEPB4DCBE4JWT63JCYJTCGULCAC',
  testDraftId: 'draft_1234567890_test123'
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

// Get JWT token from localStorage (simulated)
function getJWTToken() {
  // For testing, we'll use a mock token or try to get from localStorage
  const mockToken = 'mock_jwt_token_for_testing'
  
  // In a real scenario, you'd get this from localStorage or environment
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('stellarAccessToken') || 
                  localStorage.getItem('dev_fallback_token_') ||
                  mockToken
    return token
  }
  
  return mockToken
}

// Test 1: Test drafts endpoint GET (list drafts)
async function testDraftsGet() {
  logInfo('Testing drafts GET endpoint...')
  
  try {
    const token = getJWTToken()
    const response = await fetch(`${API_BASE}/drafts`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    logInfo(`Response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      logSuccess('Drafts GET endpoint working')
      logInfo(`Found ${data.data?.length || 0} drafts`)
      logInfo(`Response structure: ${JSON.stringify(data, null, 2)}`)
      return true
    } else if (response.status === 401) {
      logWarning('Drafts endpoint requires authentication (expected)')
      return true
    } else {
      logError(`Drafts GET failed with status: ${response.status}`)
      const errorText = await response.text()
      logError(`Error response: ${errorText}`)
      return false
    }
  } catch (error) {
    logError(`Drafts GET test failed: ${error.message}`)
    return false
  }
}

// Test 2: Test drafts endpoint POST (create draft)
async function testDraftsCreate() {
  logInfo('Testing drafts POST endpoint (create draft)...')
  
  try {
    const token = getJWTToken()
    const draftData = {
      action: 'createDraft',
      deviceName: 'Test Device',
      deviceType: 'mining_rig',
      location: 'Test Location',
      serialNumber: 'TEST123456',
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
      yearOfManufacture: '2023',
      condition: 'excellent',
      specifications: 'Test specifications',
      purchasePrice: '1000',
      currentValue: '1200',
      expectedRevenue: '500',
      operationalCosts: '100',
      userId: 'test_user_123'
    }
    
    const response = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(draftData)
    })
    
    logInfo(`Response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      logSuccess('Draft creation successful')
      logInfo(`Created draft with ID: ${data.data?.id}`)
      logInfo(`Response structure: ${JSON.stringify(data, null, 2)}`)
      return data.data?.id
    } else {
      logError(`Draft creation failed with status: ${response.status}`)
      const errorText = await response.text()
      logError(`Error response: ${errorText}`)
      return null
    }
  } catch (error) {
    logError(`Draft creation test failed: ${error.message}`)
    return null
  }
}

// Test 3: Test drafts endpoint POST (update draft)
async function testDraftsUpdate(draftId) {
  logInfo('Testing drafts POST endpoint (update draft)...')
  
  try {
    const token = getJWTToken()
    const updateData = {
      action: 'updateDraft',
      draftId: draftId || TEST_CONFIG.testDraftId,
      deviceName: 'Updated Test Device',
      specifications: 'Updated specifications'
    }
    
    const response = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    })
    
    logInfo(`Response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      logSuccess('Draft update successful')
      logInfo(`Updated draft: ${data.data?.id}`)
      logInfo(`Response structure: ${JSON.stringify(data, null, 2)}`)
      return true
    } else {
      logError(`Draft update failed with status: ${response.status}`)
      const errorText = await response.text()
      logError(`Error response: ${errorText}`)
      return false
    }
  } catch (error) {
    logError(`Draft update test failed: ${error.message}`)
    return false
  }
}

// Test 4: Test drafts endpoint POST (submit draft)
async function testDraftsSubmit(draftId) {
  logInfo('Testing drafts POST endpoint (submit draft)...')
  
  try {
    const token = getJWTToken()
    const submitData = {
      action: 'submitDraft',
      draftId: draftId || TEST_CONFIG.testDraftId
    }
    
    const response = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(submitData)
    })
    
    logInfo(`Response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      logSuccess('Draft submission successful')
      logInfo(`Submitted draft: ${data.data?.id}`)
      logInfo(`Response structure: ${JSON.stringify(data, null, 2)}`)
      return true
    } else {
      logError(`Draft submission failed with status: ${response.status}`)
      const errorText = await response.text()
      logError(`Error response: ${errorText}`)
      return false
    }
  } catch (error) {
    logError(`Draft submission test failed: ${error.message}`)
    return false
  }
}

// Test 5: Test drafts endpoint POST (delete draft)
async function testDraftsDelete(draftId) {
  logInfo('Testing drafts POST endpoint (delete draft)...')
  
  try {
    const token = getJWTToken()
    const deleteData = {
      action: 'deleteDraft',
      draftId: draftId || TEST_CONFIG.testDraftId
    }
    
    const response = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(deleteData)
    })
    
    logInfo(`Response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      logSuccess('Draft deletion successful')
      logInfo(`Response structure: ${JSON.stringify(data, null, 2)}`)
      return true
    } else {
      logError(`Draft deletion failed with status: ${response.status}`)
      const errorText = await response.text()
      logError(`Error response: ${errorText}`)
      return false
    }
  } catch (error) {
    logError(`Draft deletion test failed: ${error.message}`)
    return false
  }
}

// Test 6: Test drafts endpoint with query parameters
async function testDraftsWithParams() {
  logInfo('Testing drafts GET endpoint with query parameters...')
  
  try {
    const token = getJWTToken()
    const response = await fetch(`${API_BASE}/drafts?limit=5&offset=0&userId=test_user`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    logInfo(`Response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      logSuccess('Drafts GET with params working')
      logInfo(`Pagination info: ${JSON.stringify(data.pagination, null, 2)}`)
      return true
    } else {
      logError(`Drafts GET with params failed with status: ${response.status}`)
      return false
    }
  } catch (error) {
    logError(`Drafts GET with params test failed: ${error.message}`)
    return false
  }
}

// Main test runner
async function runDraftsTests() {
  log('🚀 Starting Drafts Endpoint Tests', 'bright')
  log('=====================================', 'bright')
  
  const results = {
    get: false,
    create: false,
    update: false,
    submit: false,
    delete: false,
    withParams: false
  }
  
  // Test 1: GET drafts
  results.get = await testDraftsGet()
  
  // Test 2: CREATE draft
  const createdDraftId = await testDraftsCreate()
  results.create = !!createdDraftId
  
  // Test 3: UPDATE draft
  if (createdDraftId) {
    results.update = await testDraftsUpdate(createdDraftId)
  }
  
  // Test 4: SUBMIT draft
  if (createdDraftId) {
    results.submit = await testDraftsSubmit(createdDraftId)
  }
  
  // Test 5: DELETE draft
  if (createdDraftId) {
    results.delete = await testDraftsDelete(createdDraftId)
  }
  
  // Test 6: GET with params
  results.withParams = await testDraftsWithParams()
  
  // Summary
  log('\n📊 Test Results Summary', 'bright')
  log('========================', 'bright')
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test.toUpperCase()}: PASSED`)
    } else {
      logError(`${test.toUpperCase()}: FAILED`)
    }
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow')
  
  if (passedTests === totalTests) {
    logSuccess('All drafts endpoint tests passed! 🎉')
  } else {
    logWarning('Some tests failed. Check the logs above for details.')
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runDraftsTests().catch(error => {
    logError(`Test runner failed: ${error.message}`)
    process.exit(1)
  })
}

module.exports = {
  runDraftsTests,
  testDraftsGet,
  testDraftsCreate,
  testDraftsUpdate,
  testDraftsSubmit,
  testDraftsDelete,
  testDraftsWithParams
} 