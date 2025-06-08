import StellarSdk from 'stellar-sdk'

// Create a singleton instance of the SDK
class StellarSDKWrapper {
  private static instance: StellarSDKWrapper
  private sdk: typeof StellarSdk
  private initialized: boolean = false

  private constructor() {
    this.sdk = StellarSdk
  }

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
      this.sdk.Network.useTestNetwork()
      // Set the base fee
      this.sdk.BASE_FEE = '100'
      this.initialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize Stellar SDK:', error)
      return false
    }
  }

  public getSDK(): typeof StellarSdk {
    if (!this.initialized) {
      throw new Error('Stellar SDK not initialized')
    }
    return this.sdk
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
  isInitialized = stellarSDK.initialize()
}

// Export the SDK instance and initialization status
export const getStellarSDK = () => stellarSDK.getSDK()
export { isInitialized } 