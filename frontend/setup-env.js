#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Setting up environment variables for DOB Validator Frontend...')
console.log('')

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!')
  console.log('📁 Current .env.local location:', envPath)
  console.log('')
  console.log('Please update your .env.local file with the following variables:')
} else {
  console.log('📝 Creating .env.local file...')
}

const envContent = `# Supabase Configuration
# Replace these values with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# JWT Configuration (for legacy auth if needed)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-minimum-32-chars"
JWT_EXPIRES_IN="7d"

# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_CONTRACT_ADDRESS="CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN"

# Development Configuration
NODE_ENV="development"
`

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local file created successfully!')
} else {
  console.log('📄 Here is the content you should add to your .env.local file:')
  console.log('')
  console.log('='.repeat(60))
  console.log(envContent)
  console.log('='.repeat(60))
}

console.log('')
console.log('🔍 To get your Supabase credentials:')
console.log('1. Go to https://supabase.com/dashboard')
console.log('2. Select your project (or create a new one)')
console.log('3. Go to Settings > API')
console.log('4. Copy the following values:')
console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL')
console.log('   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY')
console.log('   - service_role secret → SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('⚠️  Important:')
console.log('- Never commit .env.local to version control')
console.log('- The service role key has admin privileges, keep it secure')
console.log('- Use different keys for development and production')
console.log('')
console.log('🚀 After updating .env.local, restart your development server:')
console.log('   pnpm dev')
console.log('')
console.log('🧪 Then test the connection with:')
console.log('   node test-supabase-profile.js') 