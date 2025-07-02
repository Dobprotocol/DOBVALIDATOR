const axios = require('axios');

// Configuration
const BACKEND_URL = 'https://v.dobprotocol.com';
const TEST_WALLET = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN';

class DraftsTester {
  constructor() {
    this.userToken = null;
  }

  async run() {
    console.log('🧪 Testing Drafts Endpoint...\n');
    
    try {
      // Step 1: Authenticate to get a token
      await this.authenticate();
      
      // Step 2: Test GET drafts endpoint
      await this.testGetDrafts();
      
      // Step 3: Test POST drafts endpoint (create a draft)
      await this.testCreateDraft();
      
      // Step 4: Test GET drafts again to see the new draft
      await this.testGetDrafts();
      
      console.log('\n✅ All drafts tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error.response?.data || error.message);
    }
  }

  async authenticate() {
    console.log('🔐 Authenticating...');
    
    try {
      // Get challenge
      const challengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
        walletAddress: TEST_WALLET
      });
      
      // Verify signature (using test signature)
      const verifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
        walletAddress: TEST_WALLET,
        signature: 'test_signature_for_drafts_test',
        challenge: challengeResponse.data.challenge
      });
      
      this.userToken = verifyResponse.data.token;
      console.log('✅ Authentication successful');
      
    } catch (error) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw new Error('Authentication failed');
    }
  }

  async testGetDrafts() {
    console.log('\n📋 Testing GET /api/drafts...');
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/drafts`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });
      
      console.log('✅ GET drafts successful');
      console.log('📊 Response:', {
        success: response.data.success,
        draftsCount: response.data.drafts?.length || 0,
        total: response.data.total,
        hasMore: response.data.hasMore
      });
      
      if (response.data.drafts && response.data.drafts.length > 0) {
        console.log('📄 First draft:', {
          id: response.data.drafts[0].id,
          deviceName: response.data.drafts[0].deviceName,
          deviceType: response.data.drafts[0].deviceType,
          createdAt: response.data.drafts[0].createdAt
        });
      }
      
    } catch (error) {
      console.error('❌ GET drafts failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testCreateDraft() {
    console.log('\n📝 Testing POST /api/drafts (create draft)...');
    
    try {
      const draftData = {
        deviceName: 'Test Device for Drafts',
        deviceType: 'Test Type',
        location: 'Test Location',
        serialNumber: 'TEST-DRAFT-001',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        yearOfManufacture: '2024',
        condition: 'Excellent',
        specifications: 'Test specifications for draft',
        purchasePrice: '10000',
        currentValue: '9000',
        expectedRevenue: '20000',
        operationalCosts: '1000'
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/drafts`, draftData, {
        headers: { 
          Authorization: `Bearer ${this.userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Create draft successful');
      console.log('📄 Created draft:', {
        id: response.data.draft.id,
        deviceName: response.data.draft.deviceName,
        deviceType: response.data.draft.deviceType,
        createdAt: response.data.draft.createdAt
      });
      
    } catch (error) {
      console.error('❌ Create draft failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Run the test
async function main() {
  const tester = new DraftsTester();
  await tester.run();
}

main().catch(console.error); 