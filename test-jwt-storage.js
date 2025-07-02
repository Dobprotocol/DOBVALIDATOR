#!/usr/bin/env node

// Simple test to check JWT storage
console.log('🧪 Testing JWT Storage...');
console.log('');

// Simulate the authentication flow
const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVkRRTkdHUllBSUwzSEFBSjNCQUwzWk4iLCJ0eXBlIjoidXNlciIsImlhdCI6MTc1MTQyMTg5OSwiZXhwIjoxNzUxNDI3ODk5fQ.test_signature';

const authToken = {
  token: mockJWT,
  expiresIn: '7d',
  walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN'
};

console.log('📄 Auth Token Structure:');
console.log(JSON.stringify(authToken, null, 2));
console.log('');

console.log('🔍 JWT Token Analysis:');
const tokenParts = mockJWT.split('.');
if (tokenParts.length === 3) {
  console.log('✅ JWT format is valid (3 parts)');
  
  try {
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('📄 JWT Payload:');
    console.log(JSON.stringify(payload, null, 2));
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp > now) {
      console.log('✅ JWT token is not expired');
    } else {
      console.log('❌ JWT token is expired');
    }
  } catch (error) {
    console.log('❌ Error parsing JWT payload:', error.message);
  }
} else {
  console.log('❌ Invalid JWT format');
}

console.log('');
console.log('📋 Manual Testing Steps:');
console.log('1. Go to https://validator.dobprotocol.com');
console.log('2. Connect your wallet and authenticate');
console.log('3. Open DevTools → Application → Local Storage');
console.log('4. Look for "authToken" item');
console.log('5. Check if token starts with "eyJ..." (real JWT)');
console.log('6. Check if /api/profile returns 200 instead of 401'); 