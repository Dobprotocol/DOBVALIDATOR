#!/usr/bin/env node

/**
 * Test Form Submission Flow
 * 
 * This script tests the complete flow:
 * 1. User authentication (wallet login)
 * 2. Profile creation
 * 3. Form submission
 * 4. Backoffice fetching submissions
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3004';
const BACKOFFICE_BASE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3005';

// Test wallet (mock for testing)
const TEST_WALLET_ADDRESS = 'GABC123456789012345678901234567890123456789012345678901234567890';

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
        'User-Agent': 'DOB-Validator-Test-Script/1.0'
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
async function testWalletLogin() {
  logStep(1, 'Testing Wallet Login');
  
  try {
    // Step 1: Create a challenge
    logInfo('Creating authentication challenge...');
    const challengeResponse = await makeRequest(`${FRONTEND_BASE_URL}/api/auth/challenge`, {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: TEST_WALLET_ADDRESS
      })
    });

    if (challengeResponse.status !== 200 || !challengeResponse.data.success) {
      logError(`Challenge creation failed: ${challengeResponse.status} - ${JSON.stringify(challengeResponse.data)}`);
      return null;
    }

    const challenge = challengeResponse.data.challenge;
    logSuccess('Challenge created successfully');
    logInfo(`Challenge: ${challenge}`);

    // Step 2: Test wallet login with mock signature
    logInfo('Attempting wallet login with mock signature...');
    const loginResponse = await makeRequest(`${FRONTEND_BASE_URL}/api/auth/wallet-login`, {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: TEST_WALLET_ADDRESS,
        signature: 'mock_signature_for_testing',
        challenge: challenge
      })
    });

    if (loginResponse.status === 200 && loginResponse.data.success) {
      logSuccess('Wallet login successful');
      logInfo(`Token: ${loginResponse.data.token.substring(0, 50)}...`);
      return loginResponse.data.token;
    } else {
      logError(`Wallet login failed: ${loginResponse.status} - ${JSON.stringify(loginResponse.data)}`);
      return null;
    }
  } catch (error) {
    logError(`Wallet login error: ${error.message}`);
    return null;
  }
}

async function testProfileCreation(authToken) {
  logStep(2, 'Testing Profile Creation');
  
  if (!authToken) {
    logError('No auth token provided for profile creation');
    return false;
  }

  try {
    const profileData = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'OPERATOR'
    };

    const profileResponse = await makeRequest(`${FRONTEND_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(profileData)
    });

    if (profileResponse.status === 200 && profileResponse.data.success) {
      logSuccess('Profile creation successful');
      logInfo(`Profile ID: ${profileResponse.data.profile.id}`);
      return true;
    } else {
      logError(`Profile creation failed: ${profileResponse.status} - ${JSON.stringify(profileResponse.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Profile creation error: ${error.message}`);
    return false;
  }
}

async function testFormSubmission(authToken) {
  logStep(3, 'Testing Form Submission');
  
  if (!authToken) {
    logError('No auth token provided for form submission');
    return null;
  }

  try {
    const submissionData = {
      deviceName: 'Test Industrial Robot',
      deviceType: 'Manufacturing Equipment',
      customDeviceType: 'Custom Robot Type',
      location: 'Test Factory, Test City',
      serialNumber: 'TEST-ROBOT-2024-001',
      manufacturer: 'TestCorp Industries',
      model: 'TestBot X1',
      yearOfManufacture: '2024',
      condition: 'Excellent',
      specifications: 'Advanced robotic arm with AI capabilities for manufacturing automation. Features include precision control, safety sensors, and integration with Industry 4.0 systems.',
      purchasePrice: '50000',
      currentValue: '45000',
      expectedRevenue: '100000',
      operationalCosts: '5000'
    };

    const submissionResponse = await makeRequest(`${FRONTEND_BASE_URL}/api/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });

    if (submissionResponse.status === 200 && submissionResponse.data.success) {
      logSuccess('Form submission successful');
      logInfo(`Submission ID: ${submissionResponse.data.submission.id}`);
      logInfo(`Device: ${submissionResponse.data.submission.deviceName}`);
      logInfo(`Status: ${submissionResponse.data.submission.status}`);
      return submissionResponse.data.submission.id;
    } else {
      logError(`Form submission failed: ${submissionResponse.status} - ${JSON.stringify(submissionResponse.data)}`);
      return null;
    }
  } catch (error) {
    logError(`Form submission error: ${error.message}`);
    return null;
  }
}

async function testFrontendSubmissionsAPI(authToken) {
  logStep(4, 'Testing Frontend Submissions API');
  
  if (!authToken) {
    logError('No auth token provided for submissions API test');
    return false;
  }

  try {
    const submissionsResponse = await makeRequest(`${FRONTEND_BASE_URL}/api/submissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (submissionsResponse.status === 200 && submissionsResponse.data.success) {
      logSuccess('Frontend submissions API working');
      logInfo(`Found ${submissionsResponse.data.submissions.length} submissions`);
      
      if (submissionsResponse.data.submissions.length > 0) {
        const latestSubmission = submissionsResponse.data.submissions[0];
        logInfo(`Latest submission: ${latestSubmission.deviceName} (${latestSubmission.status})`);
      }
      
      return true;
    } else {
      logError(`Frontend submissions API failed: ${submissionsResponse.status} - ${JSON.stringify(submissionsResponse.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Frontend submissions API error: ${error.message}`);
    return false;
  }
}

async function testBackofficeSubmissionsAPI() {
  logStep(5, 'Testing Backoffice Submissions API');
  
  try {
    const backofficeResponse = await makeRequest(`${BACKOFFICE_BASE_URL}/api/submissions`, {
      method: 'GET'
    });

    if (backofficeResponse.status === 200 && backofficeResponse.data.success) {
      logSuccess('Backoffice submissions API working');
      logInfo(`Found ${backofficeResponse.data.submissions.length} submissions in backoffice`);
      
      if (backofficeResponse.data.submissions.length > 0) {
        const latestSubmission = backofficeResponse.data.submissions[0];
        logInfo(`Latest submission in backoffice: ${latestSubmission.deviceName} (${latestSubmission.status})`);
        logInfo(`User: ${latestSubmission.user?.name || 'Unknown'} (${latestSubmission.user?.walletAddress || 'Unknown'})`);
      }
      
      return true;
    } else {
      logError(`Backoffice submissions API failed: ${backofficeResponse.status} - ${JSON.stringify(backofficeResponse.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Backoffice submissions API error: ${error.message}`);
    return false;
  }
}

async function testBackendSubmissionsAPI(authToken) {
  logStep(6, 'Testing Backend Submissions API');
  
  if (!authToken) {
    logError('No auth token provided for backend submissions API test');
    return false;
  }

  try {
    const backendResponse = await makeRequest(`${BACKEND_BASE_URL}/api/submissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (backendResponse.status === 200 && backendResponse.data.success) {
      logSuccess('Backend submissions API working');
      logInfo(`Found ${backendResponse.data.submissions?.length || 0} submissions in backend`);
      return true;
    } else {
      logError(`Backend submissions API failed: ${backendResponse.status} - ${JSON.stringify(backendResponse.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Backend submissions API error: ${error.message}`);
    return false;
  }
}

async function testCompleteFlow() {
  log(`${colors.bright}${colors.cyan}🚀 Starting Complete Form Submission Flow Test${colors.reset}\n`);
  
  const results = {
    walletLogin: false,
    profileCreation: false,
    formSubmission: false,
    frontendSubmissionsAPI: false,
    backofficeSubmissionsAPI: false,
    backendSubmissionsAPI: false
  };

  try {
    // Step 1: Wallet Login
    const authToken = await testWalletLogin();
    results.walletLogin = !!authToken;

    if (!authToken) {
      logError('Cannot continue without authentication token');
      return results;
    }

    // Step 2: Profile Creation
    results.profileCreation = await testProfileCreation(authToken);

    // Step 3: Form Submission
    const submissionId = await testFormSubmission(authToken);
    results.formSubmission = !!submissionId;

    // Step 4: Test Frontend Submissions API
    results.frontendSubmissionsAPI = await testFrontendSubmissionsAPI(authToken);

    // Step 5: Test Backoffice Submissions API
    results.backofficeSubmissionsAPI = await testBackofficeSubmissionsAPI();

    // Step 6: Test Backend Submissions API
    results.backendSubmissionsAPI = await testBackendSubmissionsAPI(authToken);

  } catch (error) {
    logError(`Test flow error: ${error.message}`);
  }

  // Summary
  logStep('SUMMARY', 'Test Results');
  log('\n' + '='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log('\n' + '='.repeat(50));
  log(`Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    logSuccess('🎉 All tests passed! The form submission flow is working correctly.');
  } else {
    logWarning('⚠️  Some tests failed. Check the errors above for details.');
  }

  return results;
}

// Run the test
if (require.main === module) {
  testCompleteFlow()
    .then(() => {
      log('\n' + colors.cyan + 'Test completed!' + colors.reset);
      process.exit(0);
    })
    .catch((error) => {
      logError(`Test failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  testCompleteFlow,
  testWalletLogin,
  testProfileCreation,
  testFormSubmission,
  testFrontendSubmissionsAPI,
  testBackofficeSubmissionsAPI,
  testBackendSubmissionsAPI
}; 