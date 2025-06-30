const crypto = require('crypto');

// Generate a secure random string of 64 bytes and convert it to base64
const jwtSecret = crypto.randomBytes(64).toString('base64');

console.log('\nGenerated JWT Secret:');
console.log('====================');
console.log(jwtSecret);
console.log('\nAdd this to your .env file as:');
console.log('JWT_SECRET="' + jwtSecret + '"');
console.log('\n'); 