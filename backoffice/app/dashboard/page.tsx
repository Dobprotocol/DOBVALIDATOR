"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Wallet, Loader2, Shield, Crown, CheckCircle, XCircle, Clock, FileText, BarChart3, Settings, Home } from "lucide-react"
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
import { apiService, Submission, SubmissionsStats } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { SimpleSidebar, SimpleSidebarContent, SimpleSidebarHeader, SimpleSidebarMenu, SimpleSidebarMenuButton } from "@/components/ui/simple-sidebar"

// Temporarily disable complex components for build testing
// import { BackOfficeDashboard } from "@/components/backoffice-dashboard"
// import { StellarWallet } from "@/components/stellar-wallet"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  
  // Real data state
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [drafts, setDrafts] = useState<any[]>([])
  const [stats, setStats] = useState<SubmissionsStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  })
  const [loadingData, setLoadingData] = useState(false)

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
          
          // Set auth token for API service
          apiService.setAuthToken(authToken || '')
          
          // Fetch real data
          fetchDashboardData()
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

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true)
      
      // Fetch submissions stats
      const statsData = await apiService.getSubmissionsStats()
      setStats(statsData)
      
      // Fetch recent submissions and drafts
      const [recentSubmissions, recentDrafts] = await Promise.all([
        apiService.getAllSubmissions({ 
          limit: 5,
          offset: 0 
        }),
        apiService.getAllDrafts({ 
          limit: 5,
          offset: 0 
        })
      ])
      
      setSubmissions(recentSubmissions)
      setDrafts(recentDrafts)
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoadingData(false)
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SimpleSidebar>
        <SimpleSidebarHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">DOB Backoffice</span>
          </div>
        </SimpleSidebarHeader>
        <SimpleSidebarContent>
          <SimpleSidebarMenu>
            <SimpleSidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/dashboard')}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </SimpleSidebarMenuButton>
            <SimpleSidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/submission-review')}>
                <FileText className="mr-2 h-4 w-4" />
                Review Submissions
              </Button>
            </SimpleSidebarMenuButton>
            <SimpleSidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </SimpleSidebarMenuButton>
            {adminInfo.role === 'SUPER_ADMIN' && (
              <SimpleSidebarMenuButton asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </SimpleSidebarMenuButton>
            )}
          </SimpleSidebarMenu>
        </SimpleSidebarContent>
      </SimpleSidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Dashboard</h1>
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

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Welcome, {adminInfo.name}!</h2>
                <p className="text-muted-foreground">
                  You are logged in as a {adminInfo.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loadingData ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      All time submissions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loadingData ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pending}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting review
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loadingData ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.underReview}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently being reviewed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved Devices</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loadingData ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.approved}</div>
                    <p className="text-xs text-muted-foreground">
                      Successfully validated
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Submissions and Drafts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Submissions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <CardDescription>
                      Latest device validation requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingData ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading submissions...</span>
                      </div>
                    ) : submissions.length > 0 ? (
                      <div className="space-y-4">
                        {submissions.map((submission) => (
                          <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{submission.device_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {submission.device_type} • {submission.manufacturer} {submission.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(submission.status)}>
                                {submission.status.replace('_', ' ')}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/submission-review?id=${submission.id}`)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No submissions yet</p>
                        <p className="text-sm">Submissions will appear here once users submit device validations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Drafts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Drafts</CardTitle>
                    <CardDescription>
                      Draft device validations in progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingData ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading drafts...</span>
                      </div>
                    ) : drafts.length > 0 ? (
                      <div className="space-y-4">
                        {drafts.map((draft) => (
                          <div key={draft.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{draft.deviceName || 'Untitled Draft'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {draft.deviceType || 'No device type'} • {draft.manufacturer || 'No manufacturer'} {draft.model || ''}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last updated {new Date(draft.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                DRAFT
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/submission-review?id=${draft.id}&type=draft`)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No drafts yet</p>
                        <p className="text-sm">Drafts will appear here once users start creating device validations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

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
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.push('/submission-review')}
                    >
                      <CheckCircle className="h-6 w-6" />
                      <span>Review Submissions</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      <span>View Analytics</span>
                    </Button>
                    {adminInfo.role === 'SUPER_ADMIN' && (
                      <>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                          <User className="h-6 w-6" />
                          <span>Manage Users</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                          <Settings className="h-6 w-6" />
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
      </div>
  )
} 