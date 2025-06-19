"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { 
  authenticateWallet, 
  isAuthenticated, 
  logout as authLogout,
  getAuthToken 
} from "@/lib/auth"

const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

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
  const { toast } = useToast()
  const router = useRouter()

  // Load saved public key and check authentication on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('stellarPublicKey')
    if (savedKey) {
      setPublicKey(savedKey)
      console.log('Loaded saved wallet address:', savedKey)
      
      // Check if user is authenticated
      if (isAuthenticated()) {
        console.log('User is authenticated, checking profile...')
        checkUserProfile()
      } else {
        console.log('User not authenticated, need to sign challenge...')
        // User has wallet but no valid JWT - they need to re-authenticate
        setPublicKey(null)
        localStorage.removeItem('stellarPublicKey')
        localStorage.removeItem('stellarWallet')
      }
    }
  }, [])

  // Handle messages from Simple Signer
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Reject messages that are not coming from Simple Signer
      if (e.origin !== SIMPLE_SIGNER_URL) {
        return
      }

      const messageEvent = e.data

      if (messageEvent.type === 'onConnect') {
        const publicKey = messageEvent.message.publicKey
        const wallet = messageEvent.message.wallet
        
        console.log('Connected wallet details:', {
          address: publicKey,
          walletType: wallet,
          timestamp: new Date().toISOString()
        })
        
        // Store the public key and wallet type
        localStorage.setItem('stellarPublicKey', publicKey)
        localStorage.setItem('stellarWallet', wallet)
        setPublicKey(publicKey)
        setIsOpen(false)
        setIsConnecting(false)
        
        // Start authentication flow
        startAuthenticationFlow(publicKey, wallet)
      } else if (messageEvent.type === 'onCancel') {
        setIsConnecting(false)
        console.log('Wallet connection cancelled by user')
        toast({
          title: "Connection cancelled",
          description: "Wallet connection was cancelled.",
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [toast])

  const startAuthenticationFlow = async (walletAddress: string, walletType: string) => {
    setIsAuthenticating(true)
    
    try {
      console.log('Starting authentication flow...')
      
      // Step 1: Request challenge
      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!challengeResponse.ok) {
        throw new Error('Failed to get authentication challenge')
      }

      const { challenge } = await challengeResponse.json()
      console.log('Received challenge:', challenge)

      // Step 2: Request signature from wallet
      const signature = await requestSignature(challenge, walletType)
      console.log('Received signature:', signature)

      // Step 3: Verify signature and get JWT
      await authenticateWallet(walletAddress, signature, challenge)
      
      console.log('Authentication successful!')
      toast({
        title: "Authentication successful",
        description: `Successfully authenticated with ${walletType} wallet`,
      })

      // Step 4: Check user profile
      await checkUserProfile()
      
    } catch (error) {
      console.error('Authentication failed:', error)
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Failed to authenticate wallet",
        variant: "destructive"
      })
      
      // Clear wallet data on authentication failure
      localStorage.removeItem('stellarPublicKey')
      localStorage.removeItem('stellarWallet')
      setPublicKey(null)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const requestSignature = async (challenge: string, walletType: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('Requesting signature for challenge:', challenge)
      
      // For now, we'll use a mock signature since Simple Signer expects XDR transactions
      // In production, you would create a proper Stellar transaction
      console.log('Using mock signature for development...')
      
      // Simulate signature request with timeout
      setTimeout(() => {
        // Mock signature - in production this would be a real signature
        const mockSignature = `mock_signature_${Date.now()}_${Math.random().toString(36).substring(2)}`
        console.log('Generated mock signature:', mockSignature)
        resolve(mockSignature)
      }, 2000) // 2 second delay to simulate signing process
      
      // TODO: Implement proper XDR transaction signing
      // This would involve:
      // 1. Creating a Stellar transaction with the challenge as memo
      // 2. Converting to XDR format
      // 3. Sending to Simple Signer for signing
      // 4. Extracting the signature from the signed transaction
      
      /*
      // Example of proper XDR transaction signing (for future implementation):
      const signWindow = window.open(
        `${SIMPLE_SIGNER_URL}/sign`,
        'Sign_Window',
        'width=360, height=450'
      )

      const handleSignMessage = (e: MessageEvent) => {
        if (e.origin !== SIMPLE_SIGNER_URL) return

        const messageEvent = e.data

        if (messageEvent.type === 'onSign') {
          const signedXdr = messageEvent.message.signedXDR
          console.log('Received signed XDR:', signedXdr)
          window.removeEventListener('message', handleSignMessage)
          resolve(signedXdr)
        } else if (messageEvent.type === 'onCancel') {
          window.removeEventListener('message', handleSignMessage)
          reject(new Error('Signature request cancelled'))
        }
      }

      window.addEventListener('message', handleSignMessage)

      // Configure signature request
      const configureSignature = (e: MessageEvent) => {
        if (
          e.origin === SIMPLE_SIGNER_URL &&
          e.data.type === 'onReady' &&
          e.data.page === 'sign'
        ) {
          console.log('Simple Signer ready, requesting signature...')
          
          // Create XDR transaction with challenge as memo
          const xdrTransaction = createChallengeTransaction(challenge)
          
          signWindow?.postMessage(
            { 
              xdr: xdrTransaction,
              wallets: [walletType]
            },
            SIMPLE_SIGNER_URL
          )
          window.removeEventListener('message', configureSignature)
        }
      }

      window.addEventListener('message', configureSignature)
      */
    })
  }

  const checkUserProfile = async () => {
    try {
      // Use authenticated request to check profile
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()?.token}`
        }
      })

      if (response.ok) {
        // User has a profile, redirect to devices dashboard
        router.push('/dashboard')
      } else if (response.status === 404) {
        // User doesn't have a profile, redirect to profile creation
        router.push('/profile')
      } else {
        throw new Error('Failed to check profile')
      }
    } catch (error) {
      console.error('Error checking user profile:', error)
      // On error, redirect to profile creation as a fallback
      router.push('/profile')
    }
  }

  const handleConnect = () => {
    setIsConnecting(true)
    console.log('Initiating wallet connection...')
    const connectWindow = window.open(
      `${SIMPLE_SIGNER_URL}/connect`,
      'Connect_Window',
      'width=360, height=450'
    )

    // Configure available wallets
    window.addEventListener('message', (e) => {
      if (
        e.origin === SIMPLE_SIGNER_URL &&
        e.data.type === 'onReady' &&
        e.data.page === 'connect'
      ) {
        console.log('Simple Signer ready, configuring available wallets...')
        connectWindow?.postMessage(
          { wallets: ['freighter', 'xbull', 'albedo'] },
          SIMPLE_SIGNER_URL
        )
      }
    })
  }

  const handleDisconnect = () => {
    console.log('Disconnecting wallet:', publicKey)
    
    // Clear all wallet-related data and authentication
    authLogout()
    setPublicKey(null)
    setIsOpen(false)
    
    // Dispatch event for other components to react to wallet disconnection
    window.dispatchEvent(new Event('walletStateChange'))
    
    console.log('Wallet disconnected successfully')
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    })

    // Redirect to home page
    router.push('/')
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        disabled={isAuthenticating}
      >
        {isAuthenticating ? "Authenticating..." : 
         publicKey ? truncateAddress(publicKey) : "Connect Wallet"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              You will be redirected to sign with a Stellar-compatible web3 wallet (Freighter, xBull, or Albedo) to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {publicKey ? (
              <Button
                onClick={handleDisconnect}
                className="w-full"
                variant="destructive"
              >
                Disconnect Wallet
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="w-full"
                disabled={isConnecting || isAuthenticating}
              >
                {isConnecting ? "Connecting..." : 
                 isAuthenticating ? "Authenticating..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 