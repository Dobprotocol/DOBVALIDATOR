// Clear test data script
// Run this in the browser console to clear any test data and mock tokens

console.log('🧹 Clearing test data...')

// Clear all test-related data
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && (
    key.startsWith('localProfile_') || 
    key === 'userProfile' || 
    key === 'authToken' || 
    key === 'stellarPublicKey' ||
    key === 'stellarWallet'
  )) {
    keysToRemove.push(key)
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key)
  console.log('🗑️ Removed:', key)
})

// Clear session storage
sessionStorage.clear()
console.log('🗑️ Cleared session storage')

console.log('✅ Test data cleared!')
console.log('📝 Next steps:')
console.log('1. Connect your wallet again')
console.log('2. Complete the authentication flow to get a real JWT token')
console.log('3. Try saving drafts again')

// Dispatch event to trigger UI updates
window.dispatchEvent(new Event('walletStateChange')) 