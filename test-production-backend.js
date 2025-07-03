#!/usr/bin/env node

/**
 * Production Backend Test Script
 * Tests the deployed backend at v.dobprotocol.com
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://v.dobprotocol.com';
const TEST_ENDPOINTS = [
  '/health',
  '/ping',
  '/api/health',
  '/api/ping'
];

// Helper function to make HTTP/HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            error: 'Failed to parse JSON'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test function
async function testProductionBackend() {
  console.log('🚀 Testing Production Backend at:', PRODUCTION_URL);
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    const url = `${PRODUCTION_URL}${endpoint}`;
    console.log(`\n🔍 Testing: ${endpoint}`);
    
    try {
      const result = await makeRequest(url);
      results.push({
        endpoint,
        url,
        success: true,
        status: result.status,
        data: result.data
      });
      
      console.log(`✅ Status: ${result.status}`);
      console.log(`📄 Response:`, JSON.stringify(result.data, null, 2));
      
    } catch (error) {
      results.push({
        endpoint,
        url,
        success: false,
        error: error.message
      });
      
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL ENDPOINTS:');
    successful.forEach(result => {
      console.log(`  - ${result.endpoint} (${result.status})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    failed.forEach(result => {
      console.log(`  - ${result.endpoint}: ${result.error}`);
    });
  }
  
  // Overall status
  if (failed.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Production backend is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please check the production deployment.');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testProductionBackend().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testProductionBackend }; 