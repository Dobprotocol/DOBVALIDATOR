// Script to clear localStorage for testing
console.log('🧹 Clearing localStorage for fresh testing...')

// Clear all wallet-related data
localStorage.removeItem('authToken')
localStorage.removeItem('stellarPublicKey')
localStorage.removeItem('stellarWallet')
localStorage.removeItem('userProfile')

// Clear cookies
document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
document.cookie = 'stellarPublicKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

console.log('✅ localStorage cleared successfully!')
console.log('🔄 Please refresh the page to test the authentication flow') 