import {
  Networks,
  BASE_FEE,
  TransactionBuilder,
  Operation,
  Account
} from '@stellar/stellar-sdk'
import { Contract, nativeToScVal } from 'soroban-client'

// Type assertion for Server to avoid TypeScript issues
const StellarServer = require('@stellar/stellar-sdk').Server

// Contract configuration
const CONTRACT_ADDRESS = 'CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN'
const SOROBAN_RPC = 'https://soroban-testnet.stellar.org:443'
const NETWORK_PASSPHRASE = Networks.TESTNET
const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

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

/**
 * Sign a transaction using Simple Signer
 */
export async function signTransactionWithSimpleSigner(
  transactionXdr: string,
  walletAddress: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔐 Opening Simple Signer for transaction signing...')
      
      // Open Simple Signer in a popup
      const popup = window.open(
        `${SIMPLE_SIGNER_URL}/sign?xdr=${encodeURIComponent(transactionXdr)}&publicKey=${walletAddress}&network=testnet&dApp=DOB Validator Backoffice`,
        'simpleSigner',
        'width=400,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Failed to open Simple Signer popup. Please allow popups for this site.')
      }

      const handleSignMessage = (e: MessageEvent) => {
        if (e.origin !== SIMPLE_SIGNER_URL) return

        const messageEvent = e.data
        console.log('📨 Received sign message:', messageEvent.type)

        if (messageEvent.type === 'onSign') {
          const { signedXDR } = messageEvent.message
          console.log('✅ Received signed transaction:', signedXDR.substring(0, 50) + '...')
          
          cleanup()
          resolve(signedXDR)
        } else if (messageEvent.type === 'onCancel') {
          console.log('❌ Signing cancelled')
          cleanup()
          reject(new Error('Transaction signing was cancelled'))
        }
      }

      const cleanup = () => {
        window.removeEventListener('message', handleSignMessage)
        if (popup && !popup.closed) {
          popup.close()
        }
      }

      window.addEventListener('message', handleSignMessage)

      // Set a timeout to close the popup and reject if no response
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close()
        }
        cleanup()
        reject(new Error('Transaction signing timeout'))
      }, 300000) // 5 minutes timeout

    } catch (error) {
      console.error('❌ Error signing transaction:', error)
      reject(error)
    }
  })
}

class StellarContractService {
  server: any
  contract: Contract

  constructor() {
    // Initialize server and contract
    this.initializeServer()
    this.contract = new Contract(CONTRACT_ADDRESS)
  }

  private async initializeServer() {
    try {
      // Use require to avoid TypeScript issues
      this.server = new StellarServer(SOROBAN_RPC, { allowHttp: false })
      console.log('✅ Stellar server initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Stellar server:', error)
    }
  }

