"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BackOfficeDashboard } from "@/components/backoffice-dashboard"
import { Button } from "@/components/ui/button"
import { LogOut, User, Wallet } from "lucide-react"
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

  useEffect(() => {
    // Check if user is authenticated
    const publicKey = localStorage.getItem('stellarPublicKey')
    const cookie = document.cookie.includes('stellarPublicKey')
    
    console.log('Dashboard auth check:', {
      hasPublicKey: !!publicKey,
      hasCookie: cookie,
      timestamp: new Date().toISOString()
    })

    if (!publicKey || !cookie) {
      console.log('User not authenticated, redirecting to landing page...')
      // Clear any stale data
      localStorage.removeItem('stellarPublicKey')
      localStorage.removeItem('stellarWallet')
      document.cookie = 'stellarPublicKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // Force redirect to landing page
      window.location.href = '/'
    } else {
      console.log('User authenticated, showing dashboard...')
      setWalletAddress(publicKey)
      setIsLoading(false)
    }
  }, [router])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
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