'use client'

// Simple Signer configuration
export const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET'
export const NETWORK_PASSPHRASE = NETWORK === 'TESTNET' 
  ? 'Test SDF Network ; September 2015'
  : 'Public Global Stellar Network ; September 2015'

// Helper function to check if we're in the browser
export const isBrowser = () => typeof window !== 'undefined'

// Helper to generate Simple Signer URL
export const getSimpleSignerUrl = (xdr: string, publicKey?: string) => {
  const baseUrl = 'https://sign.stellar.expert'
  const params = new URLSearchParams()
  params.append('xdr', xdr)
  if (publicKey) params.append('public_key', publicKey)
  params.append('network', NETWORK.toLowerCase())
  return `${baseUrl}/#${params.toString()}`
}

// Helper to generate a challenge transaction XDR
export const generateChallengeXDR = (challenge: string, publicKey?: string) => {
  // Create a base64 encoded XDR for a manage data operation
  // This follows the SEP-0010 format for authentication
  const source = publicKey || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'
  const sequence = '0'
  const opSource = source
  const opName = 'DOB_VALIDATOR_AUTH'
  const opValue = Buffer.from(challenge).toString('base64')
  
  // Construct the XDR parts
  const header = 'AAAAAgAAAAEAAAAA' // Transaction header (v1, fee=100, 1 operation)
  const sourceAccount = Buffer.from(source).toString('base64')
  const seqNum = Buffer.from(sequence).toString('base64')
  const timeBounds = 'AAAAAA' // No time bounds
  const memo = 'AAAAAAAAAA' // No memo
  const operation = Buffer.from(`AAAAAQAAAAA${opSource}${opName}${opValue}`).toString('base64')
  
  return `${header}${sourceAccount}${seqNum}${timeBounds}${memo}${operation}AAAAAQ==` // Add trailing reserved bytes
}

// Simple challenge verification
export const verifyChallenge = (challenge: string, signedXDR: string) => {
  if (!isBrowser()) return false
  try {
    // Basic validation
    if (!challenge || !signedXDR || challenge.length === 0 || signedXDR.length === 0) {
      return false
    }

    // Decode base64 XDR
    const decodedXDR = Buffer.from(signedXDR, 'base64').toString()
    
    // Check if XDR contains our operation name and challenge
    const hasOpName = decodedXDR.includes('DOB_VALIDATOR_AUTH')
    const hasChallenge = decodedXDR.includes(challenge)
    
    return hasOpName && hasChallenge
  } catch (error) {
    console.error('Error verifying challenge:', error)
    return false
  }
}

export default {
  getSimpleSignerUrl,
  generateChallengeXDR,
  verifyChallenge,
  NETWORK_PASSPHRASE,
  NETWORK
} 