// Test fallback authentication on Vercel deployment
const VERCEL_URL = 'https://dobvalidator-frontend.vercel.app'

async function testFallbackAuth() {
  console.log('🧪 Testing fallback authentication on Vercel...')
  console.log('🔗 Testing URL:', VERCEL_URL)
  
  try {
    // Test with fallback development token
    console.log('\n1️⃣ Testing with fallback development token...')
    const fallbackToken = 'dev_fallback_token_' + Date.now()
    
    const profileResponse = await fetch(`${VERCEL_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${fallbackToken}`
      }
    })
    
    const profileData = await profileResponse.json()
    console.log('Profile status:', profileResponse.status)
    console.log('Profile response:', profileData)
    
    if (profileResponse.ok) {
      console.log('✅ Fallback authentication working!')
      
      // Test profile creation
      console.log('\n2️⃣ Testing profile creation with fallback token...')
      const createProfileResponse = await fetch(`${VERCEL_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fallbackToken}`
        },
        body: JSON.stringify({
          name: 'Test User',
          company: 'Test Company',
          email: 'test@example.com'
        })
      })
      
      const createProfileData = await createProfileResponse.json()
      console.log('Create profile status:', createProfileResponse.status)
      console.log('Create profile response:', createProfileData)
      
      if (createProfileResponse.ok) {
        console.log('✅ Profile creation working with fallback auth!')
      } else {
        console.log('❌ Profile creation failed')
      }
    } else {
      console.log('❌ Fallback authentication failed')
    }
    
    // Test with mock token
    console.log('\n3️⃣ Testing with mock token...')
    const mockToken = 'mock_access_token_' + Date.now()
    
    const mockProfileResponse = await fetch(`${VERCEL_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    })
    
    const mockProfileData = await mockProfileResponse.json()
    console.log('Mock profile status:', mockProfileResponse.status)
    console.log('Mock profile response:', mockProfileData)
    
    if (mockProfileResponse.ok) {
      console.log('✅ Mock authentication also working!')
    } else {
      console.log('❌ Mock authentication failed')
    }
    
    console.log('\n✅ Fallback authentication test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testFallbackAuth() 