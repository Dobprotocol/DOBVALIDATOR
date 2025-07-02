"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Wallet, Loader2, Shield, Crown, CheckCircle, XCircle, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adminConfigService } from "@/lib/admin-config"
import { getAuthToken, isAuthenticated as checkAuth, logout } from "@/lib/auth"

// Temporarily disable complex components for build testing
// import { BackOfficeDashboard } from "@/components/backoffice-dashboard"
// import { StellarWallet } from "@/components/stellar-wallet"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Check authentication and admin status
    try {
      if (typeof window === 'undefined' || hasCheckedAuth) {
        setIsLoading(false)
        return
      }

      const authToken = getAuthToken()
      const publicKey = localStorage.getItem('stellarPublicKey')

      console.log('🔍 Dashboard auth check:')
      console.log('🔍 Auth token:', authToken)
      console.log('🔍 Public key:', publicKey)
      console.log('🔍 Is authenticated:', checkAuth())

      if (checkAuth() && publicKey) {
        const adminWallet = adminConfigService.getAdminWallet(publicKey)
        if (adminWallet) {
          setIsAuthenticated(true)
          setWalletAddress(publicKey)
          setAdminInfo(adminWallet)
        } else {
          // Not an admin, redirect to login
          console.log('❌ User not in admin list, redirecting to login')
          logout()
          setHasCheckedAuth(true)
          router.replace('/')
        }
      } else {
        // Not authenticated, redirect to login
        console.log('❌ User not authenticated, redirecting to login')
        setHasCheckedAuth(true)
        router.replace('/')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      setHasCheckedAuth(true)
      router.replace('/')
    } finally {
      setIsLoading(false)
      setHasCheckedAuth(true)
    }
  }, [router, hasCheckedAuth])

  const truncateAddress = (address: string | null) => {
    if (!address || typeof address !== 'string') return ''
    if (address.length < 8) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const handleDisconnect = () => {
    try {
      logout()
      router.replace('/')
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'VALIDATOR':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'REVIEWER':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'VALIDATOR':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'REVIEWER':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !adminInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p>Access denied. Redirecting to login...</p>
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
            <Badge className={getRoleColor(adminInfo.role)}>
              {getRoleIcon(adminInfo.role)}
              <span className="ml-1">{adminInfo.role.replace('_', ' ')}</span>
            </Badge>
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
                      <span className="text-sm font-medium">{adminInfo.name}</span>
                      <span className="text-xs text-muted-foreground">{truncateAddress(walletAddress)}</span>
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
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Welcome, {adminInfo.name}!</h2>
            <p className="text-muted-foreground">
              You are logged in as a {adminInfo.role.replace('_', ' ').toLowerCase()}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No submissions yet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No pending reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Devices</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No approved devices yet
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Permissions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Permissions</CardTitle>
              <CardDescription>
                Actions you can perform in the backoffice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {adminInfo.permissions.map((permission: string) => (
                  <Badge key={permission} variant="secondary">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you can perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span>Review Submissions</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Shield className="h-6 w-6" />
                  <span>Manage Devices</span>
                </Button>
                {adminInfo.role === 'SUPER_ADMIN' && (
                  <>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                      <User className="h-6 w-6" />
                      <span>Manage Users</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                      <Crown className="h-6 w-6" />
                      <span>System Settings</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 