"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { 
  authenticateWallet as authAuthenticateWallet, 
  getAuthToken, 
  isAuthenticated 
} from "@/lib/auth"
import { 
  walletStateManager, 
  connectWallet, 
  setWalletConnecting, 
  setWalletAuthenticating 
} from '@/lib/wallet-state'
import { adminConfigService } from "@/lib/admin-config"
import { apiService } from '@/lib/api-service'
import { TransactionBuilder, Account, Operation, Networks } from 'stellar-sdk'

const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const [signerWindow, setSignerWindow] = useState<Window | null>(null)

  // Check if already authenticated on mount
  useEffect(() => {
    if (typeof window === 'undefined' || hasCheckedAuth || isConnecting || isAuthenticating) return

    const authToken = getAuthToken()
    const publicKey = localStorage.getItem('stellarPublicKey')
    
    if (isAuthenticated() && publicKey) {
      // Check if user is admin
      const adminWallet = adminConfigService.getAdminWallet(publicKey)
      if (adminWallet) {
        console.log('✅ Already authenticated as admin, redirecting to dashboard')
        setHasCheckedAuth(true)
        router.replace('/dashboard')
      } else {
        console.log('❌ Wallet not in admin list, clearing auth')
        localStorage.removeItem('authToken')
        localStorage.removeItem('stellarPublicKey')
        setHasCheckedAuth(true)
      }
    } else {
      setHasCheckedAuth(true)
    }
  }, [router, hasCheckedAuth, isConnecting, isAuthenticating])

  // Handle messages from Simple Signer
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMessage = (e: MessageEvent) => {
      console.log('🔍 ALL MESSAGES - Origin:', e.origin)
      console.log('🔍 ALL MESSAGES - Data:', e.data)
      
      if (e.origin !== SIMPLE_SIGNER_URL) {
        console.log('❌ Message from wrong origin, ignoring')
        return
      }

      const messageEvent = e.data
      console.log('📨 Received message from Simple Signer:', messageEvent)
      console.log('📨 Message type:', messageEvent.type)
      console.log('📨 Message data:', messageEvent.message)

      if (messageEvent.type === 'onReady') {
        console.log('✅ Simple Signer is ready')
        // Don't do anything, just log
      } else if (messageEvent.type === 'onConnect') {
        const { publicKey: connectedPublicKey, walletType } = messageEvent.message
        console.log('✅ Wallet connected:', connectedPublicKey)
        console.log('✅ Wallet type:', walletType)

        // Check if wallet is in admin list
        const adminWallet = adminConfigService.getAdminWallet(connectedPublicKey)
        if (!adminWallet) {
          setError('This wallet is not authorized to access the backoffice.')
          setWalletConnecting(false)
          setIsConnecting(false)
          toast({
            title: "Access Denied",
            description: "This wallet is not authorized to access the backoffice.",
            variant: "destructive"
          })
          return
        }

        // Update local state
        localStorage.setItem('stellarPublicKey', connectedPublicKey)
        localStorage.setItem('stellarWallet', walletType || 'unknown')

        // Update global state
        connectWallet(connectedPublicKey, walletType || 'unknown')
        setWalletConnecting(false)
        setIsConnecting(false)

        // Start authentication flow
        startAuthenticationFlow(connectedPublicKey, walletType || 'unknown')
      } else if (messageEvent.type === 'onCancel') {
        if (isConnecting) {
          console.log('❌ Wallet connection cancelled')
          setWalletConnecting(false)
          setIsConnecting(false)
          setError(null)
          toast({
            title: "Connection cancelled",
            description: "Wallet connection was cancelled.",
            variant: "destructive"
          })
        }
      } else if (messageEvent.type === 'onSignTransaction') {
        console.log('✅ Transaction signed:', messageEvent.message)
        // This should be handled by the requestSignature function
      } else {
        console.log('❓ Unknown message type:', messageEvent.type)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [toast, isConnecting])

  const startAuthenticationFlow = async (walletAddress: string, walletType: string) => {
    if (isAuthenticating) {
      console.log('🔒 Authentication already in progress, skipping...')
      return
    }
    
    setWalletAuthenticating(true)
    setIsAuthenticating(true)
    setError(null)
    
    try {
      console.log('🚀 Starting authentication flow...')
      
      // Step 1: Request challenge
      console.log('📝 Step 1: Requesting challenge...')
      const challengeResponse = await apiService.generateChallenge(walletAddress)
      const { challenge } = challengeResponse
      console.log('✅ Received challenge:', challenge)

      // Add a small delay to ensure challenge is stored on server
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Request signature from wallet
      console.log('🔐 Step 2: Requesting signature...')
      const signature = await requestSignature(challenge, walletType, walletAddress, signerWindow)
      console.log('✅ Received signature:', signature)

      // Step 3: Verify signature and get JWT
      console.log('🔍 Step 3: Verifying signature...')
      await authAuthenticateWallet(walletAddress, signature, challenge)
      
      console.log('🎉 Authentication successful!')
      
      toast({
        title: "Authentication successful",
        description: `Connected as ${adminConfigService.getAdminWallet(walletAddress)?.role}`,
      })

      // Redirect to dashboard
      router.replace('/dashboard')
      
    } catch (error) {
      console.error('❌ Authentication failed:', error)
      setError('Authentication failed. Please try again.')
      toast({
        title: "Authentication failed",
        description: "Please try connecting your wallet again.",
        variant: "destructive"
      })
    } finally {
      setWalletAuthenticating(false)
      setIsAuthenticating(false)
    }
  }

  const requestSignature = async (challenge: string, walletType: string, walletAddress: string, signerWindow: Window | null): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔐 Creating challenge transaction...')
        
        // Create a minimal Stellar transaction with the challenge as memo
        const createChallengeTransaction = (challenge: string) => {
          try {
            // Truncate challenge to fit within Stellar's 28-byte memo limit
            const truncatedChallenge = challenge.substring(0, 28)
            console.log('🔐 Using truncated challenge for memo:', truncatedChallenge)
            
            // Use the provided wallet address as the source account
            if (!walletAddress) {
              throw new Error('No wallet address provided')
            }
            
            console.log('🔐 Using wallet as source account:', walletAddress)
            
            // Create a minimal transaction that won't actually execute
            // This is just for authentication purposes
            const transaction = new TransactionBuilder(
              new Account(walletAddress, '0'),
              {
                fee: '100',
                networkPassphrase: Networks.TESTNET
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
            console.error('❌ Failed to create challenge transaction:', error)
            reject(error)
            return null
          }
        }

        const xdrTransaction = createChallengeTransaction(challenge)
        if (!xdrTransaction) return

        console.log('🔐 Created XDR transaction:', xdrTransaction)
        
        // Validate XDR format
        if (!xdrTransaction.startsWith('AAAA') || xdrTransaction.length < 100) {
          console.error('❌ Invalid XDR transaction format')
          reject(new Error('Invalid XDR transaction format'))
          return
        }
        
        console.log('✅ XDR transaction validated successfully')
        
        // Open Simple Signer window for signing
        const signWindow = window.open(
          `${SIMPLE_SIGNER_URL}/sign/?xdr=${encodeURIComponent(xdrTransaction)}&description=DOB Validator Authentication Challenge`,
          'Sign_Window',
          'width=360, height=450'
        )

        if (!signWindow) {
          console.error('❌ Failed to open Simple Signer window')
          reject(new Error('Failed to open Simple Signer window'))
          return
        }

        console.log('✅ Simple Signer sign window opened')

        // Set up message handler for signature response
        const handleSignMessage = (e: MessageEvent) => {
          if (e.origin !== SIMPLE_SIGNER_URL) return

          const messageEvent = e.data
          console.log('📨 Signature message received:', messageEvent.type)

          if (messageEvent.type === 'onSign') {
            // Handle the onSign message format from documentation
            const { signedXDR, error } = messageEvent.message
            
            if (error) {
              console.error('❌ Signature error:', error)
              reject(new Error(`Signature failed: ${error}`))
              return
            }

            console.log('✅ Received signed XDR:', signedXDR)
            cleanup()
            resolve(signedXDR)
          } else if (messageEvent.type === 'onCancel') {
            console.log('❌ Signature cancelled by user')
            cleanup()
            reject(new Error('Signature was cancelled'))
          } else if (messageEvent.type === 'onError') {
            console.error('❌ Simple Signer error:', messageEvent.message)
            cleanup()
            reject(new Error(`Simple Signer error: ${messageEvent.message}`))
          }
        }

        // Add event listeners
        window.addEventListener('message', handleSignMessage)

        const cleanup = () => {
          console.log('🧹 Cleaning up signature listeners')
          window.removeEventListener('message', handleSignMessage)
          if (signWindow && !signWindow.closed) {
            signWindow.close()
          }
        }
        
        // Timeout after 30 seconds
        setTimeout(() => {
          console.log('⏰ Signature request timed out')
          cleanup()
          reject(new Error('Signature request timed out'))
        }, 30000)

      } catch (error) {
        console.error('❌ Error in requestSignature:', error)
        reject(error)
      }
    })
  }

  const handleConnectWallet = () => {
    if (isConnecting || isAuthenticating) return

    console.log('🚀 Starting wallet connection...')
    setError(null)
    setIsConnecting(true)
    setWalletConnecting(true)

    try {
      console.log('🔗 Opening Simple Signer window...')
      console.log('🔗 URL:', SIMPLE_SIGNER_URL)
      
      // Open Simple Signer in new window
      const newSignerWindow = window.open(
        'https://sign.bigger.systems/connect',
        'simple-signer',
        'width=400,height=600,scrollbars=yes,resizable=yes'
      )

      if (!newSignerWindow) {
        console.log('❌ Failed to open Simple Signer window')
        setError('Please allow popups to connect your wallet.')
        setIsConnecting(false)
        setWalletConnecting(false)
        toast({
          title: "Popup blocked",
          description: "Please allow popups to connect your wallet.",
          variant: "destructive"
        })
        return
      }

      // Store the window reference
      setSignerWindow(newSignerWindow)
      console.log('✅ Simple Signer window opened successfully')

      // Add a small delay before sending the message
      setTimeout(() => {
        // Send connect message
        const message = {
          type: 'connect',
          network: 'testnet'
        }

        console.log('📤 Sending connect message:', message)
        console.log('📤 Target origin:', SIMPLE_SIGNER_URL)
        newSignerWindow.postMessage(message, SIMPLE_SIGNER_URL)
      }, 1000)

    } catch (error) {
      console.error('❌ Error connecting wallet:', error)
      setError('Failed to connect wallet. Please try again.')
      setIsConnecting(false)
      setWalletConnecting(false)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Don't render anything while checking authentication
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">DOB Validator Backoffice</h1>
          <p className="text-muted-foreground">
            Connect your admin wallet to access the validator dashboard
          </p>
        </div>

        {/* Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-muted rounded-lg text-xs space-y-2">
            <div className="font-semibold">Debug Info:</div>
            <div>Connecting: {isConnecting ? 'Yes' : 'No'}</div>
            <div>Authenticating: {isAuthenticating ? 'Yes' : 'No'}</div>
            <div>Has Checked Auth: {hasCheckedAuth ? 'Yes' : 'No'}</div>
            <div>Error: {error || 'None'}</div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <Button 
            onClick={handleConnectWallet}
            disabled={isConnecting || isAuthenticating}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            {isConnecting || isAuthenticating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wallet className="h-5 w-5" />
            )}
            {isConnecting ? 'Connecting...' : isAuthenticating ? 'Authenticating...' : 'Connect Wallet'}
            {!isConnecting && !isAuthenticating && <ArrowRight className="h-4 w-4" />}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Only authorized admin wallets can access the backoffice
          </p>
        </div>
      </div>
    </div>
  )
}
