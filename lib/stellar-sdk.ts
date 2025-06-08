import StellarSdk from 'stellar-sdk'

// Export the SDK for use in components
export { StellarSdk }

// Initialize the SDK on the client side
if (typeof window !== 'undefined') {
  // Set the network passphrase for testnet
  StellarSdk.Network.useTestNetwork()
  // Set the base fee
  StellarSdk.BASE_FEE = '100'
} 