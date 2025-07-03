#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNsZGYxbnUwMDAxZXZ0YXdkMnMydnZ5IiwiaWF0IjoxNzUxNTE4MDEzLCJleHAiOjE3NTIxMjI4MTN9.4Cdxy_VxnkeFWBT8wpfdUHXICtGchkKVVkxHXuA49uY';

async function createTestSubmission() {
  try {
    console.log('🚀 Creating test submission...');
    
    const submissionData = {
      deviceName: 'Test Solar Panel Array',
      deviceType: 'solar-panel',
      location: 'Test Location, California',
      serialNumber: 'TEST-SOLAR-001',
      manufacturer: 'Test Solar Corp',
      model: 'TS-100MW-TEST',
      yearOfManufacture: '2024',
      condition: 'New',
      specifications: '100MW capacity, advanced tracking system, 25-year warranty',
      purchasePrice: '50000000',
      currentValue: '50000000',
      expectedRevenue: '8000000',
      operationalCosts: '500000'
    };

    const response = await axios.post(`${BACKEND_URL}/api/submissions`, submissionData, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test submission created successfully!');
    console.log('📋 Submission details:');
    console.log(`   ID: ${response.data.submission.id}`);
    console.log(`   Device: ${response.data.submission.deviceName}`);
    console.log(`   Status: ${response.data.submission.status}`);
    console.log(`   Created: ${response.data.submission.createdAt}`);
    
    return response.data.submission;
  } catch (error) {
    console.error('❌ Failed to create test submission:', error.response?.data || error.message);
    throw error;
  }
}

// Run the script
createTestSubmission()
  .then(() => {
    console.log('\n🎉 Test submission script completed!');
    console.log('📊 You can now check the backoffice dashboard to see the new submission.');
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }); 