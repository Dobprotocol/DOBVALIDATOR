#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost';
const FRONTEND_URL = `${BASE_URL}`;
const BACKOFFICE_URL = `${BASE_URL}/admin`;
const BACKEND_URL = `${BASE_URL}/api`;
const HEALTH_URL = `${BASE_URL}/health`;

// Test data
const testUser = {
  publicKey: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
  challenge: null,
  signature: null
};

const testFormData = {
  deviceName: 'Test Device',
  deviceType: 'SMARTPHONE',
  manufacturer: 'Test Manufacturer',
  model: 'Test Model',
  serialNumber: 'TEST123456',
  purchaseDate: '2024-01-01',
  purchasePrice: 999.99,
  technicalSpecs: {
    processor: 'Test CPU',
    memory: '8GB',
    storage: '256GB'
  },
  financialInfo: {
    purchaseMethod: 'CREDIT_CARD',
    paymentPlan: 'FULL_PAYMENT',
    insurance: false
  }
};

class ProductionTestSuite {
  constructor() {
    this.testResults = [];
    this.sessionToken = null;
    this.draftId = null;
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async test(testName, testFunction) {
    try {
      this.log(`Starting test: ${testName}`);
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASSED' });
      this.log(`✅ Test passed: ${testName}`, 'SUCCESS');
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`❌ Test failed: ${testName} - ${error.message}`, 'ERROR');
    }
  }

  // Test 1: Backend Health Check
  async testBackendHealth() {
    const response = await axios.get(HEALTH_URL);
    if (response.status !== 200) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    this.log(`Backend health check response: ${JSON.stringify(response.data)}`);
  }

  // Test 2: Frontend Accessibility
  async testFrontendAccess() {
    const response = await axios.get(FRONTEND_URL);
    if (response.status !== 200) {
      throw new Error(`Frontend access failed with status ${response.status}`);
    }
    this.log('Frontend is accessible');
  }

  // Test 3: Backoffice Accessibility
  async testBackofficeAccess() {
    const response = await axios.get(BACKOFFICE_URL);
    if (response.status !== 200) {
      throw new Error(`Backoffice access failed with status ${response.status}`);
    }
    this.log('Backoffice is accessible');
  }

  // Test 4: Authentication Challenge
  async testAuthenticationChallenge() {
    const response = await axios.post(`${BACKEND_URL}/auth/challenge`, {
      publicKey: testUser.publicKey
    });
    
    if (response.status !== 200 || !response.data.challenge) {
      throw new Error('Failed to get authentication challenge');
    }
    
    testUser.challenge = response.data.challenge;
    this.log(`Authentication challenge received: ${testUser.challenge}`);
  }

  // Test 5: Authentication Verification (Mock)
  async testAuthenticationVerification() {
    // In a real scenario, this would be signed by the Stellar wallet
    // For testing, we'll create a mock signature
    const mockSignature = crypto.randomBytes(64).toString('hex');
    
    const response = await axios.post(`${BACKEND_URL}/auth/verify`, {
      publicKey: testUser.publicKey,
      challenge: testUser.challenge,
      signature: mockSignature
    });
    
    if (response.status !== 200 || !response.data.token) {
      throw new Error('Failed to verify authentication');
    }
    
    this.sessionToken = response.data.token;
    this.log('Authentication verification successful');
  }

  // Test 6: Create Draft
  async testCreateDraft() {
    if (!this.sessionToken) {
      throw new Error('No session token available');
    }

    const response = await axios.post(`${BACKEND_URL}/drafts`, testFormData, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 201 || !response.data.id) {
      throw new Error('Failed to create draft');
    }

    this.draftId = response.data.id;
    this.log(`Draft created with ID: ${this.draftId}`);
  }

  // Test 7: Update Draft
  async testUpdateDraft() {
    if (!this.sessionToken || !this.draftId) {
      throw new Error('No session token or draft ID available');
    }

    const updatedData = {
      ...testFormData,
      deviceName: 'Updated Test Device'
    };

    const response = await axios.put(`${BACKEND_URL}/drafts/${this.draftId}`, updatedData, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to update draft');
    }

    this.log('Draft updated successfully');
  }

