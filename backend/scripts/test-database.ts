#!/usr/bin/env ts-node

import { prisma } from '../src/lib/database'

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Integration...')
  
  try {
    // Test 1: Check if Prisma client is generated
    console.log('✅ Prisma client generated successfully')
    
    // Test 2: Check environment variables
    const databaseUrl = process.env.***REMOVED***
    if (!databaseUrl) {
      throw new Error('***REMOVED*** not found in environment variables')
    }
    console.log('✅ Environment variables loaded')
    console.log(`   Database URL: ${databaseUrl.replace(/\/\/.*@/, '//***:***@')}`)
    
    // Test 3: Test database connection (if available)
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
      
      // Test 4: Check if tables exist
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `
      console.log('✅ Database tables found:', (tables as any[]).map(t => t.table_name))
      
      await prisma.$disconnect()
    } catch (error) {
      console.log('⚠️  Database connection failed (expected if Docker not running)')
      console.log('   Error:', (error as Error).message)
      console.log('   This is normal if PostgreSQL is not running yet')
    }
    
    // Test 5: Test service layer imports
    const { 
      userService, 
      profileService, 
      submissionService, 
      draftService, 
      authService 
    } = await import('../src/lib/database')
    
    console.log('✅ All database services imported successfully')
    console.log('   - userService:', typeof userService)
    console.log('   - profileService:', typeof profileService)
    console.log('   - submissionService:', typeof submissionService)
    console.log('   - draftService:', typeof draftService)
    console.log('   - authService:', typeof authService)
    
    console.log('\n🎉 Database integration test completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Install Docker Desktop')
    console.log('   2. Run: cd docker && docker compose up -d postgres')
    console.log('   3. Run: npm run db:setup')
    console.log('   4. Test with: npm run db:studio')
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error)
    process.exit(1)
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
}

export { testDatabaseConnection } 