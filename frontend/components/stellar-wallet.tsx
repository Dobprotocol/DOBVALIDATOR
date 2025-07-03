"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { 
  authenticateWallet as authAuthenticateWallet, 
  getAuthToken, 
  logout 
} from "@/lib/auth"
import { 
  walletStateManager, 
  connectWallet, 
  disconnectWallet, 
  setWalletConnecting, 
  setWalletAuthenticating 
} from '@/lib/wallet-state'
import { 
  TransactionBuilder, 
  Account, 
  Networks, 
  Operation, 
  Asset, 
  Memo,
  BASE_FEE 
} from '@stellar/stellar-sdk'
import { Settings, Wallet, LogOut, Loader2, AlertTriangle, HelpCircle } from 'lucide-react'
import { apiService } from '@/lib/api-service'
import { BrowserCompatibilityWarning } from './browser-compatibility-warning'

const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

// Environment-based network configuration
const getNetworkConfig = () => {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet'
  return {
    network,
    passphrase: network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC,
    explorerUrl: network === 'testnet' 
      ? 'https://stellar.expert/explorer/testnet'
      : 'https://stellar.expert/explorer/public'
  }
}

// Helper function to truncate wallet address
function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function StellarWallet() {
  const [isOpen, setIsOpen] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showCompatibilityWarning, setShowCompatibilityWarning] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Subscribe to wallet state changes
  useEffect(() => {
    const unsubscribe = walletStateManager.subscribe((state) => {
      setPublicKey(state.publicKey)
      setIsConnecting(state.isConnecting)
      setIsAuthenticating(state.isAuthenticating)
    })

    return unsubscribe
  }, [])

  // Handle messages from Simple Signer
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== SIMPLE_SIGNER_URL) return

      const messageEvent = e.data
      console.log('📨 Received message from Simple Signer:', messageEvent.type)

      if (messageEvent.type === 'onConnect') {
        const { publicKey: connectedPublicKey, walletType } = messageEvent.message
        console.log('Connected wallet details:', {
          address: connectedPublicKey,
          walletType,
          timestamp: new Date().toISOString()
        })

        // Use a fallback wallet type if undefined
        const resolvedWalletType = walletType || 'unknown'
        console.log('Resolved wallet type:', resolvedWalletType)

        // Update local state
        setPublicKey(connectedPublicKey)
        localStorage.setItem('stellarPublicKey', connectedPublicKey)
        localStorage.setItem('stellarWallet', resolvedWalletType)

        // Update global state
        connectWallet(connectedPublicKey, resolvedWalletType)
        setWalletConnecting(false)

        // Start authentication flow
        startAuthenticationFlow(connectedPublicKey, resolvedWalletType)
      } else if (messageEvent.type === 'onCancel') {
        // Only handle cancel if we're in connecting state
        if (isConnecting) {
          console.log('Wallet connection cancelled')
          setWalletConnecting(false)
          toast({
            title: "Connection cancelled",
            description: "Wallet connection was cancelled.",
            variant: "destructive"
          })
        } else {
          console.log('Ignoring cancel message - not in connecting state')
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [toast, isConnecting])

  const startAuthenticationFlow = async (walletAddress: string, walletType: string) => {
    // Prevent multiple simultaneous authentication attempts
    if (isAuthenticating) {
      console.log('🔒 Authentication already in progress, skipping...')
      return
    }
    
    setWalletAuthenticating(true)
    
    try {
      console.log('🚀 Starting authentication flow...')
      console.log('🔍 Wallet address:', walletAddress)
      console.log('🔍 Wallet type:', walletType)
      
      // Step 1: Request challenge
      console.log('📝 Step 1: Requesting challenge...')
      const challengeResponse = await apiService.generateChallenge(walletAddress)

      const { challenge } = challengeResponse
      console.log('✅ Received challenge:', challenge)

      // Add a small delay to ensure challenge is stored on server
      console.log('⏳ Waiting for challenge to be stored...')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Request signature from wallet
      console.log('🔐 Step 2: Requesting signature...')
      const signature = await requestSignature(challenge, walletType, walletAddress)
      console.log('✅ Received signature:', signature)

      // Step 3: Verify signature and get JWT
      console.log('🔍 Step 3: Verifying signature...')
      await authAuthenticateWallet(walletAddress, signature, challenge)
      
      console.log('🎉 Authentication successful!')
      toast({
        title: "Authentication successful",
        description: `Successfully authenticated with ${walletType} wallet`,
      })

      // Update global state
      walletStateManager.authenticate()

      // Close the modal after successful authentication
      setIsOpen(false)
      
    } catch (error) {
      console.error('❌ Authentication failed:', error)
      
      // Authentication failed - show error and clear wallet data
      console.log('❌ Authentication failed:', error)
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Failed to authenticate wallet. Please try again with a valid signature.",
        variant: "destructive"
      })
      
      // Clear wallet data on authentication failure
      localStorage.removeItem('stellarPublicKey')
      localStorage.removeItem('stellarWallet')
      setPublicKey(null)
      disconnectWallet()
    } finally {
      setWalletAuthenticating(false)
    }
  }

  const requestSignature = async (challenge: string, walletType: string, walletAddress: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('Requesting signature for challenge:', challenge)
      
      // Get network configuration
      const networkConfig = getNetworkConfig()
      
      // Create a minimal Stellar transaction with the challenge as memo
      const createChallengeTransaction = (challenge: string) => {
        try {
          // Truncate challenge to fit within Stellar's 28-byte memo limit
          const truncatedChallenge = challenge.substring(0, 28)
          console.log('Using truncated challenge for memo:', truncatedChallenge)
          
          // Use the provided wallet address as the source account
          if (!walletAddress) {
            throw new Error('No wallet address provided')
          }
          
          console.log('Using wallet as source account:', walletAddress)
          console.log('Using network:', networkConfig.network)
          
          // Create a minimal transaction that won't actually execute
          // This is just for authentication purposes
          const transaction = new TransactionBuilder(
            new Account(walletAddress, '0'),
            {
              fee: BASE_FEE,
              networkPassphrase: networkConfig.passphrase
            }
          )
          .addOperation(
            Operation.manageData({
              name: 'auth_challenge',
              value: truncatedChallenge
            })
          )
          .setTimeout(30)
          .build()
          
          return transaction.toXDR()
        } catch (error) {
          console.error('Failed to create challenge transaction:', error)
          reject(error)
          return null
        }
      }

      const xdrTransaction = createChallengeTransaction(challenge)
      if (!xdrTransaction) return

      console.log('Created XDR transaction:', xdrTransaction)
      
      // Validate XDR format
      if (!xdrTransaction.startsWith('AAAA') || xdrTransaction.length < 100) {
        console.error('❌ Invalid XDR transaction format')
        reject(new Error('Invalid XDR transaction format'))
        return
      }
      
      console.log('✅ XDR transaction validated successfully')

      // Open Simple Signer window for signing
      const signWindow = window.open(
        `${SIMPLE_SIGNER_URL}/sign/?xdr=${encodeURIComponent(xdrTransaction)}&description=DOB Validator Authentication Challenge (${networkConfig.network})`,
        'Sign_Window',
        'width=360, height=450'
      )

      if (!signWindow) {
        console.error('Failed to open Simple Signer window')
        reject(new Error('Failed to open Simple Signer window'))
        return
      }

      // Set up message handler for signature response
      const handleSignMessage = (e: MessageEvent) => {
        if (e.origin !== SIMPLE_SIGNER_URL) return

        const messageEvent = e.data
        console.log('📨 Signature message received:', messageEvent.type)

        if (messageEvent.type === 'onSign') {
          // Handle the onSign message format from documentation
          const { signedXDR, error } = messageEvent.message
          
          if (error) {
            console.error('Signature error:', error)
            reject(new Error(`Signature failed: ${error}`))
            return
          }

          console.log('✅ Received signed XDR:', signedXDR)
          resolve(signedXDR)
        } else if (messageEvent.type === 'onCancel') {
          console.log('Signature cancelled by user')
          reject(new Error('Signature was cancelled'))
        } else if (messageEvent.type === 'onError') {
          console.error('Simple Signer error:', messageEvent.message)
          reject(new Error(`Simple Signer error: ${messageEvent.message}`))
        }
      }

      // Add event listeners
      window.addEventListener('message', handleSignMessage)

      // Clean up event listeners after a timeout
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handleSignMessage)
        signWindow.close()
        reject(new Error('Signature request timed out'))
      }, 30000) // 30 second timeout

      // Clean up on resolve/reject
      const cleanup = () => {
        clearTimeout(timeout)
        window.removeEventListener('message', handleSignMessage)
        signWindow.close()
      }

      // Override resolve/reject to include cleanup
      const originalResolve = resolve
      const originalReject = reject
      resolve = (value) => {
        cleanup()
        originalResolve(value)
      }
      reject = (error) => {
        cleanup()
        originalReject(error)
      }
    })
  }

  const handleConnect = () => {
    setWalletConnecting(true)
    setConnectionError(null)
    console.log('Initiating wallet connection...')
    
    const connectWindow = window.open(
      `${SIMPLE_SIGNER_URL}/connect`,
      'Connect_Window',
      'width=360, height=450'
    )

    if (!connectWindow) {
      console.error('Failed to open Simple Signer connect window')
      setWalletConnecting(false)
      setConnectionError('popup-blocked')
      setShowCompatibilityWarning(true)
      toast({
        title: "Connection failed",
        description: "Failed to open wallet connection window. Please check your popup blocker.",
        variant: "destructive"
      })
      return
    }

    console.log('Simple Signer connect window opened successfully')

    // Configure available wallets
    const handleConnectReady = (e: MessageEvent) => {
      if (
        e.origin === SIMPLE_SIGNER_URL &&
        e.data.type === 'onReady' &&
        e.data.page === 'connect'
      ) {
        console.log('Simple Signer ready, configuring available wallets...')
        try {
          connectWindow.postMessage(
            { wallets: ['freighter', 'xbull', 'albedo'] },
            SIMPLE_SIGNER_URL
          )
          console.log('Wallet configuration sent to Simple Signer')
        } catch (error) {
          console.error('Failed to send wallet configuration:', error)
        }
      }
    }

    window.addEventListener('message', handleConnectReady)

    // Clean up event listener after a timeout
    setTimeout(() => {
      window.removeEventListener('message', handleConnectReady)
      if (connectWindow && !connectWindow.closed) {
        connectWindow.close()
      }
    }, 30000)
  }

  const handleDisconnect = async () => {
    console.log('🔌 Disconnecting wallet:', publicKey)
    
    // Set disconnecting flag
    setIsDisconnecting(true)
    
    // Clear all wallet-related data and authentication
    logout()
    disconnectWallet()
    setIsOpen(false)
    
    // Clear all localStorage data to ensure clean state
    localStorage.removeItem('authToken')
    localStorage.removeItem('stellarPublicKey')
    localStorage.removeItem('stellarWallet')
    localStorage.removeItem('userProfile')
    
    // Clear any session storage as well
    sessionStorage.clear()
    
    // Call the global clear function to ensure everything is cleared
    if (typeof window !== 'undefined' && (window as any).clearAllLocalStorage) {
      (window as any).clearAllLocalStorage()
    }
    
    // Dispatch event for other components to react to wallet disconnection
    window.dispatchEvent(new Event('walletStateChange'))
    
    console.log('✅ Wallet disconnected successfully')
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    })

    // Force a page reload to clear any remaining state and prevent infinite loops
    window.location.href = '/'
  }

  // Get network info for display
  const networkConfig = getNetworkConfig()
  const networkDisplay = networkConfig.network === 'testnet' ? 'Testnet' : 'Mainnet'

  return (
    <>
      {/* Browser Compatibility Warning */}
      {showCompatibilityWarning && (
        <div className="mb-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Wallet Connection Issue</AlertTitle>
            <AlertDescription className="text-red-700">
              {connectionError === 'popup-blocked' 
                ? "Your browser blocked the wallet connection popup. This is a common security feature."
                : "There was an issue connecting to your wallet."
              }
              <Button 
                variant="link" 
                className="p-0 h-auto text-red-700 underline ml-1"
                onClick={() => setShowCompatibilityWarning(false)}
              >
                Learn how to fix this
              </Button>
            </AlertDescription>
          </Alert>
          <BrowserCompatibilityWarning 
            showOnConnect={true}
            onDismiss={() => setShowCompatibilityWarning(false)}
          />
        </div>
      )}

      <Button
        onClick={publicKey ? () => setIsOpen(true) : handleConnect}
        variant="outline"
        disabled={isAuthenticating || isConnecting}
      >
        {isAuthenticating ? "Authenticating..." : 
         isConnecting ? "Connecting..." :
         publicKey ? (
           <div className="flex items-center gap-2">
             <span>{truncateAddress(publicKey)}</span>
             <span className="text-xs text-muted-foreground">({networkDisplay})</span>
           </div>
         ) : "Connect Wallet"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallet Settings</DialogTitle>
            <DialogDescription>
              Manage your connected wallet and network settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {publicKey && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Wallet Address:</span>
                  <span className="text-sm font-mono">{publicKey}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network:</span>
                  <span className="text-sm">{networkDisplay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Explorer:</span>
                  <a 
                    href={`${networkConfig.explorerUrl}/account/${publicKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Account
                  </a>
                </div>
              </div>
            )}
            <Button
              onClick={handleDisconnect}
              className="w-full"
              variant="destructive"
              disabled={isDisconnecting}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect Wallet"}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 