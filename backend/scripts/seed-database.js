const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // Create admin user
    const adminWallet = 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'
    
    const adminUser = await prisma.user.upsert({
      where: { walletAddress: adminWallet },
      update: {},
      create: {
        walletAddress: adminWallet,
        email: 'admin@dobvalidator.com',
        name: 'DOB Validator Admin',
        company: 'DOB Protocol',
        role: 'ADMIN'
      }
    })

    // Create admin profile
    await prisma.profile.upsert({
      where: { walletAddress: adminWallet },
      update: {},
      create: {
        userId: adminUser.id,
        name: 'DOB Validator Admin',
        company: 'DOB Protocol',
        email: 'admin@dobvalidator.com',
        walletAddress: adminWallet
      }
    })

    console.log('👤 Created admin user:', adminWallet)

    // Create test user
    const testWallet = 'GABCDEF1234567890ABCDEF1234567890ABCDEF12'
    
    const testUser = await prisma.user.upsert({
      where: { walletAddress: testWallet },
      update: {},
      create: {
        walletAddress: testWallet,
        email: 'test@example.com',
        name: 'Test User',
        company: 'Test Company'
      }
    })

    // Create test profile
    await prisma.profile.upsert({
      where: { walletAddress: testWallet },
      update: {},
      create: {
        userId: testUser.id,
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        walletAddress: testWallet
      }
    })

    console.log('👤 Created test user:', testWallet)

    // Create test submissions
    const testSubmissions = [
      {
        deviceName: 'Solar Panel Array Alpha',
        deviceType: 'Renewable Energy',
        serialNumber: 'SPA-2024-001',
        manufacturer: 'SolarTech Industries',
        model: 'ST-5000W',
        yearOfManufacture: '2024',
        condition: 'Excellent',
        specifications: '5000W capacity, 25-year warranty, grid-tied system',
        purchasePrice: '15000',
        currentValue: '14500',
        expectedRevenue: '2500',
        operationalCosts: '200',
        status: 'PENDING'
      },
      {
        deviceName: 'Wind Turbine Beta',
        deviceType: 'Wind Energy',
        serialNumber: 'WT-2024-002',
        manufacturer: 'WindPower Solutions',
        model: 'WP-10KW',
        yearOfManufacture: '2024',
        condition: 'Good',
        specifications: '10KW capacity, 20-year warranty, residential scale',
        purchasePrice: '25000',
        currentValue: '24000',
        expectedRevenue: '4000',
        operationalCosts: '300',
        status: 'APPROVED'
      },
      {
        deviceName: 'Battery Storage Gamma',
        deviceType: 'Energy Storage',
        serialNumber: 'BS-2024-003',
        manufacturer: 'BatteryCorp',
        model: 'BC-100KWH',
        yearOfManufacture: '2024',
        condition: 'Excellent',
        specifications: '100KWH capacity, lithium-ion, 10-year warranty',
        purchasePrice: '80000',
        currentValue: '78000',
        expectedRevenue: '12000',
        operationalCosts: '500',
        status: 'REJECTED'
      }
    ]

    for (const submissionData of testSubmissions) {
      await prisma.submission.create({
        data: {
          userId: testUser.id,
          ...submissionData
        }
      })
    }

    console.log('📋 Created test submissions')

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase } 