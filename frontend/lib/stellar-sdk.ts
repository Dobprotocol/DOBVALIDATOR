import { Network, BASE_FEE } from '@stellar/stellar-sdk'

// Create a singleton instance of the SDK
class StellarSDKWrapper {
  private static instance: StellarSDKWrapper
  private initialized: boolean = false

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
      Network.useTestNetwork()
      // Set the base fee
      BASE_FEE = '100'
      this.initialized = true
      console.log('✅ Stellar SDK initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Stellar SDK:', error)
      return false
    }
  }

  public getNetwork(): Network {
    if (!this.initialized) {
      throw new Error('Stellar SDK not initialized')
    }
    return Network
  }

  public getBaseFee(): string {
    if (!this.initialized) {
      throw new Error('Stellar SDK not initialized')
    }
    return BASE_FEE
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

// Export the SDK instance and initialization status
export const getStellarSDK = () => stellarSDK
export { isInitialized } 