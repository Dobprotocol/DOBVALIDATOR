#!/usr/bin/env node

/**
 * Frontend Draft API Test Script
 * 
 * This script tests:
 * 1. Draft API endpoints (GET, POST, PUT, DELETE)
 * 2. Form data handling
 * 3. Error handling
 * 4. File size limits
 */

const http = require('http');
const https = require('https');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002', // Frontend dev server
  authToken: 'test-token-12345',
  testDraftId: 'test-draft-123'
};

// Mock test data
const testDraftData = {
  deviceName: 'Test Solar Panel',
  deviceType: 'solar-panel',
  location: 'Test Location',
  serialNumber: 'SN123456789',
  manufacturer: 'Test Manufacturer',
  model: 'Test Model 2024',
  yearOfManufacture: '2024',
  condition: 'New',
  specifications: 'High efficiency solar panel with advanced technology',
  purchasePrice: '5000',
  currentValue: '4800',
  expectedRevenue: '12000',
  operationalCosts: '2000'
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, options.hostname ? `https://${options.hostname}` : TEST_CONFIG.baseUrl);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
        ...options.headers
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testGetDrafts() {
  console.log('📥 Testing GET /api/drafts...');
  
  try {
    const response = await makeRequest({
      method: 'GET',
      path: '/api/drafts'
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.body);
    
    const success = response.status === 200 && response.body.success;
    console.log(`✅ GET drafts: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
  } catch (error) {
    console.error('❌ GET drafts failed:', error.message);
    return false;
  }
}

async function testPostDraft() {
  console.log('📤 Testing POST /api/drafts...');
  
  try {
    const response = await makeRequest({
      method: 'POST',
      path: '/api/drafts'
    }, testDraftData);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.body);
    
    const success = response.status === 201 && response.body.success;
    console.log(`✅ POST draft: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
  } catch (error) {
    console.error('❌ POST draft failed:', error.message);
    return false;
  }
}

async function testGetDraft() {
  console.log(`📖 Testing GET /api/drafts/${TEST_CONFIG.testDraftId}...`);
  
  try {
    const response = await makeRequest({
      method: 'GET',
      path: `/api/drafts/${TEST_CONFIG.testDraftId}`
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.body);
    
    const success = response.status === 200 && response.body.success;
    console.log(`✅ GET draft: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
  } catch (error) {
    console.error('❌ GET draft failed:', error.message);
    return false;
  }
}

async function testPutDraft() {
  console.log(`✏️ Testing PUT /api/drafts/${TEST_CONFIG.testDraftId}...`);
  
  try {
    const updatedData = { ...testDraftData, deviceName: 'Updated Test Solar Panel' };
    const response = await makeRequest({
      method: 'PUT',
      path: `/api/drafts/${TEST_CONFIG.testDraftId}`
    }, updatedData);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.body);
    
    const success = response.status === 200 && response.body.success;
    console.log(`✅ PUT draft: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
  } catch (error) {
    console.error('❌ PUT draft failed:', error.message);
    return false;
  }
}

async function testDeleteDraft() {
  console.log(`🗑️ Testing DELETE /api/drafts/${TEST_CONFIG.testDraftId}...`);
  
  try {
    const response = await makeRequest({
      method: 'DELETE',
      path: `/api/drafts/${TEST_CONFIG.testDraftId}`
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.body);
    
    const success = response.status === 200 && response.body.success;
    console.log(`✅ DELETE draft: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
  } catch (error) {
    console.error('❌ DELETE draft failed:', error.message);
    return false;
  }
}

async function testSubmitWithFiles() {
  console.log('📁 Testing POST /api/submit with files...');
  
  try {
    // Create a mock FormData-like structure
    const formData = {
      deviceName: 'Test Device with Files',
      deviceType: 'solar-panel',
      location: 'Test Location',
      serialNumber: 'SN123456789',
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
      yearOfManufacture: '2024',
      condition: 'New',
      specifications: 'Test specifications',
      purchasePrice: '5000',
      currentValue: '4800',
      expectedRevenue: '12000',
      operationalCosts: '2000',
      // Mock file data
      technicalCertification: { name: 'cert.pdf', size: 1024 * 1024 }, // 1MB
      purchaseProof: { name: 'proof.pdf', size: 2 * 1024 * 1024 }, // 2MB
      maintenanceRecords: { name: 'records.pdf', size: 3 * 1024 * 1024 }, // 3MB
      deviceImages: [
        { name: 'image1.jpg', size: 500 * 1024 }, // 500KB
        { name: 'image2.jpg', size: 600 * 1024 }  // 600KB
      ]
    };
    
    const response = await makeRequest({
      method: 'POST',
      path: '/api/submit',
      headers: {
        'Content-Type': 'application/json'
      }
    }, formData);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.body);
    
    const success = response.status === 200 && response.body.success;
    console.log(`✅ Submit with files: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
  } catch (error) {
    console.error('❌ Submit with files failed:', error.message);
    return false;
  }
}

async function testLargeFileSubmission() {
  console.log('📁 Testing POST /api/submit with large files...');
  
  try {
    // Create a mock FormData with files that exceed limits
    const largeFormData = {
      deviceName: 'Test Device with Large Files',
      deviceType: 'solar-panel',
      location: 'Test Location',
      serialNumber: 'SN123456789',
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
      yearOfManufacture: '2024',
      condition: 'New',
      specifications: 'Test specifications',
      purchasePrice: '5000',
      currentValue: '4800',
      expectedRevenue: '12000',
      operationalCosts: '2000',
      // Mock large file data that should trigger 413
      technicalCertification: { name: 'large-cert.pdf', size: 15 * 1024 * 1024 }, // 15MB (exceeds 10MB limit)
      purchaseProof: { name: 'large-proof.pdf', size: 20 * 1024 * 1024 }, // 20MB (exceeds 10MB limit)
      maintenanceRecords: { name: 'large-records.pdf', size: 25 * 1024 * 1024 }, // 25MB (exceeds 10MB limit)
      deviceImages: [
        { name: 'large-image1.jpg', size: 8 * 1024 * 1024 }, // 8MB
        { name: 'large-image2.jpg', size: 9 * 1024 * 1024 }  // 9MB
      ]
    };
    
    const response = await makeRequest({
      method: 'POST',
      path: '/api/submit',
      headers: {
        'Content-Type': 'application/json'
      }
    }, largeFormData);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.body);
    
    // This should return 413 (Payload Too Large)
    const success = response.status === 413;
    console.log(`✅ Large file rejection: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
  } catch (error) {
    console.error('❌ Large file test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runFrontendTests() {
  console.log('🚀 Starting Frontend Draft API Tests...\n');
  
  const results = {
    getDrafts: await testGetDrafts(),
    postDraft: await testPostDraft(),
    getDraft: await testGetDraft(),
    putDraft: await testPutDraft(),
    deleteDraft: await testDeleteDraft(),
    submitWithFiles: await testSubmitWithFiles(),
    largeFileRejection: await testLargeFileSubmission()
  };
  
  console.log('\n📊 Frontend Test Results:');
  console.log(`✅ GET /api/drafts: ${results.getDrafts ? 'PASS' : 'FAIL'}`);
  console.log(`✅ POST /api/drafts: ${results.postDraft ? 'PASS' : 'FAIL'}`);
  console.log(`✅ GET /api/drafts/[id]: ${results.getDraft ? 'PASS' : 'FAIL'}`);
  console.log(`✅ PUT /api/drafts/[id]: ${results.putDraft ? 'PASS' : 'FAIL'}`);
  console.log(`✅ DELETE /api/drafts/[id]: ${results.deleteDraft ? 'PASS' : 'FAIL'}`);
  console.log(`✅ POST /api/submit with files: ${results.submitWithFiles ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Large file rejection (413): ${results.largeFileRejection ? 'PASS' : 'FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\n🔧 Issues detected:');
    if (!results.getDrafts) console.log('- GET drafts endpoint has issues');
    if (!results.postDraft) console.log('- POST draft endpoint has issues');
    if (!results.getDraft) console.log('- GET individual draft endpoint has issues');
    if (!results.putDraft) console.log('- PUT draft endpoint has issues');
    if (!results.deleteDraft) console.log('- DELETE draft endpoint has issues');
    if (!results.submitWithFiles) console.log('- Submit with files has issues');
    if (!results.largeFileRejection) console.log('- Large file rejection not working properly');
  }
  
  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runFrontendTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Frontend test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runFrontendTests }; 