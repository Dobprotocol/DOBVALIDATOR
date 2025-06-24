import {
  Server,
  Keypair,
  Networks,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  xdr
} from 'soroban-client'

// Contract configuration
const CONTRACT_ADDRESS = 'CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN'
const SOROBAN_RPC = 'https://soroban-testnet.stellar.org:443'
const NETWORK_PASSPHRASE = Networks.TESTNET

// TRUFA Metadata structure for blockchain storage
export interface TrufaMetadata {
  submissionId: string
  deviceName: string
  deviceType: string
  operatorWallet: string
  validatorWallet: string
  trufaScores: {
    technical: number
    regulatory: number
    financial: number
    environmental: number
    overall: number
  }
  decision: 'APPROVED' | 'REJECTED'
  decisionAt: string
  certificateHash?: string
  metadataHash: string
}

// Contract interaction result
export interface ContractResult {
  success: boolean
  transactionHash?: string
  error?: string
  metadata?: any
}

class StellarContractService {
  server: Server
  contract: Contract

  constructor() {
    this.server = new Server(SOROBAN_RPC, { allowHttp: false })
    this.contract = new Contract(CONTRACT_ADDRESS)
  }

  /**
   * Initialize the contract service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('✅ Stellar Contract Service initialized')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Stellar contract service:', error)
      return false
    }
  }

  /**
   * Create metadata payload for TRUFA validation
   */
  createTrufaMetadata(data: Omit<TrufaMetadata, 'decisionAt' | 'metadataHash'>): TrufaMetadata {
    const metadata: TrufaMetadata = {
      ...data,
      decisionAt: new Date().toISOString(),
      metadataHash: this.generateMetadataHash(data)
    }
    return metadata
  }

  /**
   * Generate a hash for the metadata
   */
  private generateMetadataHash(data: any): string {
    const metadataString = JSON.stringify(data, Object.keys(data).sort())
    // Simple hash for now - in production, use a proper cryptographic hash
    let hash = 0
    for (let i = 0; i < metadataString.length; i++) {
      const char = metadataString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Submit validation metadata to the Soroban contract
   * Tries both symbol and bytes for deviceId
   * Logs all contract interactions for auditability
   */
  async submitValidationToSoroban({
    adminSecret,
    adminPublic,
    metadata
  }: {
    adminSecret: string
    adminPublic: string
    metadata: TrufaMetadata
  }): Promise<ContractResult> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SorobanContract] Attempting contract call`);
    console.log(`  Admin wallet: ${adminPublic}`);
    console.log(`  Submission ID: ${metadata.submissionId}`);
    console.log('  Metadata:', metadata);
    try {
      const adminKeypair = Keypair.fromSecret(adminSecret)
      const account = await this.server.getAccount(adminPublic)
      // Try symbol type for deviceId
      const deviceIdSymbol = nativeToScVal(metadata.submissionId, { type: 'symbol' })
      const txSymbol = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation(this.contract.callOperation('submit_validation', deviceIdSymbol, nativeToScVal(JSON.stringify(metadata), { type: 'string' })))
        .setTimeout(30)
        .build()
      txSymbol.sign(adminKeypair)
      try {
        const response = await this.server.sendTransaction(txSymbol)
        console.log(`[${new Date().toISOString()}] [SorobanContract] SUCCESS (symbol)`);
        console.log(`  Tx hash: ${response.hash}`);
        return {
          success: true,
          transactionHash: response.hash,
          metadata: response
        }
      } catch (e) {
        console.warn(`[${new Date().toISOString()}] [SorobanContract] Symbol call failed, trying bytes. Error:`, e)
        // If symbol fails, try bytes
        const deviceIdBytes = nativeToScVal(metadata.submissionId, { type: 'bytes' })
        const txBytes = new TransactionBuilder(account, {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE
        })
          .addOperation(this.contract.callOperation('submit_validation', deviceIdBytes, nativeToScVal(JSON.stringify(metadata), { type: 'string' })))
          .setTimeout(30)
          .build()
        txBytes.sign(adminKeypair)
        const responseBytes = await this.server.sendTransaction(txBytes)
        console.log(`[${new Date().toISOString()}] [SorobanContract] SUCCESS (bytes)`);
        console.log(`  Tx hash: ${responseBytes.hash}`);
        return {
          success: true,
          transactionHash: responseBytes.hash,
          metadata: responseBytes
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [SorobanContract] ERROR`);
      console.error(error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get validation metadata from the blockchain
   * This would query the smart contract in production
   */
  async getValidation(submissionId: string): Promise<ContractResult> {
    try {
      console.log('🔍 Fetching validation for submission:', submissionId)
      
      // For now, we'll simulate getting validation data
      // In production, this would call the smart contract
      const mockResult = {
        submissionId,
        status: 'APPROVED',
        timestamp: new Date().toISOString(),
        contractAddress: CONTRACT_ADDRESS
      }
      
      return {
        success: true,
        metadata: mockResult
      }

    } catch (error) {
      console.error('❌ Failed to get validation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Verify admin wallet permissions
   * This would check against the smart contract in production
   */
  async verifyAdminWallet(walletAddress: string): Promise<boolean> {
    try {
      console.log('🔐 Verifying admin wallet:', walletAddress)
      
      // For now, we'll use a simple whitelist
      // In production, this would call the smart contract
      const adminWallets = [
        'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ', // Mock admin wallet
        // Add more admin wallets here
      ]
      
      const isAdmin = adminWallets.includes(walletAddress)
      console.log('🔐 Admin verification result:', isAdmin)
      
      return isAdmin

    } catch (error) {
      console.error('❌ Failed to verify admin wallet:', error)
      return false
    }
  }

  /**
   * Get contract statistics
   * This would query the smart contract in production
   */
  async getContractStats(): Promise<ContractResult> {
    try {
      console.log('📊 Fetching contract statistics...')
      
      // For now, return mock statistics
      // In production, this would call the smart contract
      const mockStats = {
        totalValidations: 0,
        approvedValidations: 0,
        rejectedValidations: 0,
        contractAddress: CONTRACT_ADDRESS,
        lastUpdated: new Date().toISOString()
      }
      
      return {
        success: true,
        metadata: mockStats
      }

    } catch (error) {
      console.error('❌ Failed to get contract stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionHash: string): Promise<ContractResult> {
    try {
      console.log('🔍 Checking transaction status:', transactionHash)
      
      // For now, return mock status
      // In production, this would query the Stellar network
      const mockStatus = {
        hash: transactionHash,
        status: 'SUCCESS',
        ledger: 'mock_ledger',
        timestamp: new Date().toISOString()
      }
      
      return {
        success: true,
        metadata: mockStatus
      }

    } catch (error) {
      console.error('❌ Failed to get transaction status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Create and export singleton instance
const stellarContractService = new StellarContractService()

// Initialize the service
let isInitialized = false
stellarContractService.initialize().then((success) => {
  isInitialized = success
  console.log('Stellar Contract Service initialized:', success)
}).catch((error) => {
  console.error('Failed to initialize Stellar Contract Service:', error)
  isInitialized = false
})

export { stellarContractService, isInitialized }
export default stellarContractService 