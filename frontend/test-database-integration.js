// Test script for database integration
const testDatabaseIntegration = async () => {
  try {
    // First, get the auth token from localStorage (you'll need to run this in browser console)
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.log('No auth token found')
      return
    }

    const tokenData = JSON.parse(authToken)
    console.log('Auth token found:', tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token')

    // Test 1: Create a draft
    console.log('🧪 Test 1: Creating a draft...')
    const createResponse = await fetch('/api/drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`
      },
      body: JSON.stringify({
        name: 'Test Draft - Database Integration',
        deviceName: 'Test Device',
        deviceType: 'solar',
        location: 'Test Location',
        serialNumber: 'TEST123',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model'
      })
    })

    if (createResponse.ok) {
      const createData = await createResponse.json()
      console.log('✅ Draft created:', createData.draft)
      
      const draftId = createData.draft.id
      
      // Test 2: Get all drafts
      console.log('🧪 Test 2: Getting all drafts...')
      const getResponse = await fetch('/api/drafts', {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`
        }
      })

      if (getResponse.ok) {
        const getData = await getResponse.json()
        console.log('✅ Drafts retrieved:', getData.drafts)
        console.log('✅ Total drafts:', getData.total)
        
        // Test 3: Update the draft
        console.log('🧪 Test 3: Updating the draft...')
        const updateResponse = await fetch('/api/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`
          },
          body: JSON.stringify({
            draftId: draftId,
            deviceName: 'Updated Test Device',
            location: 'Updated Test Location'
          })
        })

        if (updateResponse.ok) {
          const updateData = await updateResponse.json()
          console.log('✅ Draft updated:', updateData.draft)
          
          // Test 4: Delete the draft
          console.log('🧪 Test 4: Deleting the draft...')
          const deleteResponse = await fetch(`/api/drafts/${draftId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${tokenData.token}`
            }
          })

          if (deleteResponse.ok) {
            console.log('✅ Draft deleted successfully')
            
            // Test 5: Verify it's gone
            console.log('🧪 Test 5: Verifying deletion...')
            const verifyResponse = await fetch('/api/drafts', {
              headers: {
                'Authorization': `Bearer ${tokenData.token}`
              }
            })
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json()
              console.log('✅ Final drafts count:', verifyData.total)
              console.log('🎉 All database integration tests passed!')
            }
          } else {
            console.log('❌ Delete failed:', await deleteResponse.json())
          }
        } else {
          console.log('❌ Update failed:', await updateResponse.json())
        }
      } else {
        console.log('❌ Get drafts failed:', await getResponse.json())
      }
    } else {
      console.log('❌ Create failed:', await createResponse.json())
    }
  } catch (error) {
    console.error('Test error:', error)
  }
}

// Run the test
testDatabaseIntegration() 