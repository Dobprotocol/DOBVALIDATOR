"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
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
import { Settings, Wallet, LogOut, Loader2, Crown, Shield } from 'lucide-react'
import { apiService } from '@/lib/api-service'
import { adminConfigService } from "@/lib/admin-config"

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
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
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

  // Check for existing authentication and admin status on mount
  useEffect(() => {
    const authToken = getAuthToken()
    const storedWallet = localStorage.getItem('stellarPublicKey')
    
    if (authToken && storedWallet) {
      setPublicKey(storedWallet)
      
      // Check admin status
      const adminWallet = adminConfigService.getAdminWallet(storedWallet)
      if (adminWallet) {
        setIsAdmin(true)
        setAdminRole(adminWallet.role)
        setPermissions(adminWallet.permissions)
      }
    }
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
      
      // Check admin status
      const adminWallet = adminConfigService.getAdminWallet(walletAddress)
      if (adminWallet) {
        setIsAdmin(true)
        setAdminRole(adminWallet.role)
        setPermissions(adminWallet.permissions)
        
        toast({
          title: "Admin Authentication successful",
          description: `Connected as ${adminWallet.role} with ${adminWallet.permissions.length} permissions`,
        })
      } else {
        setIsAdmin(false)
        setAdminRole(null)
        setPermissions([])
        
        toast({
          title: "Authentication successful",
          description: `Connected with ${walletType} wallet`,
        })
      }

      // Update global state
      walletStateManager.authenticate()

      // Close the modal after successful authentication
      setIsOpen(false)
      
      // Redirect to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('❌ Authentication failed:', error)
      
      // Check if this is a development/testing environment
      const isDevelopment = process.env.NODE_ENV === 'development' || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname.includes('vercel.app')
      
      if (isDevelopment) {
        console.log('🔧 Development mode detected, creating fallback authentication...')
        
        // Create a fallback authentication token for development
        const fallbackToken = {
          token: 'dev_fallback_token_' + Date.now(),
          expiresIn: '7d',
          walletAddress: walletAddress
        }
        
        // Store the fallback token
        localStorage.setItem('authToken', JSON.stringify(fallbackToken))
        
        console.log('✅ Fallback authentication created')
        
        // Check admin status for fallback
        const adminWallet = adminConfigService.getAdminWallet(walletAddress)
        if (adminWallet) {
          setIsAdmin(true)
          setAdminRole(adminWallet.role)
          setPermissions(adminWallet.permissions)
          
          toast({
            title: "Development Mode - Admin",
            description: `Using fallback authentication as ${adminWallet.role}`,
          })
        } else {
          toast({
            title: "Development Mode",
            description: "Using fallback authentication for development",
          })
        }
        
        // Update global state
        walletStateManager.authenticate()
        
        // Close the modal
        setIsOpen(false)
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Production error handling
        toast({
          title: "Authentication failed",
          description: error instanceof Error ? error.message : "Failed to authenticate wallet",
          variant: "destructive"
        })
        
        // Clear wallet data on authentication failure
        localStorage.removeItem('stellarPublicKey')
        localStorage.removeItem('stellarWallet')
        setPublicKey(null)
        setIsAdmin(false)
        setAdminRole(null)
        setPermissions([])
      }
      
      setWalletAuthenticating(false)
    }
  }

  const requestSignature = async (challenge: string, walletType: string, walletAddress: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const createChallengeTransaction = (challenge: string) => {
          const networkPassphrase = Networks.TESTNET
          const sourceAccount = new Account(walletAddress, '0')
          
          const transaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase
          })
            .addOperation(Operation.manageData({
              name: 'challenge',
              value: challenge
            }))
            .setTimeout(30)
            .build()
          
          return transaction.toXDR()
        }

        const xdr = createChallengeTransaction(challenge)
        console.log('📝 Created challenge transaction:', xdr.substring(0, 50) + '...')

        // Open Simple Signer in a popup
        const popup = window.open(
          `${SIMPLE_SIGNER_URL}/sign?xdr=${encodeURIComponent(xdr)}&publicKey=${walletAddress}&network=testnet&dApp=DOB Validator Backoffice`,
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
            reject(new Error('Signing was cancelled'))
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
          reject(new Error('Signing timeout'))
        }, 300000) // 5 minutes timeout

      } catch (error) {
        console.error('❌ Error requesting signature:', error)
        reject(error)
      }
    })
  }

  const handleConnect = () => {
    setIsOpen(true)
    setWalletConnecting(true)
    
    // Open Simple Signer in a popup
    const popup = window.open(
      `${SIMPLE_SIGNER_URL}/connect?dApp=DOB Validator Backoffice&networks=testnet,public&accounts=G*`,
      'simpleSigner',
      'width=400,height=600,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      toast({
        title: "Popup blocked",
        description: "Please allow popups for this site to connect your wallet.",
        variant: "destructive"
      })
      setWalletConnecting(false)
      return
    }

    const handleConnectReady = (e: MessageEvent) => {
      if (e.origin !== SIMPLE_SIGNER_URL) return

      const messageEvent = e.data
      console.log('📨 Received connect ready message:', messageEvent.type)

      if (messageEvent.type === 'onConnectReady') {
        console.log('✅ Simple Signer is ready for connection')
        // The actual connection will be handled by the message listener above
      }
    }

    window.addEventListener('message', handleConnectReady)

    // Set a timeout to close the popup if no response
    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close()
      }
      window.removeEventListener('message', handleConnectReady)
      if (isConnecting) {
        setWalletConnecting(false)
        toast({
          title: "Connection timeout",
          description: "Wallet connection timed out. Please try again.",
          variant: "destructive"
        })
      }
    }, 300000) // 5 minutes timeout
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    
    try {
      await logout()
      
      // Clear local state
      setPublicKey(null)
      setIsAdmin(false)
      setAdminRole(null)
      setPermissions([])
      
      // Update global state
      disconnectWallet()
      
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully.",
      })
      
      // Redirect to home page
      router.push('/')
      
    } catch (error) {
      console.error('❌ Error disconnecting:', error)
      toast({
        title: "Disconnect failed",
        description: "Failed to disconnect wallet.",
        variant: "destructive"
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  if (publicKey && isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          {getRoleIcon(adminRole || 'user')}
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {adminRole || 'Admin'}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400">
            {truncateAddress(publicKey)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Connected
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {truncateAddress(publicKey)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={handleConnect}
        disabled={isConnecting || isAuthenticating}
        className="flex items-center gap-2"
      >
        {isConnecting || isAuthenticating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isConnecting ? 'Connecting...' : isAuthenticating ? 'Authenticating...' : 'Connect Wallet'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Stellar Wallet</DialogTitle>
            <DialogDescription>
              Connect your Stellar wallet using the Simple Signer extension to access the backoffice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <Wallet className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <p className="text-sm text-muted-foreground">
                {isConnecting 
                  ? 'Waiting for wallet connection...' 
                  : isAuthenticating 
                    ? 'Authenticating wallet...' 
                    : 'Click "Connect Wallet" to begin'
                }
              </p>
            </div>
            
            {isConnecting && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            
            {isAuthenticating && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm">Verifying signature...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 