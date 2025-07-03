#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating secure JWT secret for DOB Validator...');
console.log('');

// Generate a secure random string (64 characters for extra security)
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated JWT Secret:');
console.log('='.repeat(60));
console.log(jwtSecret);
console.log('='.repeat(60));
console.log('');

console.log('📋 Requirements met:');
console.log(`✅ Length: ${jwtSecret.length} characters (minimum 32 required)`);
console.log('✅ Cryptographically secure random generation');
console.log('✅ Hex format for easy copying');
console.log('');

console.log('🔧 How to use this JWT secret:');
console.log('');
console.log('1. For Vercel deployment:');
console.log('   - Go to your Vercel project dashboard');
console.log('   - Settings → Environment Variables');
console.log('   - Add variable: JWT_SECRET');
console.log('   - Value: (paste the secret above)');
console.log('   - Deploy/redeploy your backend');
console.log('');
console.log('2. For local development (.env.local):');
console.log('   JWT_SECRET=' + jwtSecret);
console.log('');
console.log('3. For Docker deployment:');
console.log('   - Add to docker-compose.yml:');
console.log('     environment:');
console.log('       - JWT_SECRET=' + jwtSecret);
console.log('');
console.log('⚠️  Security Notes:');
console.log('- Never commit this secret to version control');
console.log('- Use different secrets for development and production');
console.log('- Rotate this secret periodically in production');
console.log('- Keep this secret secure and private');
console.log('');
console.log('🎯 Next steps:');
console.log('1. Copy the JWT secret above');
console.log('2. Set it in your deployment environment');
console.log('3. Redeploy your backend');
console.log('4. Test authentication flow'); 