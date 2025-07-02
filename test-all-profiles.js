const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration
const BACKEND_URL = 'https://v.dobprotocol.com';
const TEST_WALLET = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN';

class ProfileChecker {
  constructor() {
    this.results = [];
    this.userToken = null;
  }

  async run() {
    console.log('🔍 Starting comprehensive profile endpoint check...\n');
    
    try {
      // Step 1: Authenticate to get a token
      await this.authenticate();
      
      // Step 2: Get all profiles from database
      const allProfiles = await this.getAllProfilesFromDatabase();
      
      // Step 3: Test each profile via the API endpoint
      await this.testAllProfiles(allProfiles);
      
      // Step 4: Generate comprehensive report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error during profile check:', error.message);
    } finally {
      await prisma.$disconnect();
    }
  }

  async authenticate() {
    console.log('🔐 Authenticating to get access token...');
    
    try {
      // Get challenge
      const challengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
        walletAddress: TEST_WALLET
      });
      
      // Verify signature (using test signature)
      const verifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
        walletAddress: TEST_WALLET,
        signature: 'test_signature_for_profile_check',
        challenge: challengeResponse.data.challenge
      });
      
      this.userToken = verifyResponse.data.token;
      console.log('✅ Authentication successful');
      
    } catch (error) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw new Error('Authentication failed');
    }
  }

  async getAllProfilesFromDatabase() {
    console.log('\n📊 Fetching all profiles from database...');
    
    try {
      const profiles = await prisma.profile.findMany({
        include: {
          user: {
            select: {
              id: true,
              walletAddress: true,
              email: true,
              name: true,
              company: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`✅ Found ${profiles.length} profiles in database`);
      return profiles;
      
    } catch (error) {
      console.error('❌ Error fetching profiles from database:', error.message);
      throw error;
    }
  }

  async testAllProfiles(profiles) {
    console.log('\n🧪 Testing each profile via API endpoint...\n');
    
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      console.log(`\n--- Profile ${i + 1}/${profiles.length} ---`);
      console.log(`Wallet: ${profile.walletAddress}`);
      console.log(`Name: ${profile.name}`);
      
      await this.testSingleProfile(profile);
    }
  }

  async testSingleProfile(profile) {
    const result = {
      walletAddress: profile.walletAddress,
      name: profile.name,
      tests: []
    };

    // Test 1: Direct API call with the profile's wallet token
    try {
      // First, we need to get a token for this specific wallet
      const challengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
        walletAddress: profile.walletAddress
      });
      
      const verifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
        walletAddress: profile.walletAddress,
        signature: 'test_signature_for_profile_check',
        challenge: challengeResponse.data.challenge
      });
      
      const profileToken = verifyResponse.data.token;
      
      // Now test the profile endpoint
      const profileResponse = await axios.get(`${BACKEND_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${profileToken}` }
      });
      
      const apiProfile = profileResponse.data.profile;
      
      // Compare database profile with API profile
      const comparison = this.compareProfiles(profile, apiProfile);
      
      result.tests.push({
        name: 'API Endpoint Access',
        status: 'PASS',
        message: 'Profile accessible via API',
        data: {
          databaseProfile: {
            id: profile.id,
            name: profile.name,
            company: profile.company,
            email: profile.email,
            walletAddress: profile.walletAddress,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
          },
          apiProfile: apiProfile,
          comparison: comparison
        }
      });
      
    } catch (error) {
      result.tests.push({
        name: 'API Endpoint Access',
        status: 'FAIL',
        message: `API call failed: ${error.response?.data?.error || error.message}`,
        error: error.response?.data || error.message
      });
    }

    // Test 2: Database consistency check
    try {
      const dbProfile = await prisma.profile.findUnique({
        where: { walletAddress: profile.walletAddress },
        include: { user: true }
      });
      
      if (dbProfile) {
        result.tests.push({
          name: 'Database Consistency',
          status: 'PASS',
          message: 'Profile exists in database',
          data: {
            profileId: dbProfile.id,
            userId: dbProfile.userId,
            userRole: dbProfile.user.role
          }
        });
      } else {
        result.tests.push({
          name: 'Database Consistency',
          status: 'FAIL',
          message: 'Profile not found in database'
        });
      }
    } catch (error) {
      result.tests.push({
        name: 'Database Consistency',
        status: 'ERROR',
        message: `Database error: ${error.message}`
      });
    }

    // Test 3: Field validation
    const fieldValidation = this.validateProfileFields(profile);
    result.tests.push({
      name: 'Field Validation',
      status: fieldValidation.isValid ? 'PASS' : 'FAIL',
      message: fieldValidation.message,
      data: fieldValidation.details
    });

    this.results.push(result);
  }

  compareProfiles(dbProfile, apiProfile) {
    const differences = [];
    
    // Compare each field
    const fields = ['name', 'company', 'email', 'walletAddress'];
    
    fields.forEach(field => {
      if (dbProfile[field] !== apiProfile[field]) {
        differences.push({
          field,
          database: dbProfile[field],
          api: apiProfile[field]
        });
      }
    });
    
    return {
      hasDifferences: differences.length > 0,
      differences
    };
  }

  validateProfileFields(profile) {
    const issues = [];
    
    // Check required fields
    if (!profile.name || profile.name.trim() === '') {
      issues.push('Name is empty or missing');
    }
    
    if (!profile.email || profile.email.trim() === '') {
      issues.push('Email is empty or missing');
    }
    
    if (!profile.walletAddress || profile.walletAddress.trim() === '') {
      issues.push('Wallet address is empty or missing');
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profile.email && !emailRegex.test(profile.email)) {
      issues.push('Email format is invalid');
    }
    
    // Check wallet address format (basic Stellar format)
    const stellarRegex = /^G[A-Z0-9]{55}$/;
    if (profile.walletAddress && !stellarRegex.test(profile.walletAddress)) {
      issues.push('Wallet address format is invalid (should be Stellar format)');
    }
    
    // Check timestamps
    if (profile.updatedAt < profile.createdAt) {
      issues.push('Updated timestamp is before created timestamp');
    }
    
    return {
      isValid: issues.length === 0,
      message: issues.length === 0 ? 'All fields are valid' : `Found ${issues.length} issues`,
      details: issues
    };
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE PROFILE ENDPOINT CHECK REPORT');
    console.log('='.repeat(80));
    
    const totalProfiles = this.results.length;
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. Profile: ${result.name} (${result.walletAddress})`);
      
      result.tests.forEach(test => {
        totalTests++;
        const status = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        
        if (test.status === 'PASS') passedTests++;
        if (test.status === 'FAIL') failedTests++;
        
        console.log(`   ${status} ${test.name}: ${test.message}`);
        
        if (test.data) {
          if (test.name === 'Field Validation' && test.data.details && test.data.details.length > 0) {
            console.log(`      Issues: ${test.data.details.join(', ')}`);
          }
          if (test.name === 'API Endpoint Access' && test.data.comparison && test.data.comparison.hasDifferences) {
            console.log(`      Differences found between database and API`);
            test.data.comparison.differences.forEach(diff => {
              console.log(`        ${diff.field}: DB="${diff.database}" vs API="${diff.api}"`);
            });
          }
        }
        
        if (test.error) {
          console.log(`      Error: ${test.error}`);
        }
      });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Profiles Checked: ${totalProfiles}`);
    console.log(`Total Tests Run: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Errors: ${totalTests - passedTests - failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.results.forEach((result, index) => {
        const failedTests = result.tests.filter(t => t.status === 'FAIL');
        if (failedTests.length > 0) {
          console.log(`\nProfile ${index + 1} (${result.walletAddress}):`);
          failedTests.forEach(test => {
            console.log(`  - ${test.name}: ${test.message}`);
          });
        }
      });
    } else {
      console.log('\n🎉 All profiles are working correctly!');
    }
  }
}

// Run the profile checker
async function main() {
  const checker = new ProfileChecker();
  await checker.run();
}

main().catch(console.error); 