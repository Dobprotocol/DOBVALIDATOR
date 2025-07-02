"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BackOfficeDashboard } from "@/components/backoffice-dashboard"
import { StellarWallet } from "@/components/stellar-wallet"
import { Button } from "@/components/ui/button"
import { LogOut, User, Wallet, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  useEffect(() => {
    // Check authentication status with better error handling
    try {
      const authToken = localStorage.getItem('authToken')
      const publicKey = localStorage.getItem('stellarPublicKey')

      console.log('🔍 Dashboard auth check:', {
        hasAuthToken: !!authToken,
        hasPublicKey: !!publicKey,
        authTokenLength: typeof authToken === 'string' ? authToken.length : 'not a string',
        publicKeyValue: publicKey,
        timestamp: new Date().toISOString()
      })

      if (!authToken) {
        console.log('❌ No authentication token found...')
        setIsAuthenticated(false)
        setAuthCheckComplete(true)
        return
      }

      // Validate that authToken is a valid string before parsing
      if (typeof authToken !== 'string' || authToken.trim() === '') {
        console.log('❌ Invalid auth token format (not a string or empty)')
        localStorage.removeItem('authToken')
        setIsAuthenticated(false)
        setAuthCheckComplete(true)
        return
      }

      let tokenData
      try {
        tokenData = JSON.parse(authToken)
        console.log('🔍 Token data:', tokenData)
      } catch (parseError) {
        console.error('❌ Error parsing auth token JSON:', parseError)
        console.log('❌ Raw auth token value:', authToken)
        
        // Check if it's a plain string token (fallback for old format)
        if (authToken.startsWith('dev_fallback_token_') || authToken.startsWith('mock_access_token_')) {
          console.log('🔄 Detected plain string token, creating fallback structure')
          tokenData = {
            token: authToken,
            expiresIn: '7d',
            walletAddress: publicKey || 'unknown'
          }
        } else {
          console.log('❌ Invalid token format, clearing data')
          localStorage.removeItem('authToken')
          setIsAuthenticated(false)
          setAuthCheckComplete(true)
          return
        }
      }

      // Validate token structure
      if (!tokenData || typeof tokenData !== 'object') {
        console.log('❌ Invalid token data structure')
        localStorage.removeItem('authToken')
        setIsAuthenticated(false)
        setAuthCheckComplete(true)
        return
      }

      // Check if token is expired (handle both expiresAt and expiresIn formats)
      const now = Date.now()
      let isExpired = false
      
      if (tokenData.expiresAt) {
        // Old format with expiresAt timestamp
        isExpired = now > tokenData.expiresAt
      } else if (tokenData.expiresIn) {
        // New format with expiresIn duration - assume 7 days for now
        // For development tokens, they don't expire
        if (tokenData.token && (tokenData.token.startsWith('dev_fallback_token_') || tokenData.token.startsWith('mock_access_token_'))) {
          isExpired = false
        } else {
          // For real tokens, we'd need to calculate expiration
          // For now, assume they're valid
          isExpired = false
        }
      } else {
        // No expiration info, assume valid
        isExpired = false
      }
      
      console.log('🔍 Token validation:', {
        expiresAt: tokenData.expiresAt,
        expiresIn: tokenData.expiresIn,
        now,
        isExpired,
        tokenType: tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'undefined'
      })
      
      if (isExpired) {
        console.log('❌ Token expired, clearing data...')
        // Clear expired data
        localStorage.removeItem('authToken')
        localStorage.removeItem('stellarPublicKey')
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'stellarPublicKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        
        // Force re-render
        setAuthCheckComplete(true)
        return
      } else {
        console.log('✅ User authenticated, showing dashboard...')
        setIsAuthenticated(true)
        // Use walletAddress from token if available, otherwise use publicKey
        setWalletAddress(tokenData.walletAddress || publicKey)
        setAuthCheckComplete(true)
      }
    } catch (error) {
      console.error('❌ Unexpected error in authentication check:', error)
      // Clear potentially corrupted data
      localStorage.removeItem('authToken')
      localStorage.removeItem('stellarPublicKey')
      setIsAuthenticated(false)
      setAuthCheckComplete(true)
    }
  }, [])

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const handleDisconnect = () => {
    console.log('=== Starting Wallet Disconnection from Header ===')
    try {
      // Clear all wallet-related data
      console.log('Clearing localStorage...')
      localStorage.removeItem('stellarPublicKey')
      localStorage.removeItem('stellarWallet')
      localStorage.removeItem('authToken')
      
      console.log('Removing cookie...')
      document.cookie = 'stellarPublicKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      console.log('Redirecting to landing page...')
      // Force a hard redirect to ensure clean state
      window.location.href = '/'
      
      console.log('=== Wallet Disconnection Complete ===')
    } catch (error) {
      console.error('Error during wallet disconnection:', error)
    }
  }

  // Show loading while checking authentication
  if (!authCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show wallet connection if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <StellarWallet />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">DOB Validator Backoffice</h1>
          </div>
          
          {/* Wallet Info and Disconnect */}
          {walletAddress && (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">{truncateAddress(walletAddress)}</span>
                    <span className="sm:hidden">Wallet</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Wallet Information</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Admin User</span>
                      <span className="text-xs text-muted-foreground">{walletAddress}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Disconnect Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>
      <main className="container py-6">
        <BackOfficeDashboard />
      </main>
    </div>
  )
} 