  // Test 8: Get Draft
  async testGetDraft() {
    if (!this.sessionToken || !this.draftId) {
      throw new Error('No session token or draft ID available');
    }

    const response = await axios.get(`${BACKEND_URL}/drafts/${this.draftId}`, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to get draft');
    }

    this.log('Draft retrieved successfully');
  }

  // Test 9: Submit Form
  async testSubmitForm() {
    if (!this.sessionToken || !this.draftId) {
      throw new Error('No session token or draft ID available');
    }

    const response = await axios.post(`${BACKEND_URL}/submit`, {
      draftId: this.draftId
    }, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 201) {
      throw new Error('Failed to submit form');
    }

    this.log('Form submitted successfully');
  }

  // Test 10: Get Submissions (Backoffice)
  async testGetSubmissions() {
    if (!this.sessionToken) {
      throw new Error('No session token available');
    }

    const response = await axios.get(`${BACKEND_URL}/submissions`, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to get submissions');
    }

    this.log(`Retrieved ${response.data.length} submissions`);
  }

  // Test 11: Delete Draft
  async testDeleteDraft() {
    if (!this.sessionToken || !this.draftId) {
      throw new Error('No session token or draft ID available');
    }

    const response = await axios.delete(`${BACKEND_URL}/drafts/${this.draftId}`, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to delete draft');
    }

    this.log('Draft deleted successfully');
  }

  // Test 12: Profile Management
  async testProfileManagement() {
    if (!this.sessionToken) {
      throw new Error('No session token available');
    }

    const profileData = {
      name: 'Test User',
      email: 'test@example.com',
      organization: 'Test Organization'
    };

    // Create profile
    const createResponse = await axios.post(`${BACKEND_URL}/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (createResponse.status !== 201) {
      throw new Error('Failed to create profile');
    }

    // Get profile
    const getResponse = await axios.get(`${BACKEND_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`
      }
    });

    if (getResponse.status !== 200) {
      throw new Error('Failed to get profile');
    }

    this.log('Profile management successful');
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting Production Test Suite', 'HEADER');
    this.log(`Testing against: ${BASE_URL}`, 'INFO');

    await this.test('Backend Health Check', () => this.testBackendHealth());
    await this.test('Frontend Accessibility', () => this.testFrontendAccess());
    await this.test('Backoffice Accessibility', () => this.testBackofficeAccess());
    await this.test('Authentication Challenge', () => this.testAuthenticationChallenge());
    await this.test('Authentication Verification', () => this.testAuthenticationVerification());
    await this.test('Create Draft', () => this.testCreateDraft());
    await this.test('Update Draft', () => this.testUpdateDraft());
    await this.test('Get Draft', () => this.testGetDraft());
    await this.test('Submit Form', () => this.testSubmitForm());
    await this.test('Get Submissions', () => this.testGetSubmissions());
    await this.test('Delete Draft', () => this.testDeleteDraft());
    await this.test('Profile Management', () => this.testProfileManagement());

    this.printResults();
  }

  printResults() {
    this.log('\n📊 Test Results Summary', 'HEADER');
    this.log('=' * 50, 'INFO');
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    this.log(`Total Tests: ${total}`, 'INFO');
    this.log(`Passed: ${passed}`, 'SUCCESS');
    this.log(`Failed: ${failed}`, failed > 0 ? 'ERROR' : 'INFO');

    if (failed > 0) {
      this.log('\n❌ Failed Tests:', 'ERROR');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => this.log(`  - ${r.name}: ${r.error}`, 'ERROR'));
    }

    if (passed === total) {
      this.log('\n🎉 All tests passed! Production setup is ready!', 'SUCCESS');
    } else {
      this.log('\n⚠️  Some tests failed. Please review the issues above.', 'WARNING');
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new ProductionTestSuite();
  await testSuite.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProductionTestSuite; 