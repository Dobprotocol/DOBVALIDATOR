// Contract configuration
const CONTRACT_ADDRESS = 'CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN'
const SOROBAN_RPC = 'https://soroban-testnet.stellar.org:443'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
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
  /**
   * Initialize the contract service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('✅ Stellar Contract Service initialized (simplified version)')
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
   * Simplified version that focuses on debugging the metadata format issue
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
    console.log(`[${timestamp}] [SorobanContract] DEBUGGING MODE - Metadata Analysis`);
    console.log(`  Admin wallet: ${adminPublic}`);
    console.log(`  Submission ID: ${metadata.submissionId}`);
    console.log('  Full Metadata object:', JSON.stringify(metadata, null, 2));
    
    // Analyze the metadata structure
    console.log(`[${timestamp}] [SorobanContract] Metadata Analysis:`);
    console.log(`  - submissionId type: ${typeof metadata.submissionId}, value: "${metadata.submissionId}"`);
    console.log(`  - deviceName type: ${typeof metadata.deviceName}, value: "${metadata.deviceName}"`);
    console.log(`  - deviceType type: ${typeof metadata.deviceType}, value: "${metadata.deviceType}"`);
    console.log(`  - operatorWallet type: ${typeof metadata.operatorWallet}, value: "${metadata.operatorWallet}"`);
    console.log(`  - validatorWallet type: ${typeof metadata.validatorWallet}, value: "${metadata.validatorWallet}"`);
    console.log(`  - trufaScores type: ${typeof metadata.trufaScores}, value:`, metadata.trufaScores);
    console.log(`  - decision type: ${typeof metadata.decision}, value: "${metadata.decision}"`);
    console.log(`  - decisionAt type: ${typeof metadata.decisionAt}, value: "${metadata.decisionAt}"`);
    console.log(`  - metadataHash type: ${typeof metadata.metadataHash}, value: "${metadata.metadataHash}"`);
    
    // Check for potential issues
    const issues = [];
    if (!metadata.submissionId || metadata.submissionId === 'N/A') {
      issues.push('submissionId is missing or invalid');
    }
    if (!metadata.deviceName || metadata.deviceName === 'N/A') {
      issues.push('deviceName is missing or invalid');
    }
    if (!metadata.deviceType || metadata.deviceType === 'N/A') {
      issues.push('deviceType is missing or invalid');
    }
    if (!metadata.operatorWallet || metadata.operatorWallet === 'N/A') {
      issues.push('operatorWallet is missing or invalid');
    }
    if (!metadata.validatorWallet || metadata.validatorWallet === 'N/A') {
      issues.push('validatorWallet is missing or invalid');
    }
    
    if (issues.length > 0) {
      console.error(`[${timestamp}] [SorobanContract] METADATA ISSUES DETECTED:`, issues);
      return {
        success: false,
        error: `Metadata validation failed: ${issues.join(', ')}`
      }
    }
    
    // For now, simulate a successful contract call to test the flow
    console.log(`[${timestamp}] [SorobanContract] SIMULATING SUCCESSFUL CONTRACT CALL`);
    console.log(`[${timestamp}] [SorobanContract] In production, this would call the Soroban contract with:`);
    console.log(`  - Contract address: ${CONTRACT_ADDRESS}`);
    console.log(`  - Function: submit_validation`);
    console.log(`  - Parameters: [deviceId, metadata]`);
    
    // Simulate transaction hash
    const mockTxHash = 'mock_' + Date.now().toString(16);
    
    return {
      success: true,
      transactionHash: mockTxHash,
      metadata: {
        message: 'Simulated successful contract call for debugging',
        timestamp: timestamp,
        adminWallet: adminPublic,
        submissionId: metadata.submissionId,
        decision: metadata.decision,
        overallScore: metadata.trufaScores.overall
      }
    }
  }

  /**
   * Get validation metadata from the blockchain
   */
  async getValidation(submissionId: string): Promise<ContractResult> {
    try {
      console.log('🔍 Fetching validation for submission:', submissionId)
      
      // Simulate validation retrieval
      return {
        success: true,
        metadata: {
          submissionId,
          contractAddress: CONTRACT_ADDRESS,
          timestamp: new Date().toISOString(),
          message: 'Simulated validation retrieval'
        }
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
      
      // For now, return true to allow testing
      return true

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
      
      return {
        success: true,
        metadata: {
          contractAddress: CONTRACT_ADDRESS,
          lastUpdated: new Date().toISOString(),
          message: 'Simulated contract statistics'
        }
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
      
      return {
        success: true,
        metadata: {
          hash: transactionHash,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          message: 'Simulated transaction status'
        }
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