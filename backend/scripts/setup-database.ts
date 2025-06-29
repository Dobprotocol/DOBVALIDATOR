#!/usr/bin/env ts-node

import { execSync } from 'child_process'
import { prisma } from '../src/lib/database'
import { userService, profileService } from '../src/lib/database'

async function setupDatabase() {
  console.log('🚀 Setting up DOB Validator database...')

  try {
    // 1. Generate Prisma client
    console.log('📦 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    // 2. Run migrations
    console.log('🔄 Running database migrations...')
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })

    // 3. Seed database with initial data
    console.log('🌱 Seeding database...')
    await seedDatabase()

    console.log('✅ Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function seedDatabase() {
  // Create admin user
  const adminWallet = 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'
  
  const adminUser = await userService.findOrCreateByWallet(adminWallet, {
    email: 'admin@dobvalidator.com',
    name: 'DOB Validator Admin',
    company: 'DOB Protocol'
  })

  // Create admin profile
  await profileService.create(adminUser.id, {
    name: 'DOB Validator Admin',
    company: 'DOB Protocol',
    email: 'admin@dobvalidator.com',
    walletAddress: adminWallet
  })

  console.log('👤 Created admin user:', adminWallet)

  // Create test user
  const testWallet = 'GABCDEF1234567890ABCDEF1234567890ABCDEF12'
  
  const testUser = await userService.findOrCreateByWallet(testWallet, {
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company'
  })

  // Create test profile
  await profileService.create(testUser.id, {
    name: 'Test User',
    company: 'Test Company',
    email: 'test@example.com',
    walletAddress: testWallet
  })

  console.log('👤 Created test user:', testWallet)
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
}

export { setupDatabase } 