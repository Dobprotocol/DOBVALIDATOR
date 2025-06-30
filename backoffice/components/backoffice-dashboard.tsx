"use client"

import { useState, useEffect } from "react"
import {
  Archive,
  Bell,
  CheckCircle,
  FileText,
  Filter,
  Inbox,
  Search,
  Settings,
  Shield,
  User,
  Wallet,
  XCircle,
  Eye,
  Download,
  MessageSquare,
  Star,
  LogOut,
  Loader2,
  AlertCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { apiService, Submission } from "@/lib/api-service"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "under review": "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
}

function AppSidebar() {
  const [activeSection, setActiveSection] = useState("inbox")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const savedKey = localStorage.getItem('stellarPublicKey')
    if (savedKey) {
      setWalletAddress(savedKey)
    }

    // Listen for wallet state changes
    const handleWalletStateChange = () => {
      const newKey = localStorage.getItem('stellarPublicKey')
      setWalletAddress(newKey)
    }

    window.addEventListener('walletStateChange', handleWalletStateChange)
    return () => window.removeEventListener('walletStateChange', handleWalletStateChange)
  }, [])

  // Fetch pending count for badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (apiService.isAuthenticated()) {
        const response = await apiService.getSubmissions({ status: 'pending' })
        if (response.success && response.data) {
          setPendingCount(response.data.pagination.total)
        }
      }
    }

    fetchPendingCount()
  }, [])

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const handleDisconnect = () => {
    console.log('=== Starting Wallet Disconnection from Sidebar ===')
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

  const menuItems = [
    {
      id: "inbox",
      title: "Inbox",
      icon: Inbox,
      badge: pendingCount,
    },
    {
      id: "validation-tools",
      title: "Validation Tools",
      icon: Shield,
      badge: null,
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      badge: null,
    },
    {
      id: "archived",
      title: "Archived",
      icon: Archive,
      badge: null,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="font-semibold text-sm">DOB Validator</h2>
            <p className="text-xs text-muted-foreground">BackOffice Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Wallet</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              {walletAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="h-4 w-4" />
                    <span className="font-mono">{truncateAddress(walletAddress)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No wallet connected
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1">
          <div className="text-xs text-muted-foreground">
            DOB Protocol v1.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function InboxSection() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  })

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!apiService.isAuthenticated()) {
        setError('Authentication required')
        return
      }

      const response = await apiService.getSubmissions({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: pagination.limit,
        offset: pagination.offset
      })

      if (response.success && response.data) {
        setSubmissions(response.data?.submissions || [])
        setPagination(prev => ({
          ...prev,
          ...(response.data?.pagination || {})
        }))
      } else {
        setError(response.error || 'Failed to fetch submissions')
        toast({
          title: "Error",
          description: response.error || 'Failed to fetch submissions',
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter, pagination.offset])

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.deviceType.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Project Inbox</h1>
          <p className="text-muted-foreground">Manage incoming project submissions</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Inbox</h1>
          <p className="text-muted-foreground">Manage incoming project submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${filteredSubmissions.length} of ${pagination.total} submissions`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading submissions...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>TRUFA Score</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-sm">{submission.id}</TableCell>
                      <TableCell className="font-medium">{submission.deviceName}</TableCell>
                      <TableCell>{submission.manufacturer}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
                          {submission.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {submission.deviceType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.adminScore ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {submission.adminScore}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => window.location.href = `/submission-review?id=${submission.id}`}
                        >
                          <FileText className="h-4 w-4" />
                          <span>Review</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {pagination.hasMore && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={handleLoadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ValidationToolsSection() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedProject, setSelectedProject] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [trufaScores, setTrufaScores] = useState({
    technical: [75],
    regulatory: [80],
    financial: [70],
    environmental: [85],
  })
  const [comments, setComments] = useState("")

  // Fetch pending and under review submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        
        if (!apiService.isAuthenticated()) {
          toast({
            title: "Authentication Required",
            description: "Please connect your wallet to access validation tools",
            variant: "destructive",
          })
          return
        }

        const response = await apiService.getSubmissions({
          status: 'pending'
        })

        if (response.success && response.data) {
          const pendingSubmissions = response.data.submissions
          setSubmissions(pendingSubmissions)
          if (pendingSubmissions.length > 0) {
            setSelectedProject(pendingSubmissions[0])
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch submissions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [toast])

  const averageScore = Math.round(Object.values(trufaScores).reduce((sum, score) => sum + score[0], 0) / 4)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Validation Tools</h1>
          <p className="text-muted-foreground">TRUFA scoring and project validation</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading validation tools...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Validation Tools</h1>
        <p className="text-muted-foreground">TRUFA scoring and project validation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Project Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedProject?.id || ""}
              onValueChange={(value) => {
                const project = submissions.find((s) => s.id === value)
                setSelectedProject(project || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {submissions.map((submission) => (
                  <SelectItem key={submission.id} value={submission.id}>
                    {submission.deviceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProject && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Project Details</Label>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">ID:</span> {selectedProject.id}
                  </p>
                  <p>
                    <span className="font-medium">Device:</span> {selectedProject.deviceName}
                  </p>
                  <p>
                    <span className="font-medium">Manufacturer:</span> {selectedProject.manufacturer}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${statusColors[selectedProject.status as keyof typeof statusColors]}`}>
                      {selectedProject.status.replace("-", " ")}
                    </Badge>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>TRUFA Scoring</CardTitle>
            <CardDescription>Evaluate the selected project across key criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Technical Feasibility</Label>
                  <span className="text-sm font-medium">{trufaScores.technical[0]}</span>
                </div>
                <Slider
                  value={trufaScores.technical}
                  onValueChange={(value) => setTrufaScores((prev) => ({ ...prev, technical: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Regulatory Compliance</Label>
                  <span className="text-sm font-medium">{trufaScores.regulatory[0]}</span>
                </div>
                <Slider
                  value={trufaScores.regulatory}
                  onValueChange={(value) => setTrufaScores((prev) => ({ ...prev, regulatory: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Financial Viability</Label>
                  <span className="text-sm font-medium">{trufaScores.financial[0]}</span>
                </div>
                <Slider
                  value={trufaScores.financial}
                  onValueChange={(value) => setTrufaScores((prev) => ({ ...prev, financial: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Environmental Impact</Label>
                  <span className="text-sm font-medium">{trufaScores.environmental[0]}</span>
                </div>
                <Slider
                  value={trufaScores.environmental}
                  onValueChange={(value) => setTrufaScores((prev) => ({ ...prev, environmental: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">{averageScore}</div>
              <p className="text-sm text-muted-foreground">Overall TRUFA Score</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Review Comments</Label>
                <Textarea
                  placeholder="Add your review comments and observations..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingsSection() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your backoffice preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the backoffice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Email Notifications</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-refresh">Auto-refresh Dashboard</Label>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ArchivedSection() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch completed submissions (approved/rejected)
  useEffect(() => {
    const fetchArchivedSubmissions = async () => {
      try {
        setLoading(true)
        
        if (!apiService.isAuthenticated()) {
          toast({
            title: "Authentication Required",
            description: "Please connect your wallet to access archived submissions",
            variant: "destructive",
          })
          return
        }

        // Fetch both approved and rejected submissions
        const [approvedResponse, rejectedResponse] = await Promise.all([
          apiService.getSubmissions({ status: 'approved' }),
          apiService.getSubmissions({ status: 'rejected' })
        ])

        const archivedSubmissions = [
          ...(approvedResponse.success ? approvedResponse.data?.submissions || [] : []),
          ...(rejectedResponse.success ? rejectedResponse.data?.submissions || [] : [])
        ]

        setSubmissions(archivedSubmissions)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch archived submissions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArchivedSubmissions()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Archived Projects</h1>
          <p className="text-muted-foreground">Historical submissions and audit logs</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading archived submissions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Archived Projects</h1>
        <p className="text-muted-foreground">Historical submissions and audit logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Validations</CardTitle>
          <CardDescription>{submissions.length} completed validations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Final Status</TableHead>
                <TableHead>TRUFA Score</TableHead>
                <TableHead>Validator</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-mono text-sm">{submission.id}</TableCell>
                  <TableCell className="font-medium">{submission.deviceName}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.adminScore ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {submission.adminScore}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {submission.adminDecisionAt ? 'Admin' : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {submission.adminDecisionAt 
                      ? new Date(submission.adminDecisionAt).toLocaleDateString()
                      : new Date(submission.submittedAt).toLocaleDateString()
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MainContent() {
  const [activeSection, setActiveSection] = useState("inbox")

  const renderContent = () => {
    switch (activeSection) {
      case "inbox":
        return <InboxSection />
      case "validation-tools":
        return <ValidationToolsSection />
      case "settings":
        return <SettingsSection />
      case "archived":
        return <ArchivedSection />
      default:
        return <InboxSection />
    }
  }

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  )
}

export function BackOfficeDashboard() {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <MainContent />
      </div>
    </SidebarProvider>
  )
}
