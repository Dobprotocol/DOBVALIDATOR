#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Admin wallet whitelist from backoffice
const ADMIN_WALLETS = [
  {
    address: 'GAAKZ5PTQ7YLHTWQJQWEPAFOHEYFADEPB4DCBE4JWT63JCYJTCGULCAC',
    name: 'Forecast',
    role: 'SUPER_ADMIN',
    permissions: ['approve', 'reject', 'review', 'manage_users', 'view_stats'],
    isActive: true
  },
  {
    address: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN',
    name: 'Current User',
    role: 'SUPER_ADMIN',
    permissions: ['approve', 'reject', 'review', 'manage_users', 'view_stats'],
    isActive: true
  },
  {
    address: 'GDGYOBHJVNGVBCIHKDR7H6NNYRSPPK2TWANH6SIY34DJLSXUOJNXA2SN',
    name: 'Whitelist 1',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  },
  {
    address: 'GCLASRLEFVHLLYHIMTAC36E42OTZPKQDAL52AEKBVTIWNPVEC4GXMAFG',
    name: 'Whitelist 2',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  },
  {
    address: 'GC6GCTEW7Y4GA6DH7WM26NEKSW4RPI3ZVN6E3FLW3ZVNILKLV77I43BK',
    name: 'User 1',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  },
  {
    address: 'GCGZFA2PFQYHPGWCOL36J7DXQ3O3TFNIN24QAQ7J4BWQYH6OIGA7THOY',
    name: 'User 2',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  }
]

async function syncAdminWallets() {
  try {
    console.log('🔧 Syncing admin wallets from backoffice to backend database...')
    
    for (const adminWallet of ADMIN_WALLETS) {
      if (!adminWallet.isActive) {
        console.log(`⏭️ Skipping inactive admin wallet: ${adminWallet.name}`)
        continue
      }

      console.log(`🔧 Processing admin wallet: ${adminWallet.name} (${adminWallet.address})`)
      
      // Map backoffice roles to backend roles
      let backendRole: 'OPERATOR' | 'ADMIN' | 'VALIDATOR' = 'OPERATOR' // default
      if (adminWallet.role === 'SUPER_ADMIN' || adminWallet.role === 'VALIDATOR') {
        backendRole = 'ADMIN'
      }

      // Update or create the user with admin role
      const user = await prisma.user.upsert({
        where: { walletAddress: adminWallet.address },
        update: { 
          role: backendRole,
          name: adminWallet.name,
          updatedAt: new Date()
        },
        create: {
          walletAddress: adminWallet.address,
          email: `${adminWallet.name.toLowerCase().replace(/\s+/g, '.')}@dobvalidator.com`,
          name: adminWallet.name,
          company: 'DOB Protocol',
          role: backendRole
        }
      })

      console.log(`✅ ${adminWallet.name}: ${user.role} role set`)
    }

    console.log('🎉 Admin wallet sync completed successfully!')
    
    // Show summary
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { walletAddress: true, name: true, role: true }
    })
    
    console.log('\n📊 Current admin users in database:')
    adminUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.walletAddress}): ${user.role}`)
    })
    
  } catch (error) {
    console.error('❌ Error syncing admin wallets:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if this file is executed directly
if (require.main === module) {
  syncAdminWallets()
}

export { syncAdminWallets } 