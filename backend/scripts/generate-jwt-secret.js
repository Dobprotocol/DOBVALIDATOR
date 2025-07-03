#!/usr/bin/env node

/**
 * Generate JWT Secret for Production
 * 
 * This script generates a cryptographically secure JWT secret
 * that meets the production requirements (at least 32 characters).
 * 
 * Usage: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

console.log('🔐 Generating JWT Secret for Production...\n');

// Generate a 64-byte (512-bit) random secret
const secret = crypto.randomBytes(64).toString('hex');

console.log('✅ Generated secure JWT secret:');
console.log('='.repeat(80));
console.log(secret);
console.log('='.repeat(80));
console.log(`\n📏 Length: ${secret.length} characters`);
console.log('🔒 Security: 512-bit random (cryptographically secure)');
console.log('✅ Meets production requirements (minimum 32 characters)');
console.log('\n📋 Copy this secret to your .env.production file:');
console.log(`JWT_SECRET="${secret}"`);
console.log('\n⚠️  IMPORTANT:');
console.log('   - Keep this secret secure and private');
console.log('   - Never commit it to version control');
console.log('   - Use different secrets for different environments');
console.log('   - Store it securely in your deployment platform'); 