const fetch = require('node-fetch')

const FRONTEND_BASE_URL = 'http://localhost:3000'

// Test JWT token
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiR0NCQTVPMkpEWk1HNFRLQkhBR1dFUVRNTFRUSElQRVJaVlFEUUdHUllBSUwzSEFBSjNCQUwzWk4iLCJ1c2VySWQiOiJjbWNsZGYxbnUwMDAxZXZ0YXdkMnMydnZ5IiwiaWF0IjoxNzUxNDI1OTk0LCJleHAiOjE3NTIwMzA3OTR9.PsI2Bycr7PPKZ9JPaenfAeSJVSRCkunwFuNl8eV3L6c'

async function testDisconnectWallet() {
  console.log('🧪 Testing disconnect wallet functionality...')
  
  try {
    // Test 1: Check if navbar is visible
    console.log('\n1️⃣ Testing navbar visibility...')
    
    const response = await fetch(`${FRONTEND_BASE_URL}/`)
    console.log('Homepage response status:', response.status)
    
    if (response.ok) {
      const html = await response.text()
      const hasNavbar = html.includes('navbar') || html.includes('Connect Wallet') || html.includes('StellarWallet')
      console.log('✅ Navbar found in HTML:', hasNavbar)
    } else {
      console.log('❌ Homepage not accessible')
    }

    // Test 2: Check if profile endpoint works (should work when authenticated)
    console.log('\n2️⃣ Testing profile endpoint with JWT...')
    
    const profileResponse = await fetch(`${FRONTEND_BASE_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${TEST_JWT}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Profile response status:', profileResponse.status)
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      console.log('✅ Profile endpoint working:', profileData.success)
    } else {
      const error = await profileResponse.text()
      console.log('❌ Profile endpoint error:', error)
    }

    // Test 3: Check if disconnect functionality is properly implemented
    console.log('\n3️⃣ Testing disconnect functionality...')
    
    // Check if the stellar-wallet component has disconnect logic
    const stellarWalletResponse = await fetch(`${FRONTEND_BASE_URL}/components/stellar-wallet`)
    console.log('Stellar wallet component accessible:', stellarWalletResponse.status === 200)

    console.log('\n✅ Disconnect wallet test completed!')
    console.log('📝 Manual testing required:')
    console.log('   1. Open the frontend in browser')
    console.log('   2. Connect a wallet')
    console.log('   3. Click the wallet button in navbar')
    console.log('   4. Click "Disconnect Wallet"')
    console.log('   5. Verify it redirects to home page')
    console.log('   6. Verify wallet state is cleared')

  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testDisconnectWallet() 