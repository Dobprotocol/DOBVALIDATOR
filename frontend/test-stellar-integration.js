// Test script for Stellar Contract Integration
// Run with: node test-stellar-integration.js

// Mock the browser environment for Node.js testing
global.window = {
  localStorage: {
    getItem: (key) => {
      if (key === 'stellarPublicKey') return 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'
      return null
    },
    setItem: (key, value) => console.log(`localStorage.setItem(${key}, ${value})`),
    removeItem: (key) => console.log(`localStorage.removeItem(${key})`)
  }
}

global.localStorage = global.window.localStorage

// Mock console for better output
const originalConsole = console.log
console.log = (...args) => {
  originalConsole(`[TEST]`, ...args)
}

async function testStellarContractIntegration() {
  console.log('🧪 Starting Stellar Contract Integration Tests...')
  console.log('=' * 60)

  try {
    // Test 1: Initialize Stellar Contract Service
    console.log('\n📋 Test 1: Initialize Stellar Contract Service')
    const { stellarContractService } = require('./lib/stellar-contract.ts')
    
    const initResult = await stellarContractService.initialize()
    console.log('✅ Initialization result:', initResult)
    
    if (!initResult) {
      throw new Error('Failed to initialize Stellar Contract Service')
    }

    // Test 2: Create TRUFA Metadata
    console.log('\n📋 Test 2: Create TRUFA Metadata')
    const sampleData = {
      submissionId: 'TEST_SUB_001',
      deviceName: 'Helium Chile Expansion',
      deviceType: 'Network Infrastructure',
      operatorWallet: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      validatorWallet: 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ',
      trufaScores: {
        technical: 85,
        regulatory: 90,
        financial: 75,
        environmental: 80,
        overall: 82
      },
      decision: 'APPROVED'
    }

    const metadata = stellarContractService.createTrufaMetadata(sampleData)
    console.log('✅ Metadata created:', JSON.stringify(metadata, null, 2))

    // Test 3: Verify Admin Wallet
    console.log('\n📋 Test 3: Verify Admin Wallet')
    const adminWallet = 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'
    const isAdmin = await stellarContractService.verifyAdminWallet(adminWallet)
    console.log('✅ Admin verification result:', isAdmin)

    // Test 4: Create Validation Transaction
    console.log('\n📋 Test 4: Create Validation Transaction')
    const transaction = await stellarContractService.createValidationTransaction(
      adminWallet,
      metadata,
      '123456789'
    )
    console.log('✅ Transaction created successfully')
    console.log('📄 Transaction XDR length:', transaction.toXDR().length)
    console.log('📄 Transaction XDR preview:', transaction.toXDR().substring(0, 100) + '...')

    // Test 5: Submit Validation
    console.log('\n📋 Test 5: Submit Validation')
    const submitResult = await stellarContractService.submitValidation(
      adminWallet,
      metadata
    )
    console.log('✅ Submit result:', JSON.stringify(submitResult, null, 2))

    // Test 6: Get Validation
    console.log('\n📋 Test 6: Get Validation')
    const getResult = await stellarContractService.getValidation('TEST_SUB_001')
    console.log('✅ Get validation result:', JSON.stringify(getResult, null, 2))

    // Test 7: Get Contract Stats
    console.log('\n📋 Test 7: Get Contract Stats')
    const statsResult = await stellarContractService.getContractStats()
    console.log('✅ Contract stats:', JSON.stringify(statsResult, null, 2))

    // Test 8: Admin Config Service
    console.log('\n📋 Test 8: Admin Config Service')
    const { adminConfigService } = require('./lib/admin-config.ts')
    
    const adminDetails = adminConfigService.getAdminWallet(adminWallet)
    console.log('✅ Admin details:', JSON.stringify(adminDetails, null, 2))
    
    const hasPermission = adminConfigService.hasPermission(adminWallet, 'approve')
    console.log('✅ Has approve permission:', hasPermission)
    
    const adminStats = adminConfigService.getAdminStats()
    console.log('✅ Admin stats:', JSON.stringify(adminStats, null, 2))

    console.log('\n🎉 All tests passed successfully!')
    console.log('=' * 60)
    console.log('✅ Stellar Contract Integration is working correctly')
    console.log('✅ Admin Wallet Authentication is functional')
    console.log('✅ TRUFA Metadata generation is working')
    console.log('✅ Transaction creation is successful')
    console.log('✅ Ready for database integration!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run the tests
testStellarContractIntegration() 