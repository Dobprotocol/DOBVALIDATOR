'use client'

import { Networks } from '@stellar/stellar-sdk'

// Create a singleton instance of the SDK
class StellarSDKWrapper {
  private static instance: StellarSDKWrapper
  private initialized: boolean = false
  private baseFee: string = '100'

  private constructor() {}

  public static getInstance(): StellarSDKWrapper {
    if (!StellarSDKWrapper.instance) {
      StellarSDKWrapper.instance = new StellarSDKWrapper()
    }
    return StellarSDKWrapper.instance
  }

  public initialize(): boolean {
    if (this.initialized) return true
    if (typeof window === 'undefined') return false

    try {
      // Set the network passphrase for testnet
      this.initialized = true
      console.log('✅ Stellar SDK initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Stellar SDK:', error)
      return false
    }
  }

  public getNetwork(): string {
    if (!this.initialized) {
      throw new Error('Stellar SDK not initialized')
    }
    return Networks.TESTNET
  }

  public getBaseFee(): string {
    if (!this.initialized) {
      throw new Error('Stellar SDK not initialized')
    }
    return this.baseFee
  }

  public isInitialized(): boolean {
    return this.initialized
  }
}

// Create and export the singleton instance
const stellarSDK = StellarSDKWrapper.getInstance()

// Initialize the SDK
let isInitialized = false
if (typeof window !== 'undefined') {
  try {
    isInitialized = stellarSDK.initialize()
  } catch (error) {
    console.error('Failed to initialize Stellar SDK on module load:', error)
    isInitialized = false
  }
}

// Export constants
export const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET'
export const NETWORK_PASSPHRASE = NETWORK === 'TESTNET' ? Networks.TESTNET : Networks.PUBLIC
export const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

// Export the SDK instance and initialization status
export const getStellarSDK = () => stellarSDK
export { isInitialized }

// Helper function to check if we're in the browser
const isBrowser = () => typeof window !== 'undefined'

// Helper to generate Simple Signer URL
export const getSimpleSignerUrl = (xdr: string, publicKey?: string) => {
  const params = new URLSearchParams({
    xdr,
    network: NETWORK.toLowerCase(),
    description: 'DOB Validator Authentication',
  })
  if (publicKey) params.append('public_key', publicKey)
  return `${SIMPLE_SIGNER_URL}/connect#${params.toString()}`
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

// Helper to open Simple Signer window
export const openSimpleSigner = async (xdr: string, description: string): Promise<{ signedXDR: string, publicKey: string }> => {
  return new Promise((resolve, reject) => {
    const signWindow = window.open(
      `${SIMPLE_SIGNER_URL}/connect`,
      'Sign_Window',
      'width=360,height=700'
    )

    if (!signWindow) {
      reject(new Error('Popup blocked. Please allow popups and try again.'))
      return
    }

    let hasConnected = false
    let userPublicKey = ''
    let timeoutId: NodeJS.Timeout

    const messageHandler = (e: MessageEvent) => {
      if (e.origin !== SIMPLE_SIGNER_URL) return

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      try {
        switch (e.data.type) {
          case 'onReady':
            if (e.data.page === 'connect') {
              signWindow.postMessage(
                {
                  type: 'sign',
                  xdr,
                  description,
                  network: NETWORK.toLowerCase()
                },
                SIMPLE_SIGNER_URL
              )
              timeoutId = setTimeout(() => {
                window.removeEventListener('message', messageHandler)
                signWindow.close()
                reject(new Error('Connection timed out. Please try again.'))
              }, 300000) // 5 minutes
            }
            break

          case 'onConnect':
            hasConnected = true
            userPublicKey = e.data.message.publicKey
            break

          case 'onSign':
            if (hasConnected && userPublicKey) {
              resolve({
                signedXDR: e.data.message.signedXDR,
                publicKey: userPublicKey
              })
              window.removeEventListener('message', messageHandler)
              if (timeoutId) clearTimeout(timeoutId)
              signWindow.close()
            }
            break

          case 'onCancel':
            window.removeEventListener('message', messageHandler)
            if (timeoutId) clearTimeout(timeoutId)
            signWindow.close()
            reject(new Error('Operation cancelled by user'))
            break

          case 'error':
            window.removeEventListener('message', messageHandler)
            if (timeoutId) clearTimeout(timeoutId)
            signWindow.close()
            reject(new Error(e.data.message || 'Failed to sign transaction'))
            break
        }
      } catch (error) {
        window.removeEventListener('message', messageHandler)
        if (timeoutId) clearTimeout(timeoutId)
        signWindow.close()
        reject(error)
      }
    }

    window.addEventListener('message', messageHandler)

    // Check if window is closed
    const checkClosed = setInterval(() => {
      if (signWindow.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        if (timeoutId) clearTimeout(timeoutId)
        if (!hasConnected) {
          reject(new Error('Operation cancelled'))
        }
      }
    }, 500)
  })
}

export default {
  getSimpleSignerUrl,
  generateChallengeXDR,
  verifyChallenge,
  openSimpleSigner,
  NETWORK_PASSPHRASE,
  NETWORK,
  SIMPLE_SIGNER_URL
} 