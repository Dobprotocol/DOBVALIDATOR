// Test script for delete draft functionality
const testDeleteDraft = async () => {
  try {
    // First, get the auth token from localStorage (you'll need to run this in browser console)
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.log('No auth token found')
      return
    }

    const tokenData = JSON.parse(authToken)
    console.log('Auth token found:', tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token')

    // Get drafts first
    const draftsResponse = await fetch('/api/drafts', {
      headers: {
        'Authorization': `Bearer ${tokenData.token}`
      }
    })

    if (draftsResponse.ok) {
      const draftsData = await draftsResponse.json()
      console.log('Current drafts:', draftsData.drafts)
      
      if (draftsData.drafts && draftsData.drafts.length > 0) {
        const firstDraft = draftsData.drafts[0]
        console.log('Testing delete on draft:', firstDraft.id)
        
        // Test delete
        const deleteResponse = await fetch(`/api/drafts/${firstDraft.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${tokenData.token}`
          }
        })

        if (deleteResponse.ok) {
          console.log('✅ Delete successful!')
          
          // Verify it's gone
          const verifyResponse = await fetch('/api/drafts', {
            headers: {
              'Authorization': `Bearer ${tokenData.token}`
            }
          })
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json()
            console.log('Drafts after delete:', verifyData.drafts)
          }
        } else {
          const errorData = await deleteResponse.json()
          console.log('❌ Delete failed:', errorData)
        }
      } else {
        console.log('No drafts to test delete on')
      }
    } else {
      console.log('Failed to get drafts:', draftsResponse.status)
    }
  } catch (error) {
    console.error('Test error:', error)
  }
}

// Run the test
testDeleteDraft() 