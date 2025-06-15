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

// Mock data
const mockSubmissions = [
  {
    id: "PROJ-001",
    title: "Solar Farm Development",
    submitter: "GreenTech Solutions",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
    priority: "high",
    documents: ["environmental-impact.pdf", "technical-specs.pdf", "financial-model.xlsx", "compliance.pdf"],
    trufaScore: null,
    validator: null,
  },
  {
    id: "PROJ-002",
    title: "Wind Energy Project",
    submitter: "EcoWind Corp",
    submittedAt: "2024-01-14T14:20:00Z",
    status: "under-review",
    priority: "medium",
    documents: ["project-proposal.pdf", "site-analysis.pdf"],
    trufaScore: 85,
    validator: "validator1.stellar",
  },
  {
    id: "PROJ-003",
    title: "Hydroelectric Plant",
    submitter: "AquaPower Inc",
    submittedAt: "2024-01-13T09:15:00Z",
    status: "certified",
    priority: "high",
    documents: ["feasibility-study.pdf", "environmental-clearance.pdf"],
    trufaScore: 92,
    validator: "validator2.stellar",
  },
  {
    id: "PROJ-004",
    title: "Geothermal Project",
    submitter: "ThermalTech Ltd",
    submittedAt: "2024-01-12T16:45:00Z",
    status: "declined",
    priority: "low",
    documents: ["initial-proposal.pdf"],
    trufaScore: 45,
    validator: "validator1.stellar",
  },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "under-review": "bg-blue-100 text-blue-800 border-blue-200",
  certified: "bg-green-100 text-green-800 border-green-200",
  declined: "bg-red-100 text-red-800 border-red-200",
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
}

function AppSidebar() {
  const [activeSection, setActiveSection] = useState("inbox")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
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
      badge: mockSubmissions.filter((s) => s.status === "pending").length,
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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>{walletAddress ? truncateAddress(walletAddress) : "Connect Wallet"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Connected Wallet</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {walletAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDisconnect}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function InboxSection() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter
    const matchesSearch =
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.submitter.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {filteredSubmissions.length} of {mockSubmissions.length} submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>TRUFA Score</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-mono text-sm">{submission.id}</TableCell>
                  <TableCell className="font-medium">{submission.title}</TableCell>
                  <TableCell>{submission.submitter}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
                      {submission.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={priorityColors[submission.priority as keyof typeof priorityColors]}
                    >
                      {submission.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.trufaScore ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {submission.trufaScore}
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
        </CardContent>
      </Card>
    </div>
  )
}

function ValidationToolsSection() {
  const [selectedProject, setSelectedProject] = useState(mockSubmissions[0])
  const [trufaScores, setTrufaScores] = useState({
    technical: [75],
    regulatory: [80],
    financial: [70],
    environmental: [85],
  })
  const [comments, setComments] = useState("")

  const averageScore = Math.round(Object.values(trufaScores).reduce((sum, score) => sum + score[0], 0) / 4)

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
              value={selectedProject.id}
              onValueChange={(value) =>
                setSelectedProject(mockSubmissions.find((s) => s.id === value) || mockSubmissions[0])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockSubmissions
                  .filter((s) => s.status === "pending" || s.status === "under-review")
                  .map((submission) => (
                    <SelectItem key={submission.id} value={submission.id}>
                      {submission.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Project Details</Label>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">ID:</span> {selectedProject.id}
                </p>
                <p>
                  <span className="font-medium">Submitter:</span> {selectedProject.submitter}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <Badge className={`ml-2 ${statusColors[selectedProject.status as keyof typeof statusColors]}`}>
                    {selectedProject.status.replace("-", " ")}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Documents</Label>
              <div className="space-y-1">
                {selectedProject.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="truncate">{doc}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>TRUFA Scoring</CardTitle>
            <CardDescription>Evaluate project across key criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Technical Feasibility ({trufaScores.technical[0]})</Label>
                <Slider
                  value={trufaScores.technical}
                  onValueChange={(value) => setTrufaScores((prev) => ({ ...prev, technical: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Regulatory Compliance ({trufaScores.regulatory[0]})</Label>
                <Slider
                  value={trufaScores.regulatory}
                  onValueChange={(value) => setTrufaScores((prev) => ({ ...prev, regulatory: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Financial Viability ({trufaScores.financial[0]})</Label>
                <Slider
                  value={trufaScores.financial}
                  onValueChange={(value) => setTrufaScores((prev) => ({ ...prev, financial: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Environmental Impact ({trufaScores.environmental[0]})</Label>
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

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold">Overall TRUFA Score</Label>
                <p className="text-sm text-muted-foreground">Average of all criteria</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{averageScore}</div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Validation Comments</Label>
              <Textarea
                placeholder="Add your validation notes and comments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Certify
              </Button>
              <Button variant="destructive" className="flex-1" size="lg">
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
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
  const [autoValidation, setAutoValidation] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure dashboard preferences and validation parameters</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the dashboard appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for new submissions</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Parameters</CardTitle>
              <CardDescription>Configure TRUFA scoring and validation rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum TRUFA Score</Label>
                  <Input type="number" placeholder="70" />
                </div>
                <div className="space-y-2">
                  <Label>Auto-certification Threshold</Label>
                  <Input type="number" placeholder="90" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-validation</Label>
                  <p className="text-sm text-muted-foreground">Automatically validate high-scoring submissions</p>
                </div>
                <Switch checked={autoValidation} onCheckedChange={setAutoValidation} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet & Security</CardTitle>
              <CardDescription>Manage validator wallet and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Connected Wallet</Label>
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono text-sm">validator1.stellar</span>
                  <Badge variant="secondary" className="ml-auto">
                    Connected
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Validator Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Issue Certifications</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Access Archived Data</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Modify Settings</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ArchivedSection() {
  const archivedSubmissions = mockSubmissions.filter((s) => s.status === "certified" || s.status === "declined")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Archived Projects</h1>
        <p className="text-muted-foreground">Historical submissions and audit logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Validations</CardTitle>
          <CardDescription>{archivedSubmissions.length} completed validations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Final Status</TableHead>
                <TableHead>TRUFA Score</TableHead>
                <TableHead>Validator</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archivedSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-mono text-sm">{submission.id}</TableCell>
                  <TableCell className="font-medium">{submission.title}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {submission.trufaScore}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{submission.validator}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(submission.submittedAt).toLocaleDateString()}
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

  return <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
}

export function BackOfficeDashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center gap-4 border-b bg-background px-6 py-3">
            <SidebarTrigger />
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Badge variant="outline" className="gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                Online
              </Badge>
            </div>
          </header>
          <MainContent />
        </div>
      </div>
    </SidebarProvider>
  )
}
