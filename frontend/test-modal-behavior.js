// Test script to verify modal session storage behavior
// Run this in the browser console to test

console.log('Testing modal session storage behavior...')

// Test welcome modal
console.log('Welcome modal seen:', sessionStorage.getItem('dob-welcome-modal-seen'))

// Test success modal  
console.log('Success modal seen:', sessionStorage.getItem('dob-success-modal-seen'))

// Simulate seeing the welcome modal
sessionStorage.setItem('dob-welcome-modal-seen', 'true')
console.log('After setting welcome modal:', sessionStorage.getItem('dob-welcome-modal-seen'))

// Simulate seeing the success modal
sessionStorage.setItem('dob-success-modal-seen', 'true')
console.log('After setting success modal:', sessionStorage.getItem('dob-success-modal-seen'))

// Clear session storage to reset
// sessionStorage.removeItem('dob-welcome-modal-seen')
// sessionStorage.removeItem('dob-success-modal-seen')

console.log('Test complete!') 