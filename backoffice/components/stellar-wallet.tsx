"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Loader2, CheckCircle, AlertCircle, Shield, Crown, LogOut, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminConfigService } from "@/lib/admin-config"
import { isFreighterInstalled, getFreighterPublicKey, isFreighterConnected } from '@/lib/stellar-sdk'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { TransactionBuilder, Networks, Operation, Account } from '@stellar/stellar-sdk'

interface AuthToken {
  token: string
  expiresIn: string | number
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
    setError(null)
    setSuccess(null)
    
    try {
      // First check if Freighter is installed
      if (!await isFreighterInstalled()) {
        throw new Error('Freighter wallet is not installed')
      }

      // Get the public key first
      const publicKey = await getFreighterPublicKey()
      if (!publicKey) {
        throw new Error('Could not get public key from wallet')
      }

      // Request challenge from backend
      const response = await fetch('http://localhost:3001/api/auth/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: publicKey })
      })

      if (!response.ok) {
        throw new Error('Failed to get challenge')
      }

      const { challenge } = await response.json()

      // Create transaction for signing
      const tx = new TransactionBuilder(
        new Account(publicKey, '0'),
        {
          fee: '100',
          networkPassphrase: Networks.TESTNET,
        }
      )
        .addOperation(Operation.manageData({
          name: 'DOB_VALIDATOR_AUTH',
          value: challenge,
        }))
        .setTimeout(30)
        .build()

      // Get XDR for signing
      const xdr = tx.toXDR()

      // Sign with Freighter
      const signature = await signTransactionWithFreighter(xdr)
      if (!signature) {
        throw new Error('Failed to sign transaction')
      }

      // Verify the signature
      const verifyResponse = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          challenge,
          signature
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
        walletAddress: publicKey,
        expiresAt: Date.now() + (parseInt(expiresIn.toString()) * 1000)
      }

      // Store in localStorage
      localStorage.setItem('authToken', JSON.stringify(authData))
      localStorage.setItem('stellarPublicKey', publicKey)

      // Store in cookies for middleware
      document.cookie = `authToken=${token}; path=/; max-age=${expiresIn}; SameSite=Lax`
      document.cookie = `stellarPublicKey=${publicKey}; path=/; max-age=${expiresIn}; SameSite=Lax`

      setAuthToken(authData)
      setWalletAddress(publicKey)
      setIsAuthenticated(true)

      // Check if wallet is admin
      const adminWallet = adminConfigService.getAdminWallet(publicKey)
      if (adminWallet) {
        setIsAdmin(true)
        setAdminRole(adminWallet.role)
        setPermissions(adminWallet.permissions)
        setSuccess(`Welcome back, ${adminWallet.role}!`)
      } else {
        setError('This wallet does not have admin access.')
        // Clear auth data since non-admin wallets shouldn't access backoffice
        localStorage.removeItem('authToken')
        localStorage.removeItem('stellarPublicKey')
        setIsAuthenticated(false)
        setWalletAddress(null)
        setAuthToken(null)
      }

    } catch (error) {
      console.error('Error connecting wallet:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('stellarPublicKey')
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'stellarPublicKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setIsAuthenticated(false)
    setWalletAddress(null)
    setAuthToken(null)
    setIsAdmin(false)
    setAdminRole(null)
    setPermissions([])
    setError('Wallet Disconnected')
    setSuccess(null)
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden md:inline">{truncateAddress(walletAddress)}</span>
            {isAdmin && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">{adminRole}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin Info</DropdownMenuLabel>
              <DropdownMenuItem disabled>
                Role: {adminRole}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Permissions: {permissions.length}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnectWallet}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>Connect your Stellar wallet to access the admin dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
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