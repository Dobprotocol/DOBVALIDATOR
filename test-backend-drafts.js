const axios = require('axios');

// Configuration
const BACKEND_URL = 'https://v.dobprotocol.com'; // Production backend
const TEST_WALLET = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'; // Test wallet from logs

// Test data - only including fields that exist in the actual database
const testDraftData = {
  deviceName: 'Test Industrial Robot',
  deviceType: 'Manufacturing Equipment',
  serialNumber: 'TEST-ROBOT-2024-001',
  manufacturer: 'TestCorp Industries',
  model: 'TestBot X1',
  yearOfManufacture: '2024',
  condition: 'Excellent',
  specifications: 'Advanced robotic arm with AI capabilities for manufacturing automation.',
  purchasePrice: '50000',
  currentValue: '45000',
  expectedRevenue: '100000',
  operationalCosts: '5000'
};

let authToken = null;
let createdDraftId = null;

async function getAuthToken() {
  console.log('🔐 Getting authentication token...');
  
  try {
    // Step 1: Get challenge
    const challengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
      walletAddress: TEST_WALLET
    });
    
    if (!challengeResponse.data.success) {
      throw new Error('Failed to get challenge');
    }
    
    const challenge = challengeResponse.data.challenge;
    console.log('✅ Challenge received:', challenge.substring(0, 20) + '...');
    
    // Step 2: Verify signature (using a mock signature for testing)
    const verifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
      walletAddress: TEST_WALLET,
      signature: 'mock_signature_for_testing',
      challenge: challenge
    });
    
    if (!verifyResponse.data.success) {
      throw new Error('Failed to verify signature');
    }
    
    authToken = verifyResponse.data.token;
    console.log('✅ Authentication successful, token received');
    return authToken;
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetDrafts() {
  console.log('\n📋 Testing GET /api/drafts...');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/drafts`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 10,
        offset: 0
      }
    });
    
    console.log('✅ GET /api/drafts successful');
    console.log('📊 Response:', {
      success: response.data.success,
      total: response.data.total,
      hasMore: response.data.hasMore,
      draftsCount: response.data.drafts?.length || 0
    });
    
    if (response.data.drafts && response.data.drafts.length > 0) {
      console.log('📝 Sample draft:', {
        id: response.data.drafts[0].id,
        deviceName: response.data.drafts[0].deviceName,
        createdAt: response.data.drafts[0].createdAt
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ GET /api/drafts failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateDraft() {
  console.log('\n➕ Testing POST /api/drafts (create)...');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/drafts`, testDraftData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST /api/drafts successful');
    console.log('📝 Created draft:', {
      id: response.data.draft.id,
      deviceName: response.data.draft.deviceName,
      createdAt: response.data.draft.createdAt
    });
    
    createdDraftId = response.data.draft.id;
    return response.data;
  } catch (error) {
    console.error('❌ POST /api/drafts failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetDraftById() {
  if (!createdDraftId) {
    console.log('⚠️  Skipping GET /api/drafts/:id - no draft created');
    return;
  }
  
  console.log(`\n📄 Testing GET /api/drafts/${createdDraftId}...`);
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/drafts/${createdDraftId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ GET /api/drafts/:id successful');
    console.log('📝 Retrieved draft:', {
      id: response.data.draft.id,
      deviceName: response.data.draft.deviceName,
      updatedAt: response.data.draft.updatedAt
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ GET /api/drafts/:id failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testUpdateDraft() {
  if (!createdDraftId) {
    console.log('⚠️  Skipping PUT /api/drafts/:id - no draft created');
    return;
  }
  
  console.log(`\n✏️  Testing PUT /api/drafts/${createdDraftId}...`);
  
  const updateData = {
    ...testDraftData,
    deviceName: 'Updated Test Industrial Robot',
    specifications: 'Updated specifications for the test robot.'
  };
  
  try {
    const response = await axios.put(`${BACKEND_URL}/api/drafts/${createdDraftId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PUT /api/drafts/:id successful');
    console.log('📝 Updated draft:', {
      id: response.data.draft.id,
      deviceName: response.data.draft.deviceName,
      updatedAt: response.data.draft.updatedAt
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ PUT /api/drafts/:id failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDeleteDraft() {
  if (!createdDraftId) {
    console.log('⚠️  Skipping DELETE /api/drafts/:id - no draft created');
    return;
  }
  
  console.log(`\n🗑️  Testing DELETE /api/drafts/${createdDraftId}...`);
  
  try {
    const response = await axios.delete(`${BACKEND_URL}/api/drafts/${createdDraftId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ DELETE /api/drafts/:id successful');
    console.log('📝 Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ DELETE /api/drafts/:id failed:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting Backend Drafts API Tests');
  console.log('=====================================');
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  console.log(`👛 Test Wallet: ${TEST_WALLET}`);
  
  try {
    // Get authentication token
    await getAuthToken();
    
    // Test all endpoints
    await testGetDrafts();
    await testCreateDraft();
    await testGetDraftById();
    await testUpdateDraft();
    await testDeleteDraft();
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests(); 