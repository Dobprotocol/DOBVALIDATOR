#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAdminRole() {
  console.log('🔧 Fixing admin user role...')

  try {
    const adminWallet = 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'
    
    // Check current admin user
    const currentAdmin = await prisma.user.findUnique({
      where: { walletAddress: adminWallet }
    })
    
    console.log('🔍 Current admin user:', currentAdmin)
    
    if (currentAdmin) {
      // Force update to ADMIN role
      const updatedAdmin = await prisma.user.update({
        where: { walletAddress: adminWallet },
        data: { role: 'ADMIN' }
      })
      
      console.log('✅ Updated admin user:', updatedAdmin)
    } else {
      console.log('❌ Admin user not found')
    }
    
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