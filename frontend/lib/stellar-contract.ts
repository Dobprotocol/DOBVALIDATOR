import { 
  TransactionBuilder, 
  Account, 
  Networks, 
  Operation, 
  Asset, 
  Memo,
  BASE_FEE,
  Transaction,
  Server
} from '@stellar/stellar-sdk'

// Environment-based contract configuration
const getNetworkConfig = () => {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet'
  const horizonUrl = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 
    (network === 'testnet' ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org')
  
  return {
    network,
    horizonUrl,
    passphrase: network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC,
    explorerUrl: network === 'testnet' 
      ? 'https://stellar.expert/explorer/testnet'
      : 'https://stellar.expert/explorer/public'
  }
}

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ADDRESS || 'CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN'

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
  explorerUrl?: string
}

class StellarContractService {
  private server: Server
  private networkConfig: ReturnType<typeof getNetworkConfig>

  constructor() {
    this.networkConfig = getNetworkConfig()
    this.server = new Server(this.networkConfig.horizonUrl)
    console.log(`🔧 Stellar Contract Service initialized for ${this.networkConfig.network} network`)
  }

  /**
   * Initialize the contract service
   */
  async initialize(): Promise<boolean> {
    try {
      // Test connection to Horizon server
      const health = await this.server.health()
      console.log('✅ Stellar Horizon connection:', health.status)
      
      // Verify contract account exists
      try {
        const contractAccount = await this.server.loadAccount(CONTRACT_ADDRESS)
        console.log('✅ Contract account found:', contractAccount.id)
        console.log('   Balance:', contractAccount.balances[0]?.balance || '0')
        console.log('   Sequence:', contractAccount.sequence)
      } catch (error) {
        console.warn('⚠️ Contract account not found or not accessible:', error)
      }
      
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Stellar contract service:', error)
      return false
    }
  }

  /**
   * Create metadata payload for TRUFA validation
   */
  createTrufaMetadata(data: {
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
    certificateHash?: string
  }): TrufaMetadata {
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
    // Use a more robust hash for production
    let hash = 0
    for (let i = 0; i < metadataString.length; i++) {
      const char = metadataString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Get account sequence number
   */
  private async getAccountSequence(walletAddress: string): Promise<string> {
    try {
      const account = await this.server.loadAccount(walletAddress)
      return account.sequence
    } catch (error) {
      console.error('Failed to get account sequence:', error)
      throw new Error('Account not found or invalid')
    }
  }

  /**
   * Create a transaction for validation submission
   * This creates a transaction that stores metadata in the memo field
   * In production, this would interact with the actual smart contract
   */
  async createValidationTransaction(
    adminWalletAddress: string,
    metadata: TrufaMetadata,
    sequenceNumber?: string
  ): Promise<Transaction> {
    try {
      console.log('🔧 Creating validation transaction...')
      
      // Get sequence number if not provided
      const sequence = sequenceNumber || await this.getAccountSequence(adminWalletAddress)
      
      // Create transaction with metadata in memo
      const transaction = new TransactionBuilder(
        new Account(adminWalletAddress, sequence),
        {
          fee: BASE_FEE,
          networkPassphrase: this.networkConfig.passphrase
        }
      )
      .addOperation(
        Operation.manageData({
          name: 'dob_validation',
          value: JSON.stringify(metadata)
        })
      )
      .addMemo(Memo.text(`DOB_VALIDATION_${metadata.submissionId}`))
      .setTimeout(30)
      .build()

      console.log('✅ Validation transaction created')
      return transaction

    } catch (error) {
      console.error('❌ Failed to create validation transaction:', error)
      throw error
    }
  }

  /**
   * Submit validation metadata to the blockchain
   */
  async submitValidation(
    adminWalletAddress: string,
    metadata: TrufaMetadata,
    signedXDR?: string
  ): Promise<ContractResult> {
    try {
      console.log('🚀 Submitting validation to Stellar network...')
      console.log('📋 Metadata:', metadata)

      // If we have a signed XDR, submit it to the network
      if (signedXDR) {
        console.log('📤 Submitting signed XDR to network...')
        
        try {
          // Submit the transaction
          const result = await this.server.submitTransaction(signedXDR)
          
          console.log('✅ Transaction submitted successfully')
          console.log('   Hash:', result.hash)
          console.log('   Ledger:', result.ledger)
          
          const explorerUrl = `${this.networkConfig.explorerUrl}/tx/${result.hash}`
          
          return {
            success: true,
            transactionHash: result.hash,
            explorerUrl,
            metadata: {
              status: 'SUCCESS',
              ledger: result.ledger,
              network: this.networkConfig.network
            }
          }
        } catch (submitError: any) {
          console.error('❌ Transaction submission failed:', submitError)
          return {
            success: false,
            error: submitError.response?.data?.extras?.result_codes?.operations?.[0] || 
                   submitError.message || 'Transaction submission failed'
          }
        }
      }

      // Create and return transaction for signing
      const transaction = await this.createValidationTransaction(adminWalletAddress, metadata)
      
      return {
        success: true,
        metadata: {
          xdr: transaction.toXDR(),
          network: this.networkConfig.passphrase,
          description: 'DOB Validator - Submit TRUFA Validation',
          contractAddress: CONTRACT_ADDRESS,
          networkType: this.networkConfig.network
        }
      }

    } catch (error) {
      console.error('❌ Failed to submit validation:', error)
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
      
      // Query the contract account for validation data
      const contractAccount = await this.server.loadAccount(CONTRACT_ADDRESS)
      
      // Look for validation data in account data
      const validationData = contractAccount.data_attr?.[`dob_validation_${submissionId}`]
      
      if (validationData) {
        const metadata = JSON.parse(Buffer.from(validationData, 'base64').toString())
        return {
          success: true,
          metadata: {
            ...metadata,
            contractAddress: CONTRACT_ADDRESS,
            network: this.networkConfig.network
          }
        }
      }
      
      return {
        success: false,
        error: 'Validation not found'
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
      
      // Get contract account details
      const contractAccount = await this.server.loadAccount(CONTRACT_ADDRESS)
      
      // Count validation data entries
      const validationCount = Object.keys(contractAccount.data_attr || {})
        .filter(key => key.startsWith('dob_validation_'))
        .length
      
      const stats = {
        totalValidations: validationCount,
        approvedValidations: 0, // Would need to parse each validation
        rejectedValidations: 0, // Would need to parse each validation
        contractAddress: CONTRACT_ADDRESS,
        network: this.networkConfig.network,
        lastUpdated: new Date().toISOString(),
        balance: contractAccount.balances[0]?.balance || '0'
      }
      
      return {
        success: true,
        metadata: stats
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
      
      // Query the transaction from the network
      const transaction = await this.server.transactions()
        .transaction(transactionHash)
        .call()
      
      const status = {
        hash: transactionHash,
        status: transaction.successful ? 'SUCCESS' : 'FAILED',
        ledger: transaction.ledger_attr,
        timestamp: transaction.created_at,
        network: this.networkConfig.network,
        explorerUrl: `${this.networkConfig.explorerUrl}/tx/${transactionHash}`
      }
      
      return {
        success: true,
        metadata: status
      }

    } catch (error) {
      console.error('❌ Failed to get transaction status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get explorer URL for a transaction
   */
  getExplorerUrl(transactionHash: string): string {
    return `${this.networkConfig.explorerUrl}/tx/${transactionHash}`
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      network: this.networkConfig.network,
      horizonUrl: this.networkConfig.horizonUrl,
      explorerUrl: this.networkConfig.explorerUrl,
      contractAddress: CONTRACT_ADDRESS
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