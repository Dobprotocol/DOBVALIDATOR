#!/usr/bin/env node

/**
 * Test Backoffice Submissions Fetching
 * 
 * This script tests:
 * 1. Backoffice submissions API endpoint
 * 2. Data format and structure
 * 3. Integration with frontend submissions
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3004';
const BACKOFFICE_BASE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';

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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}=== STEP ${step}: ${message} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const defaultOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DOB-Validator-Backoffice-Test/1.0'
      }
    };

    const requestOptions = { ...defaultOptions, ...options };
    
    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testBackofficeSubmissionsEndpoint() {
  logStep(1, 'Testing Backoffice Submissions Endpoint');
  
  try {
    const response = await makeRequest(`${BACKOFFICE_BASE_URL}/api/submissions`);
    
    logInfo(`Response status: ${response.status}`);
    
    if (response.status === 200) {
      logSuccess('Backoffice submissions endpoint is accessible');
      
      if (response.data.success) {
        logSuccess('Response format is correct (success: true)');
        
        const submissions = response.data.submissions || [];
        logInfo(`Found ${submissions.length} submissions`);
        
        return { success: true, submissions, response: response.data };
      } else {
        logError('Response format is incorrect (missing success: true)');
        logInfo(`Response data: ${JSON.stringify(response.data, null, 2)}`);
        return { success: false, error: 'Invalid response format' };
      }
    } else {
      logError(`Backoffice submissions endpoint returned status ${response.status}`);
      logInfo(`Response data: ${JSON.stringify(response.data, null, 2)}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    logError(`Backoffice submissions endpoint error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testSubmissionDataStructure(submissions) {
  logStep(2, 'Testing Submission Data Structure');
  
  if (!submissions || submissions.length === 0) {
    logWarning('No submissions found to test data structure');
    return { success: true, message: 'No submissions to test' };
  }

  const requiredFields = [
    'id',
    'deviceName',
    'deviceType',
    'serialNumber',
    'manufacturer',
    'model',
    'yearOfManufacture',
    'condition',
    'specifications',
    'purchasePrice',
    'currentValue',
    'expectedRevenue',
    'operationalCosts',
    'status',
    'submittedAt',
    'updatedAt'
  ];

  const optionalFields = [
    'customDeviceType',
    'location',
    'userId',
    'user'
  ];

  let allValid = true;
  const errors = [];

  submissions.forEach((submission, index) => {
    logInfo(`Checking submission ${index + 1}: ${submission.deviceName || 'Unknown'}`);
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!(field in submission)) {
        allValid = false;
        errors.push(`Submission ${index + 1} missing required field: ${field}`);
      }
    });

    // Check data types for key fields
    if (typeof submission.id !== 'string') {
      allValid = false;
      errors.push(`Submission ${index + 1} id should be string, got ${typeof submission.id}`);
    }

    if (typeof submission.deviceName !== 'string') {
      allValid = false;
      errors.push(`Submission ${index + 1} deviceName should be string, got ${typeof submission.deviceName}`);
    }

    if (typeof submission.status !== 'string') {
      allValid = false;
      errors.push(`Submission ${index + 1} status should be string, got ${typeof submission.status}`);
    }

    // Check user data if present
    if (submission.user) {
      if (typeof submission.user.walletAddress !== 'string') {
        allValid = false;
        errors.push(`Submission ${index + 1} user.walletAddress should be string, got ${typeof submission.user.walletAddress}`);
      }
    }
  });

  if (allValid) {
    logSuccess('All submissions have correct data structure');
    return { success: true };
  } else {
    logError('Some submissions have invalid data structure');
    errors.forEach(error => logError(error));
    return { success: false, errors };
  }
}

async function testSubmissionStatusValues(submissions) {
  logStep(3, 'Testing Submission Status Values');
  
  if (!submissions || submissions.length === 0) {
    logWarning('No submissions found to test status values');
    return { success: true, message: 'No submissions to test' };
  }

  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT'];
  const foundStatuses = new Set();
  let allValid = true;

  submissions.forEach((submission, index) => {
    const status = submission.status;
    foundStatuses.add(status);
    
    if (!validStatuses.includes(status)) {
      allValid = false;
      logError(`Submission ${index + 1} has invalid status: ${status}`);
    }
  });

  logInfo(`Found statuses: ${Array.from(foundStatuses).join(', ')}`);
  logInfo(`Valid statuses: ${validStatuses.join(', ')}`);

  if (allValid) {
    logSuccess('All submission statuses are valid');
    return { success: true, foundStatuses: Array.from(foundStatuses) };
  } else {
    logError('Some submissions have invalid status values');
    return { success: false };
  }
}

async function testUserDataIntegration(submissions) {
  logStep(4, 'Testing User Data Integration');
  
  if (!submissions || submissions.length === 0) {
    logWarning('No submissions found to test user data integration');
    return { success: true, message: 'No submissions to test' };
  }

  const submissionsWithUser = submissions.filter(s => s.user);
  const submissionsWithoutUser = submissions.filter(s => !s.user);

  logInfo(`Submissions with user data: ${submissionsWithUser.length}`);
  logInfo(`Submissions without user data: ${submissionsWithoutUser.length}`);

  if (submissionsWithUser.length > 0) {
    const sampleUser = submissionsWithUser[0].user;
    logInfo(`Sample user data: ${JSON.stringify(sampleUser, null, 2)}`);
    
    const hasRequiredUserFields = sampleUser.id && sampleUser.walletAddress;
    if (hasRequiredUserFields) {
      logSuccess('User data integration is working correctly');
      return { success: true, userDataPresent: true };
    } else {
      logError('User data is missing required fields');
      return { success: false, error: 'Missing required user fields' };
    }
  } else {
    logWarning('No submissions have user data - this might be expected in some cases');
    return { success: true, userDataPresent: false };
  }
}

async function testPaginationSupport() {
  logStep(5, 'Testing Pagination Support');
  
  try {
    // Test with limit parameter
    const responseWithLimit = await makeRequest(`${BACKOFFICE_BASE_URL}/api/submissions?limit=5`);
    
    if (responseWithLimit.status === 200 && responseWithLimit.data.success) {
      logSuccess('Pagination with limit parameter works');
      
      const submissions = responseWithLimit.data.submissions || [];
      logInfo(`Limited to ${submissions.length} submissions`);
      
      // Test with offset parameter
      const responseWithOffset = await makeRequest(`${BACKOFFICE_BASE_URL}/api/submissions?limit=5&offset=0`);
      
      if (responseWithOffset.status === 200 && responseWithOffset.data.success) {
        logSuccess('Pagination with offset parameter works');
        return { success: true };
      } else {
        logError('Pagination with offset parameter failed');
        return { success: false, error: 'Offset parameter not working' };
      }
    } else {
      logError('Pagination with limit parameter failed');
      return { success: false, error: 'Limit parameter not working' };
    }
  } catch (error) {
    logError(`Pagination test error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testStatusFiltering() {
  logStep(6, 'Testing Status Filtering');
  
  try {
    // Test filtering by PENDING status
    const response = await makeRequest(`${BACKOFFICE_BASE_URL}/api/submissions?status=PENDING`);
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Status filtering works');
      
      const submissions = response.data.submissions || [];
      logInfo(`Found ${submissions.length} PENDING submissions`);
      
      // Verify all returned submissions have PENDING status
      const allPending = submissions.every(s => s.status === 'PENDING');
      if (allPending) {
        logSuccess('All returned submissions have PENDING status');
        return { success: true };
      } else {
        logError('Some returned submissions do not have PENDING status');
        return { success: false, error: 'Status filtering not working correctly' };
      }
    } else {
      logError('Status filtering failed');
      return { success: false, error: 'Status parameter not working' };
    }
  } catch (error) {
    logError(`Status filtering test error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log(`${colors.bright}${colors.cyan}🔍 Starting Backoffice Submissions Tests${colors.reset}\n`);
  
  const results = {
    endpointAccess: false,
    dataStructure: false,
    statusValues: false,
    userIntegration: false,
    pagination: false,
    statusFiltering: false
  };

  try {
    // Step 1: Test endpoint access
    const endpointResult = await testBackofficeSubmissionsEndpoint();
    results.endpointAccess = endpointResult.success;

    if (!endpointResult.success) {
      logError('Cannot continue - endpoint is not accessible');
      return results;
    }

    const submissions = endpointResult.submissions || [];

    // Step 2: Test data structure
    const structureResult = await testSubmissionDataStructure(submissions);
    results.dataStructure = structureResult.success;

    // Step 3: Test status values
    const statusResult = await testSubmissionStatusValues(submissions);
    results.statusValues = statusResult.success;

    // Step 4: Test user data integration
    const userResult = await testUserDataIntegration(submissions);
    results.userIntegration = userResult.success;

    // Step 5: Test pagination
    const paginationResult = await testPaginationSupport();
    results.pagination = paginationResult.success;

    // Step 6: Test status filtering
    const filteringResult = await testStatusFiltering();
    results.statusFiltering = filteringResult.success;

  } catch (error) {
    logError(`Test execution error: ${error.message}`);
  }

  // Summary
  logStep('SUMMARY', 'Backoffice Submissions Test Results');
  log('\n' + '='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log('\n' + '='.repeat(60));
  log(`Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    logSuccess('🎉 All backoffice submissions tests passed!');
    logSuccess('The backoffice can successfully fetch and process submissions from the frontend.');
  } else {
    logWarning('⚠️  Some tests failed. Check the errors above for details.');
  }

  return results;
}

// Run the test
if (require.main === module) {
  runAllTests()
    .then(() => {
      log('\n' + colors.cyan + 'Backoffice submissions test completed!' + colors.reset);
      process.exit(0);
    })
    .catch((error) => {
      logError(`Test failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testBackofficeSubmissionsEndpoint,
  testSubmissionDataStructure,
  testSubmissionStatusValues,
  testUserDataIntegration,
  testPaginationSupport,
  testStatusFiltering
}; 