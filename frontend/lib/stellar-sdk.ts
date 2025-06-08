import StellarSdk from 'stellar-sdk'

// Create a wrapper that ensures proper initialization
const StellarSDK = {
  ...StellarSdk,
  initialize: () => {
    if (typeof window !== 'undefined') {
      try {
        // Set the network passphrase for testnet
        StellarSdk.Network.useTestNetwork()
        // Set the base fee
        StellarSdk.BASE_FEE = '100'
        return true
      } catch (error) {
        console.error('Failed to initialize Stellar SDK:', error)
        return false
      }
    }
    return false
  }
}

// Initialize the SDK on the client side
let isInitialized = false
if (typeof window !== 'undefined') {
  isInitialized = StellarSDK.initialize()
}

export { StellarSDK as StellarSdk, isInitialized } 