  /**
   * Initialize the contract service
   */
  async initialize(): Promise<boolean> {
    try {
      await this.initializeServer()
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
    if (metadataString && typeof metadataString === 'string') {
      for (let i = 0; i < metadataString.length; i++) {
        const char = metadataString.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Submit validation metadata to the Soroban contract
   * Real implementation with proper error handling
   */
  async submitValidationToSoroban({
    adminPublic,
    metadata,
    signTransaction
  }: {
    adminPublic: string
    metadata: TrufaMetadata
    signTransaction: (transactionXdr: string) => Promise<string>
  }): Promise<ContractResult> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SorobanContract] REAL CONTRACT CALL - Starting...`);
    console.log(`  Admin wallet: ${adminPublic}`);
    console.log(`  Submission ID: ${metadata.submissionId}`);
    console.log('  Full Metadata object:', JSON.stringify(metadata, null, 2));
    
    try {
      // Ensure server is initialized
      if (!this.server) {
        await this.initializeServer()
      }

      const account = await this.server.getAccount(adminPublic)
      console.log(`[${timestamp}] [SorobanContract] Account fetched successfully`);
      
      // Prepare metadata as a simplified object to avoid complex JSON issues
      const simplifiedMetadata = {
        submissionId: metadata.submissionId,
        deviceName: metadata.deviceName,
        deviceType: metadata.deviceType,
        operatorWallet: metadata.operatorWallet,
        validatorWallet: metadata.validatorWallet,
        technicalScore: metadata.trufaScores.technical,
        regulatoryScore: metadata.trufaScores.regulatory,
        financialScore: metadata.trufaScores.financial,
        environmentalScore: metadata.trufaScores.environmental,
        overallScore: metadata.trufaScores.overall,
        decision: metadata.decision,
        decisionAt: metadata.decisionAt,
        metadataHash: metadata.metadataHash
      };
      
      console.log(`[${timestamp}] [SorobanContract] Simplified metadata:`, JSON.stringify(simplifiedMetadata, null, 2));
      
      // Try string type for deviceId first (most common)
      console.log(`[${timestamp}] [SorobanContract] Creating transaction with string deviceId...`);
      const deviceIdString = nativeToScVal(metadata.submissionId, { type: 'string' })
      const metadataString = nativeToScVal(JSON.stringify(simplifiedMetadata), { type: 'string' })
      
      const txString = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation((this.contract as any).callOperation('submit_validation', deviceIdString, metadataString))
        .setTimeout(30)
        .build()
      
      try {
        // Get transaction XDR for wallet signing
        const transactionXdr = txString.toXDR()
        console.log(`[${timestamp}] [SorobanContract] Transaction XDR generated, requesting wallet signature...`);
        console.log(`[${timestamp}] [SorobanContract] XDR preview:`, transactionXdr.substring(0, 100) + '...');
        
        // Sign transaction with wallet
        const signedTransactionXdr = await signTransaction(transactionXdr)
        console.log(`[${timestamp}] [SorobanContract] Transaction signed by wallet`);
        
        // Submit signed transaction
        console.log(`[${timestamp}] [SorobanContract] Submitting signed transaction to network...`);
        const response = await this.server.sendTransaction(signedTransactionXdr)
        console.log(`[${new Date().toISOString()}] [SorobanContract] SUCCESS!`);
        console.log(`  Tx hash: ${response.hash}`);
        console.log(`  Response:`, response);
        return {
          success: true,
          transactionHash: response.hash,
          metadata: response
        }
      } catch (e) {
        console.warn(`[${new Date().toISOString()}] [SorobanContract] String call failed, trying symbol. Error:`, e);
        console.warn(`[${new Date().toISOString()}] [SorobanContract] Error details:`, JSON.stringify(e, null, 2));
        
        // If string fails, try symbol
        console.log(`[${timestamp}] [SorobanContract] Trying symbol type for deviceId...`);
        const deviceIdSymbol = nativeToScVal(metadata.submissionId, { type: 'symbol' })
        const txSymbol = new TransactionBuilder(account, {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE
        })
          .addOperation((this.contract as any).callOperation('submit_validation', deviceIdSymbol, metadataString))
          .setTimeout(30)
          .build()
        
        // Get transaction XDR for wallet signing
        const transactionXdr = txSymbol.toXDR()
        console.log(`[${timestamp}] [SorobanContract] Transaction XDR generated (symbol), requesting wallet signature...`);
        
        // Sign transaction with wallet
        const signedTransactionXdr = await signTransaction(transactionXdr)
        console.log(`[${timestamp}] [SorobanContract] Transaction signed by wallet (symbol)`);
        
        // Submit signed transaction
        const responseSymbol = await this.server.sendTransaction(signedTransactionXdr)
        console.log(`[${new Date().toISOString()}] [SorobanContract] SUCCESS (symbol)!`);
        console.log(`  Tx hash: ${responseSymbol.hash}`);
        return {
          success: true,
          transactionHash: responseSymbol.hash,
          metadata: responseSymbol
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [SorobanContract] ERROR`);
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Try to extract more details from the error
      if (error && typeof error === 'object') {
        console.error('Error properties:', Object.keys(error));
        if ('response' in error) {
          console.error('Error response:', (error as any).response);
        }
        if ('data' in error) {
          console.error('Error data:', (error as any).data);
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get validation metadata from the blockchain
   */
  async getValidation(submissionId: string): Promise<ContractResult> {
    try {
      console.log('🔍 Fetching validation for submission:', submissionId)
      
      // Query the smart contract for validation data
      const deviceIdSymbol = nativeToScVal(submissionId, { type: 'symbol' })
      const result = await this.contract.call('get_validation', deviceIdSymbol)
      
      if (result) {
        const validationData = JSON.parse(result.toString())
        return {
          success: true,
          metadata: {
            submissionId,
            ...validationData,
            contractAddress: CONTRACT_ADDRESS,
            timestamp: new Date().toISOString()
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
   */
  async verifyAdminWallet(walletAddress: string): Promise<boolean> {
    try {
      console.log('🔐 Verifying admin wallet:', walletAddress)
      
      // Query the smart contract for admin permissions
      const walletAddressSymbol = nativeToScVal(walletAddress, { type: 'symbol' })
      const result = await this.contract.call('is_admin', walletAddressSymbol)
      
      const isAdmin = result && result.toString() === 'true'
      console.log('🔐 Admin verification result:', isAdmin)
      
      return isAdmin

    } catch (error) {
      console.error('❌ Failed to verify admin wallet:', error)
      return false
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ContractResult> {
    try {
      console.log('📊 Fetching contract statistics...')
      
      // Query the smart contract for statistics
      const result = await this.contract.call('get_stats')
      
      if (result) {
        const stats = JSON.parse(result.toString())
        return {
          success: true,
          metadata: {
            ...stats,
            contractAddress: CONTRACT_ADDRESS,
            lastUpdated: new Date().toISOString()
          }
        }
      }
      
      return {
        success: false,
        error: 'Failed to get contract statistics'
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
   * Get transaction status from Stellar network
   */
  async getTransactionStatus(transactionHash: string): Promise<ContractResult> {
    try {
      console.log('🔍 Checking transaction status:', transactionHash)
      
      // Query the Stellar network for transaction status
      const transaction = await this.server.getTransaction(transactionHash)
      
      if (transaction) {
        return {
          success: true,
          metadata: {
            hash: transactionHash,
            status: transaction.successful ? 'SUCCESS' : 'FAILED',
            ledger: transaction.ledger_attr,
            timestamp: new Date(transaction.created_at).toISOString(),
            fee: transaction.fee_charged,
            operations: transaction.operation_count
          }
        }
      }
      
      return {
        success: false,
        error: 'Transaction not found'
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
   * Generate Stellar explorer URL for transaction
   */
  getExplorerUrl(transactionHash: string): string {
    return `https://stellar.expert/explorer/testnet/tx/${transactionHash}`
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