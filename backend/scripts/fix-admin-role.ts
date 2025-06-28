#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin user role...')
    
    // Update the user with the wallet address being used in testing
    const adminUser = await prisma.user.upsert({
      where: { walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN' },
      update: { 
        role: 'ADMIN',
        updatedAt: new Date()
      },
      create: {
        walletAddress: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN',
        email: 'admin@dobvalidator.com',
        name: 'DOB Validator Admin',
        company: 'DOB Protocol',
        role: 'ADMIN'
      }
    })

    console.log('✅ Updated admin user:', adminUser)
  } catch (error) {
    console.error('❌ Error fixing admin role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if this file is executed directly
if (require.main === module) {
  fixAdminRole()
}

export { fixAdminRole } 