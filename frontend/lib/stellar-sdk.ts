'use client'

import { Networks, Transaction, TransactionBuilder, Operation, Account, BASE_FEE } from '@stellar/stellar-sdk'

// Create a singleton instance of the SDK
class StellarSDKWrapper {
  private static instance: StellarSDKWrapper
  private initialized: boolean = false
  private baseFee: string = BASE_FEE.toString()

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
export const generateChallengeXDR = (challenge: string, publicKey: string) => {
  try {
    // Create a new account object with sequence number 0
    const account = new Account(publicKey, '0')
    
    // Build the transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
    .addOperation(Operation.manageData({
      name: 'DOB_VALIDATOR_AUTH',
      value: challenge
    }))
    .setTimeout(0) // No timeout
    .build()

    // Get the XDR
    return transaction.toXDR()
  } catch (error) {
    console.error('Error generating challenge XDR:', error)
    throw new Error('Failed to generate challenge XDR')
  }
}

// Simple challenge verification
export const verifyChallenge = (challenge: string, signedXDR: string) => {
  if (!isBrowser()) return false
  try {
    // Basic validation
    if (!challenge || !signedXDR || challenge.length === 0 || signedXDR.length === 0) {
      return false
    }

    // Parse the transaction
    const transaction = new Transaction(signedXDR, NETWORK_PASSPHRASE)
    
    // Verify it has exactly one operation
    if (transaction.operations.length !== 1) return false
    
    // Verify it's a manageData operation
    const operation = transaction.operations[0]
    if (operation.type !== 'manageData') return false
    
    // Verify the key and value
    return operation.name === 'DOB_VALIDATOR_AUTH' && 
           operation.value?.toString() === challenge
  } catch (error) {
    console.error('Error verifying challenge:', error)
    return false
  }
}

// Helper to open Simple Signer window
export const openSimpleSigner = async (xdr: string, description: string): Promise<{ signedXDR: string, publicKey: string }> => {
  if (!xdr || typeof xdr !== 'string') {
    throw new Error('Invalid XDR provided')
  }

  // Validate XDR format
  try {
    new Transaction(xdr, NETWORK_PASSPHRASE)
  } catch (error) {
    console.error('Invalid XDR:', error)
    throw new Error('Invalid XDR format')
  }

  // Construct the URL with XDR parameter
  const params = new URLSearchParams({
    xdr,
    network: NETWORK.toLowerCase(),
    description: description || 'DOB Validator Authentication'
  })

  const signerUrl = `${SIMPLE_SIGNER_URL}/sign?${params.toString()}`

  return new Promise((resolve, reject) => {
    const signWindow = window.open(
      signerUrl,
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
        const data = e.data
        console.log('Simple Signer message:', data) // Debug log

        switch (data.type) {
          case 'onReady':
            if (data.page === 'connect') {
              hasConnected = true
              timeoutId = setTimeout(() => {
                window.removeEventListener('message', messageHandler)
                signWindow.close()
                reject(new Error('Connection timed out. Please try again.'))
              }, 300000) // 5 minutes
            }
            break

          case 'onConnect':
            hasConnected = true
            userPublicKey = data.message.publicKey
            break

          case 'onSign':
            if (!data.message?.signedXDR) {
              throw new Error('No signed XDR received')
            }
            
            if (hasConnected && userPublicKey) {
              resolve({
                signedXDR: data.message.signedXDR,
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
            reject(new Error(data.message || 'Failed to sign transaction'))
            break
        }
      } catch (error) {
        console.error('Error in Simple Signer handler:', error)
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
        reject(new Error('Window closed by user'))
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