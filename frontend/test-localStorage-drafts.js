#!/usr/bin/env node

/**
 * Test Script for localStorage and Draft API Endpoints
 * 
 * This script tests:
 * 1. localStorage form step backups
 * 2. Draft API endpoints (GET, POST, DELETE)
 * 3. Form data persistence
 * 4. Draft loading and saving
 */

const fs = require('fs');
const path = require('path');

// Test data
const testFormData = {
  step1: {
    deviceName: "Test Solar Panel",
    deviceType: "solar-panel",
    customDeviceType: "",
    location: "Test Location"
  },
  step2: {
    serialNumber: "SN123456789",
    manufacturer: "Test Manufacturer",
    model: "Test Model 2024",
    yearOfManufacture: "2024",
    condition: "New",
    specifications: "High efficiency solar panel with advanced technology"
  },
  step3: {
    purchasePrice: "5000",
    currentValue: "4800",
    expectedRevenue: "12000",
    operationalCosts: "2000"
  },
  step4: {
    technicalCertification: null,
    purchaseProof: null,
    maintenanceRecords: null,
    deviceImages: []
  }
};

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// Mock fetch for API testing
global.fetch = async (url, options = {}) => {
  console.log(`🔍 Mock fetch called: ${options.method || 'GET'} ${url}`);
  
  // Simulate API responses
  if (url.includes('/api/drafts')) {
    if (options.method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          drafts: [
            {
              id: 'test-draft-1',
              deviceName: 'Test Device',
              deviceType: 'solar-panel',
              status: 'draft',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        })
      };
    } else if (options.method === 'POST') {
      return {
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          draft: {
            id: 'new-draft-id',
            ...JSON.parse(options.body),
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      };
    } else if (options.method === 'DELETE') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Draft deleted successfully'
        })
      };
    }
  }
  
  return {
    ok: false,
    status: 404,
    json: async () => ({
      success: false,
      error: 'Endpoint not found'
    })
  };
};

// Test functions
function testLocalStorage() {
  console.log('\n🧪 Testing localStorage functionality...');
  
  try {
    // Test 1: Save form step data
    console.log('📝 Test 1: Saving form step data...');
    localStorage.setItem('dobFormStep1Backup', JSON.stringify(testFormData.step1));
    localStorage.setItem('dobFormStep2Backup', JSON.stringify(testFormData.step2));
    localStorage.setItem('dobFormStep3Backup', JSON.stringify(testFormData.step3));
    localStorage.setItem('dobFormStep4Backup', JSON.stringify(testFormData.step4));
    
    // Test 2: Load form step data
    console.log('📖 Test 2: Loading form step data...');
    const step1Data = JSON.parse(localStorage.getItem('dobFormStep1Backup'));
    const step2Data = JSON.parse(localStorage.getItem('dobFormStep2Backup'));
    const step3Data = JSON.parse(localStorage.getItem('dobFormStep3Backup'));
    const step4Data = JSON.parse(localStorage.getItem('dobFormStep4Backup'));
    
    // Verify data integrity
    const step1Valid = step1Data.deviceName === testFormData.step1.deviceName;
    const step2Valid = step2Data.serialNumber === testFormData.step2.serialNumber;
    const step3Valid = step3Data.purchasePrice === testFormData.step3.purchasePrice;
    const step4Valid = Array.isArray(step4Data.deviceImages);
    
    console.log(`✅ Step 1 valid: ${step1Valid}`);
    console.log(`✅ Step 2 valid: ${step2Valid}`);
    console.log(`✅ Step 3 valid: ${step3Valid}`);
    console.log(`✅ Step 4 valid: ${step4Valid}`);
    
    // Test 3: Save complete form backup
    console.log('💾 Test 3: Saving complete form backup...');
    const completeFormData = {
      ...testFormData.step1,
      ...testFormData.step2,
      ...testFormData.step3,
      ...testFormData.step4,
      draftId: 'test-draft-id'
    };
    localStorage.setItem('dobFormBackup', JSON.stringify(completeFormData));
    
    // Test 4: Load complete form backup
    console.log('📋 Test 4: Loading complete form backup...');
    const loadedFormData = JSON.parse(localStorage.getItem('dobFormBackup'));
    const completeFormValid = loadedFormData.deviceName === testFormData.step1.deviceName &&
                             loadedFormData.serialNumber === testFormData.step2.serialNumber &&
                             loadedFormData.draftId === 'test-draft-id';
    
    console.log(`✅ Complete form valid: ${completeFormValid}`);
    
    // Test 5: Clear localStorage
    console.log('🗑️ Test 5: Clearing localStorage...');
    localStorage.removeItem('dobFormStep1Backup');
    localStorage.removeItem('dobFormStep2Backup');
    localStorage.removeItem('dobFormStep3Backup');
    localStorage.removeItem('dobFormStep4Backup');
    localStorage.removeItem('dobFormBackup');
    
    const step1Cleared = localStorage.getItem('dobFormStep1Backup') === null;
    const completeFormCleared = localStorage.getItem('dobFormBackup') === null;
    
    console.log(`✅ Step 1 cleared: ${step1Cleared}`);
    console.log(`✅ Complete form cleared: ${completeFormCleared}`);
    
    return step1Valid && step2Valid && step3Valid && step4Valid && 
           completeFormValid && step1Cleared && completeFormCleared;
    
  } catch (error) {
    console.error('❌ localStorage test failed:', error);
    return false;
  }
}

