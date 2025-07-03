// Browser-compatible Stellar SDK wrapper
// This avoids the sodium-native compatibility issues in browsers

import { Networks, Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk'

// Browser-safe Stellar SDK functions
export const stellarSDKBrowser = {
  Networks,
  Keypair,
  Operation,
  TransactionBuilder,
  
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

export default stellarSDKBrowser 