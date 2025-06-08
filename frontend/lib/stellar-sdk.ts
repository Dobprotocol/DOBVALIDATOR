import StellarSdk from 'stellar-sdk'

// Create a wrapper that ensures proper initialization
const StellarSDK = {
  ...StellarSdk,
  initialize: () => {
    if (typeof window !== 'undefined') {
      StellarSdk.Network.useTestNetwork()
    }
  }
}

export { StellarSDK as StellarSdk }

// Initialize the SDK on the client side
if (typeof window !== 'undefined') {
  // Set the network passphrase for testnet
  StellarSdk.Network.useTestNetwork()
  // Set the base fee
  StellarSdk.BASE_FEE = '100'
} 