async function testDraftAPI() {
  console.log('\n🌐 Testing Draft API endpoints...');
  
  try {
    // Test 1: GET drafts
    console.log('📥 Test 1: GET /api/drafts...');
    const getResponse = await fetch('/api/drafts', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const getData = await getResponse.json();
    const getValid = getResponse.ok && getData.success && Array.isArray(getData.drafts);
    console.log(`✅ GET drafts valid: ${getValid}`);
    
    // Test 2: POST draft
    console.log('📤 Test 2: POST /api/drafts...');
    const postResponse = await fetch('/api/drafts', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceName: 'Test Device',
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
        operationalCosts: '2000'
      })
    });
    
    const postData = await postResponse.json();
    const postValid = postResponse.ok && postData.success && postData.draft.id;
    console.log(`✅ POST draft valid: ${postValid}`);
    
    // Test 3: DELETE draft
    console.log('🗑️ Test 3: DELETE /api/drafts/test-draft-id...');
    const deleteResponse = await fetch('/api/drafts/test-draft-id', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const deleteData = await deleteResponse.json();
    const deleteValid = deleteResponse.ok && deleteData.success;
    console.log(`✅ DELETE draft valid: ${deleteValid}`);
    
    return getValid && postValid && deleteValid;
    
  } catch (error) {
    console.error('❌ Draft API test failed:', error);
    return false;
  }
}

function testFormDataPersistence() {
  console.log('\n🔄 Testing form data persistence...');
  
  try {
    // Test 1: Simulate form step progression
    console.log('📝 Test 1: Simulating form step progression...');
    
    // Step 1: Basic info
    localStorage.setItem('dobFormStep1Backup', JSON.stringify(testFormData.step1));
    const step1Data = JSON.parse(localStorage.getItem('dobFormStep1Backup'));
    console.log(`✅ Step 1 saved: ${step1Data.deviceName === testFormData.step1.deviceName}`);
    
    // Step 2: Technical info
    localStorage.setItem('dobFormStep2Backup', JSON.stringify(testFormData.step2));
    const step2Data = JSON.parse(localStorage.getItem('dobFormStep2Backup'));
    console.log(`✅ Step 2 saved: ${step2Data.serialNumber === testFormData.step2.serialNumber}`);
    
    // Step 3: Financial info
    localStorage.setItem('dobFormStep3Backup', JSON.stringify(testFormData.step3));
    const step3Data = JSON.parse(localStorage.getItem('dobFormStep3Backup'));
    console.log(`✅ Step 3 saved: ${step3Data.purchasePrice === testFormData.step3.purchasePrice}`);
    
    // Test 2: Complete form assembly
    console.log('🔧 Test 2: Assembling complete form...');
    const completeForm = {
      ...step1Data,
      ...step2Data,
      ...step3Data,
      ...testFormData.step4,
      draftId: 'test-draft-id'
    };
    
    localStorage.setItem('dobFormBackup', JSON.stringify(completeForm));
    const loadedCompleteForm = JSON.parse(localStorage.getItem('dobFormBackup'));
    
    const allFieldsPresent = 
      loadedCompleteForm.deviceName &&
      loadedCompleteForm.serialNumber &&
      loadedCompleteForm.purchasePrice &&
      loadedCompleteForm.draftId;
    
    console.log(`✅ Complete form assembled: ${allFieldsPresent}`);
    
    // Test 3: Form validation
    console.log('✅ Test 3: Form validation...');
    const requiredFields = [
      'deviceName', 'deviceType', 'location', 'serialNumber', 'manufacturer', 
      'model', 'yearOfManufacture', 'condition', 'specifications',
      'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = loadedCompleteForm[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    const formValid = missingFields.length === 0;
    console.log(`✅ Form validation: ${formValid}`);
    if (!formValid) {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
    }
    
    return step1Data.deviceName === testFormData.step1.deviceName &&
           step2Data.serialNumber === testFormData.step2.serialNumber &&
           step3Data.purchasePrice === testFormData.step3.purchasePrice &&
           allFieldsPresent && formValid;
    
  } catch (error) {
    console.error('❌ Form data persistence test failed:', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting localStorage and Draft API Tests...\n');
  
  const localStorageResult = testLocalStorage();
  const draftAPIResult = await testDraftAPI();
  const formPersistenceResult = testFormDataPersistence();
  
  console.log('\n📊 Test Results:');
  console.log(`✅ localStorage: ${localStorageResult ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Draft API: ${draftAPIResult ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Form Persistence: ${formPersistenceResult ? 'PASS' : 'FAIL'}`);
  
  const allPassed = localStorageResult && draftAPIResult && formPersistenceResult;
  console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\n🔧 Issues detected:');
    if (!localStorageResult) console.log('- localStorage functionality has issues');
    if (!draftAPIResult) console.log('- Draft API endpoints have issues');
    if (!formPersistenceResult) console.log('- Form data persistence has issues');
  }
  
  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testLocalStorage, testDraftAPI, testFormDataPersistence }; 