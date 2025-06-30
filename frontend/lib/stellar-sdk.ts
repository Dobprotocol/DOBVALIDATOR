// Browser-compatible Stellar SDK wrapper
// This avoids the sodium-native compatibility issues in browsers

import StellarSdk from '@stellar/stellar-sdk'

// Initialize Stellar SDK based on environment
export const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
export const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET'

// Create server instance only on the client side
export const getServer = () => {
  if (typeof window !== 'undefined') {
    return new StellarSdk.Server(HORIZON_URL)
  }
  return null
}

export const getNetworkPassphrase = () => {
  return NETWORK === 'TESTNET' ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC
}

// Browser-safe Stellar SDK functions
export const stellarSDKBrowser = {
  Networks: StellarSdk.Networks,
  Keypair: StellarSdk.Keypair,
  Operation: StellarSdk.Operation,
  TransactionBuilder: StellarSdk.TransactionBuilder,
  
  // Simple challenge verification
  verifyChallenge: (challenge: string, signedData: string) => {
    try {
      // Basic verification - in a real implementation, you'd verify the signature
      return challenge && signedData && challenge.length > 0 && signedData.length > 0
    } catch (error) {
      console.error('Error verifying challenge:', error)
      return false
    }
  }
}

// Freighter wallet type
declare global {
  interface Window {
    freighter: {
      isConnected: () => Promise<boolean>
      getPublicKey: () => Promise<string>
      signTransaction: (xdr: string, network: string) => Promise<string>
    }
  }
}

// Check if Freighter is installed
export const isFreighterInstalled = () => {
  return typeof window !== 'undefined' && window.freighter !== undefined
}

// Get Freighter public key
export const getFreighterPublicKey = async () => {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet is not installed')
  }
  return await window.freighter.getPublicKey()
}

// Check if Freighter is connected
export const isFreighterConnected = async () => {
  if (!isFreighterInstalled()) {
    return false
  }
  return await window.freighter.isConnected()
}

// Sign transaction with Freighter
export const signWithFreighter = async (xdr: string) => {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet is not installed')
  }
  return await window.freighter.signTransaction(xdr, getNetworkPassphrase())
}

// Helper function to check if we're in the browser
export const isBrowser = () => typeof window !== 'undefined'

// Helper function to get account details
export const getAccountDetails = async (publicKey: string) => {
  const server = getServer()
  if (!server) {
    throw new Error('Server not available')
  }
  return await server.loadAccount(publicKey)
}

// Helper function to check if account exists
export const accountExists = async (publicKey: string) => {
  try {
    const server = getServer()
    if (!server) {
      throw new Error('Server not available')
    }
    await server.loadAccount(publicKey)
    return true
  } catch (error) {
    return false
  }
}

export default stellarSDKBrowser 