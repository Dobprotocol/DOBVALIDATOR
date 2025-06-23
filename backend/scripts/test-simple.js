#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Database Integration Setup...')

try {
  // Test 1: Check if .env exists
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists')
    
    const envContent = fs.readFileSync(envPath, 'utf8')
    if (envContent.includes('DATABASE_URL')) {
      console.log('✅ DATABASE_URL found in .env')
    } else {
      console.log('❌ DATABASE_URL not found in .env')
    }
  } else {
    console.log('❌ .env file not found')
  }

  // Test 2: Check if Prisma schema exists
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
  if (fs.existsSync(schemaPath)) {
    console.log('✅ Prisma schema exists')
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf8')
    if (schemaContent.includes('model User')) {
      console.log('✅ User model found in schema')
    }
    if (schemaContent.includes('model Submission')) {
      console.log('✅ Submission model found in schema')
    }
    if (schemaContent.includes('model Draft')) {
      console.log('✅ Draft model found in schema')
    }
  } else {
    console.log('❌ Prisma schema not found')
  }

  // Test 3: Check if Prisma client was generated
  const clientPath = path.join(__dirname, '..', '..', 'node_modules', '.pnpm', '@prisma+client@5.22.0_prisma@5.22.0', 'node_modules', '@prisma', 'client')
  if (fs.existsSync(clientPath)) {
    console.log('✅ Prisma client generated')
  } else {
    console.log('⚠️  Prisma client not found (may need to run: npx prisma generate)')
  }

  // Test 4: Check if database service exists
  const dbServicePath = path.join(__dirname, '..', 'src', 'lib', 'database.ts')
  if (fs.existsSync(dbServicePath)) {
    console.log('✅ Database service file exists')
    
    const serviceContent = fs.readFileSync(dbServicePath, 'utf8')
    if (serviceContent.includes('userService')) {
      console.log('✅ userService found in database.ts')
    }
    if (serviceContent.includes('submissionService')) {
      console.log('✅ submissionService found in database.ts')
    }
    if (serviceContent.includes('draftService')) {
      console.log('✅ draftService found in database.ts')
    }
  } else {
    console.log('❌ Database service file not found')
  }

  // Test 5: Check if Docker Compose exists
  const dockerComposePath = path.join(__dirname, '..', '..', 'docker', 'docker-compose.yml')
  if (fs.existsSync(dockerComposePath)) {
    console.log('✅ Docker Compose file exists')
    
    const composeContent = fs.readFileSync(dockerComposePath, 'utf8')
    if (composeContent.includes('postgres')) {
      console.log('✅ PostgreSQL service configured in Docker Compose')
    }
  } else {
    console.log('❌ Docker Compose file not found')
  }

  console.log('\n🎉 Database integration setup test completed!')
  console.log('\n📋 Next steps:')
  console.log('   1. Install Docker Desktop from https://www.docker.com/products/docker-desktop')
  console.log('   2. Start Docker Desktop')
  console.log('   3. Run: cd docker && docker compose up -d postgres')
  console.log('   4. Run: cd backend && npx prisma migrate dev --name init')
  console.log('   5. Run: npm run db:seed')
  console.log('   6. Test with: npx prisma studio')
  console.log('\n💡 If Docker is not available, you can:')
  console.log('   - Install PostgreSQL locally: brew install postgresql')
  console.log('   - Create database: createdb dob_validator')
  console.log('   - Update DATABASE_URL in .env')
  console.log('   - Run the same migration commands')

} catch (error) {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
} 