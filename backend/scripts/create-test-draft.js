const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestDraft() {
  try {
    console.log('🔍 Creating test draft...')
    
    // First, create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { walletAddress: 'test-wallet-123' },
      update: {},
      create: {
        walletAddress: 'test-wallet-123',
        name: 'Test User',
        email: 'test-draft@example.com',
        role: 'OPERATOR'
      }
    })
    
    console.log('✅ Test user created/found:', testUser.id)
    
    // Create a test draft
    const testDraft = await prisma.draft.create({
      data: {
        userId: testUser.id,
        deviceName: 'Test Industrial Robot',
        deviceType: 'Manufacturing Equipment',
        location: 'Test Factory, Test City',
        serialNumber: 'SN123456789',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model 2024',
        yearOfManufacture: '2024',
        condition: 'New',
        specifications: 'High efficiency industrial robot with advanced automation capabilities',
        purchasePrice: '50000',
        currentValue: '48000',
        expectedRevenue: '120000',
        operationalCosts: '20000'
      }
    })
    
    console.log('✅ Test draft created successfully:')
    console.log('   ID:', testDraft.id)
    console.log('   Device Name:', testDraft.deviceName)
    console.log('   Device Type:', testDraft.deviceType)
    console.log('   Created:', testDraft.createdAt)
    console.log('   Updated:', testDraft.updatedAt)
    
  } catch (error) {
    console.error('❌ Error creating test draft:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestDraft() 