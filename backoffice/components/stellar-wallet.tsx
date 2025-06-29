"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Loader2, CheckCircle, AlertCircle, Shield, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminConfigService } from "@/lib/admin-config"

// TypeScript declaration for Simple Signer
declare global {
  interface Window {
    simpleSigner: {
      connect: (options: {
        networks: string[]
        accounts: string[]
        dApp: string
      }) => Promise<{
        success: boolean
        publicKey?: string
        error?: string
      }>
      sign: (options: {
        xdr: string
        publicKey: string
        network: string
      }) => Promise<{
        success: boolean
        signedXDR?: string
        error?: string
      }>
    }
  }
}

interface AuthToken {
  token: string
  expiresIn: string
  walletAddress: string
  expiresAt: number
}

export function StellarWallet() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [authToken, setAuthToken] = useState<AuthToken | null>(null)
  const { toast } = useToast()

  // Check for existing authentication on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('authToken')
    const storedWallet = localStorage.getItem('stellarPublicKey')
    
    if (storedAuth && storedWallet) {
      try {
        const authData = JSON.parse(storedAuth)
        const now = Date.now()
        
        // Check if token is still valid
        if (authData.expiresAt > now) {
          setAuthToken(authData)
          setWalletAddress(storedWallet)
          setIsAuthenticated(true)
          
          // Check admin status
          const adminWallet = adminConfigService.getAdminWallet(storedWallet)
          if (adminWallet) {
            setIsAdmin(true)
            setAdminRole(adminWallet.role)
            setPermissions(adminWallet.permissions)
          }
        } else {
          // Token expired, clear storage
          localStorage.removeItem('authToken')
          localStorage.removeItem('stellarPublicKey')
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('stellarPublicKey')
      }
    }
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)
    
    try {
      // Check if Simple Signer is available
      if (typeof window !== 'undefined' && !window.simpleSigner) {
        throw new Error('Simple Signer not available. Please install the Simple Signer extension.')
      }

      // Request wallet connection
      const response = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: null }) // Will be provided by wallet
      })

      if (!response.ok) {
        throw new Error('Failed to get challenge')
      }

      const { challenge } = await response.json()

      // Request wallet connection through Simple Signer
      const connectResult = await window.simpleSigner.connect({
        networks: ['testnet', 'public'],
        accounts: ['G*'],
        dApp: 'DOB Validator Backoffice'
      })

      if (!connectResult.success) {
        throw new Error('Failed to connect wallet: ' + connectResult.error)
      }

      const walletAddress = connectResult.publicKey

      // Request signature for the challenge
      const signResult = await window.simpleSigner.sign({
        xdr: challenge,
        publicKey: walletAddress,
        network: 'testnet'
      })

      if (!signResult.success) {
        throw new Error('Failed to sign challenge: ' + signResult.error)
      }

      // Verify the signature
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          challenge,
          signature: signResult.signedXDR
        })
      })

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify signature')
      }

      const { token, expiresIn } = await verifyResponse.json()

      // Store authentication data
      const authData: AuthToken = {
        token,
        expiresIn,
        walletAddress: walletAddress,
        expiresAt: Date.now() + (parseInt(expiresIn.toString()) * 1000)
      }

      // Store in localStorage
      localStorage.setItem('authToken', JSON.stringify(authData))
      localStorage.setItem('stellarPublicKey', walletAddress)

      // Store in cookies for middleware
      document.cookie = `authToken=${token}; path=/; max-age=${expiresIn}; SameSite=Lax`
      document.cookie = `stellarPublicKey=${walletAddress}; path=/; max-age=${expiresIn}; SameSite=Lax`

      setAuthToken(authData)
      setWalletAddress(walletAddress)
      setIsAuthenticated(true)

      // Check admin status
      const adminWallet = adminConfigService.getAdminWallet(walletAddress)
      if (adminWallet) {
        setIsAdmin(true)
        setAdminRole(adminWallet.role)
        setPermissions(adminWallet.permissions)
      } else {
        setIsAdmin(false)
        setAdminRole(null)
        setPermissions([])
      }

      toast({
        title: "Wallet Connected",
        description: `Connected as ${adminWallet ? adminWallet.role : 'User'}`,
      })

      // Use router.push instead of window.location.href to avoid page reload
      router.push('/dashboard')
    } catch (error) {
      console.error('Wallet connection error:', error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    // Clear localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('stellarPublicKey')

    // Clear cookies
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'stellarPublicKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    // Clear state
    setAuthToken(null)
    setWalletAddress(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    setAdminRole(null)
    setPermissions([])

    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from your wallet",
    })

    // Use router.push instead of window.location.href
    router.push('/')
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'VALIDATOR':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'REVIEWER':
        return <Shield className="h-4 w-4 text-green-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  if (isAuthenticated && walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            You are authenticated and can access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="font-mono text-sm">{truncateAddress(walletAddress)}</span>
              </div>
              <Button variant="outline" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Admin Status</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    {getRoleIcon(adminRole || '')}
                    <span className="text-sm text-green-600 font-medium">
                      {adminRole?.replace('_', ' ')}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-red-600 font-medium">Not Admin</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Stellar Wallet
        </CardTitle>
        <CardDescription>
          Connect your Stellar wallet to access the backoffice dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 