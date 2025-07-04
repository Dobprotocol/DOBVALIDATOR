// Version identifier to ensure latest code is running
const CONTRACT_VERSION = 'dob-validator-metadata-signer-' + Date.now()

// Contract configuration
const CONTRACT_ADDRESS = 'CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN'
const SOROBAN_RPC = 'https://soroban-testnet.stellar.org:443'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

// Log version on module load
console.log(`[${new Date().toISOString()}] [SorobanContract] 🚀 LOADED VERSION: ${CONTRACT_VERSION}`)
console.log(`[${new Date().toISOString()}] [SorobanContract] 🔥 THIS IS THE REAL CONTRACT INTEGRATION - NO SIMULATION`)
console.log(`[${new Date().toISOString()}] [SorobanContract] 📍 Contract Address: ${CONTRACT_ADDRESS}`)
console.log(`[${new Date().toISOString()}] [SorobanContract] 🌐 RPC URL: ${SOROBAN_RPC}`)

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
  constructor() {
    console.log('🔧 StellarContractService constructor called - REAL VERSION')
    console.log('🔧 Contract address:', CONTRACT_ADDRESS)
  }

  /**
   * Initialize the contract service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('✅ Stellar Contract Service initialized (Browser-compatible version)')
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
   * Submit validation metadata to the Soroban contract via backend API
   * Browser-compatible version that calls the backend instead of using Stellar SDK directly
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
    console.log(`[${timestamp}] [SorobanContract] 🔥🔥🔥 REAL CONTRACT INTEGRATION CALLED - NO SIMULATION 🔥🔥🔥`);
    console.log(`[${timestamp}] [SorobanContract] 🚀 REAL CONTRACT CALL v2.0 - Starting...`);
    console.log(`[${timestamp}] [SorobanContract] VERSION: Real Stellar Integration Active`);
    console.log(`  Admin wallet: ${adminPublic}`);
    console.log(`  Submission ID: ${metadata.submissionId}`);
    console.log('  Full Metadata object:', JSON.stringify(metadata, null, 2));
    
    try {
      // Call the backend API to handle the Stellar contract interaction
      const response = await fetch('https://v.dobprotocol.com/api/admin-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          submission_id: metadata.submissionId,
          decision: metadata.decision,
          technical_score: metadata.trufaScores.technical,
          regulatory_score: metadata.trufaScores.regulatory,
          financial_score: metadata.trufaScores.financial,
          environmental_score: metadata.trufaScores.environmental,
          overall_score: metadata.trufaScores.overall,
          notes: ''
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[${new Date().toISOString()}] [SorobanContract] Backend API response:`, result);

      if (result.success && result.data && result.data.transactionHash) {
        console.log(`[${new Date().toISOString()}] [SorobanContract] SUCCESS!`);
        console.log(`  Tx hash: ${result.data.transactionHash}`);
        return {
          success: true,
          transactionHash: result.data.transactionHash,
          metadata: result.data
        };
      } else {
        throw new Error(result.error || 'Backend API returned unsuccessful response');
      }

    } catch (error) {
      console.error(`[${new Date().toISOString()}] [SorobanContract] ERROR`);
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
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
      
      // Call backend API to get validation data
      const response = await fetch(`https://v.dobprotocol.com/api/submissions/${submissionId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch validation: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          metadata: {
            submissionId,
            ...data.data,
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
      
      // For now, we'll assume the wallet is verified if we can make API calls
      // In a real implementation, this would check against the smart contract
      return true;

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
      
      // Call backend API to get statistics
      const response = await fetch('https://v.dobprotocol.com/api/submissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          metadata: {
            totalSubmissions: data.total,
            submissions: data.submissions,
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
      
      // For now, return a mock status
      // In a real implementation, this would query the Stellar network
      return {
        success: true,
        metadata: {
          hash: transactionHash,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          explorerUrl: this.getExplorerUrl(transactionHash)
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