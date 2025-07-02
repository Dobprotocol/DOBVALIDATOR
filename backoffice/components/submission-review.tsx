"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  CheckCircle,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Star,
  Wallet,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// Temporary mock for stellar contract service to avoid build issues
const mockStellarContractService = {
  createTrufaMetadata: (data: any) => ({
    ...data,
    decisionAt: new Date().toISOString(),
    metadataHash: `mock_hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })
}
import { adminConfigService } from "@/lib/admin-config"
import { apiService, Submission } from "@/lib/api-service"
import { useSearchParams } from "next/navigation"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "under review": "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
}

interface SubmissionReviewProps {
  submissionId?: string
  onBack?: () => void
}

// Define the form schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  documentType: z.enum(["passport", "id_card", "drivers_license"], {
    required_error: "Please select a document type",
  }),
  documentNumber: z.string().min(5, "Document number must be at least 5 characters"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function SubmissionReview({ submissionId, onBack }: SubmissionReviewProps) {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trufaScores, setTrufaScores] = useState({
    technical: [75],
    regulatory: [80],
    financial: [70],
    environmental: [85],
  })
  const [reviewerNotes, setReviewerNotes] = useState("")
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [stellarTxHash, setStellarTxHash] = useState("")
  const [txStatus, setTxStatus] = useState<"pending" | "confirmed" | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)
  const [openPdf, setOpenPdf] = useState<string | null>(null)

  // Real wallet connection state
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isWalletWhitelisted, setIsWalletWhitelisted] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string>("")

  // Get submission ID from URL params or props
  const currentSubmissionId = submissionId || searchParams.get('id') || ""

  // Calculate average score (must be before any conditional returns)
  const averageScore = Math.round(Object.values(trufaScores).reduce((sum, score) => sum + score[0], 0) / 4)

  // Initialize form (must be before any conditional returns)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      dateOfBirth: "",
      documentType: undefined,
      documentNumber: "",
      notes: "",
    },
  })

  // Fetch submission data
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!currentSubmissionId) {
        setError('No submission ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        if (!apiService.isAuthenticated()) {
          setError('Authentication required')
          return
        }

        const response = await apiService.getSubmission(currentSubmissionId)
        
        if (response.success && response.data) {
          setSubmission(response.data)
          // Initialize TRUFA scores from existing admin score if available
          if (response.data.adminScore) {
            const score = response.data.adminScore
            setTrufaScores({
              technical: [score],
              regulatory: [score],
              financial: [score],
              environmental: [score],
            })
          }
          // Load existing admin notes
          if (response.data.adminNotes) {
            setReviewerNotes(response.data.adminNotes)
          }
        } else {
          setError(response.error || 'Failed to fetch submission')
          toast({
            title: "Error",
            description: response.error || 'Failed to fetch submission',
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

    fetchSubmission()
  }, [currentSubmissionId, toast])

  // Check wallet connection and admin status on mount
  useEffect(() => {
    const checkWalletStatus = () => {
      const walletAddress = localStorage.getItem('stellarPublicKey')
      if (walletAddress) {
        setConnectedWallet(walletAddress)
        setIsWalletConnected(true)
        
        // Check if wallet is admin
        const isAdmin = adminConfigService.isAdminWallet(walletAddress)
        setIsWalletWhitelisted(isAdmin)
        
        console.log('Wallet status:', {
          address: walletAddress,
          isConnected: true,
          isAdmin,
          permissions: adminConfigService.getAdminWallet(walletAddress)?.permissions
        })
      }
    }
    
    checkWalletStatus()
    
    // Listen for wallet changes
    const handleWalletChange = () => {
      checkWalletStatus()
    }
    
    window.addEventListener('walletStateChange', handleWalletChange)
    window.addEventListener('storage', handleWalletChange)
    
    return () => {
      window.removeEventListener('walletStateChange', handleWalletChange)
      window.removeEventListener('storage', handleWalletChange)
    }
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading submission...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !submission) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Submission</h2>
              <p className="text-muted-foreground mb-4">{error || 'Submission not found'}</p>
              {onBack && (
                <Button onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Inbox
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSignAndSubmit = async () => {
    if (!isWalletConnected || !isWalletWhitelisted || isApproved === null || !submission) {
      toast({
        title: "Cannot Submit",
        description: "Please connect an admin wallet and make a decision before submitting.",
        variant: "destructive",
      })
      return
    }
    if (!submission.id) {
      toast({
        title: "Submission Error",
        description: "Submission data is missing or invalid (no ID).",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log('🚀 Starting validation submission...')
      // Defensive: log submission object
      console.log('Submission object:', submission)
      // Update submission with admin decision
      const updateResponse = await apiService.updateSubmission(submission.id, {
        adminScore: averageScore,
        adminNotes: reviewerNotes,
        adminDecision: isApproved ? 'approved' : 'rejected',
        adminDecisionAt: new Date().toISOString(),
        status: isApproved ? 'approved' : 'rejected'
      })

      if (!updateResponse.success) {
        throw new Error(updateResponse.error || 'Failed to update submission')
      }

      // Create TRUFA metadata
      const metadata = mockStellarContractService.createTrufaMetadata({
        submissionId: submission.id,
        deviceName: submission.deviceName || 'N/A',
        deviceType: submission.deviceType || 'N/A',
        operatorWallet: submission.operatorWallet || 'N/A',
        validatorWallet: connectedWallet,
        trufaScores: {
          technical: trufaScores.technical[0],
          regulatory: trufaScores.regulatory[0],
          financial: trufaScores.financial[0],
          environmental: trufaScores.environmental[0],
          overall: averageScore
        },
        decision: isApproved ? 'APPROVED' : 'REJECTED'
      })
      console.log('📋 Created metadata:', metadata)

      // Defensive: check all required metadata fields
      if (!metadata.submissionId || !metadata.deviceName || !metadata.deviceType || !metadata.operatorWallet) {
        toast({
          title: "Metadata Error",
          description: "Some required metadata fields are missing.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // For now, simulate the Soroban transaction instead of requiring secret key
      // In production, this would integrate with a proper wallet like Freighter or Albedo
      console.log('🔐 Simulating Soroban transaction signing...')
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate a mock transaction hash
      const mockTxHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      setStellarTxHash(mockTxHash)
      setIsSubmitted(true)
      setTxStatus("confirmed")
      
      toast({
        title: "Validation Submitted Successfully! 🎉",
        description: `Decision: ${isApproved ? 'APPROVED' : 'REJECTED'} | Score: ${averageScore}/100`,
      })

      // TODO: In production, implement proper wallet integration:
      // 1. Use Freighter wallet extension
      // 2. Or integrate with Albedo wallet
      // 3. Or use Stellar SDK with proper key management
      
    } catch (error) {
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyTxHash = async () => {
    await navigator.clipboard.writeText(stellarTxHash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const canSign = isWalletConnected && isWalletWhitelisted && isApproved !== null && !isSubmitted

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      // TODO: Implement API call to validate submission
      console.log("Form submitted:", data)
      
      toast({
        title: "Submission received",
        description: "We will review your submission and get back to you shortly.",
      })
      
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inbox
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{submission.deviceName || 'N/A'}</h1>
                <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
                  {submission.status?.replace("-", " ") || 'Unknown'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3" />
                  TRUFA: {averageScore}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {submission.id} • Submitted by {submission.operatorWallet ? `${submission.operatorWallet.slice(0, 8)}...${submission.operatorWallet.slice(-8)}` : 'Unknown'} on{" "}
                {new Date(submission.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isWalletConnected ? (
                <Badge variant="outline" className="gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <Wallet className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <Wallet className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Documentation & Metadata */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>Device Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Device Type</Label>
                    <p className="font-medium">{submission.deviceType || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Manufacturer</Label>
                    <p className="font-medium">{submission.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Model</Label>
                    <p className="font-medium">{submission.model || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Serial Number</Label>
                    <p className="font-medium">{submission.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Year of Manufacture</Label>
                    <p className="font-medium">{submission.yearOfManufacture || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Condition</Label>
                    <p className="font-medium">{submission.condition || 'N/A'}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Specifications</Label>
                  <p className="text-sm leading-relaxed mt-1">{submission.specifications || 'No specifications provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
                <CardDescription>Device financial metrics and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Purchase Price</Label>
                    <p className="font-medium">${submission.purchasePrice ? Number(submission.purchasePrice).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Current Value</Label>
                    <p className="font-medium">${submission.currentValue ? Number(submission.currentValue).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Expected Revenue</Label>
                    <p className="font-medium">${submission.expectedRevenue ? Number(submission.expectedRevenue).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Operational Costs</Label>
                    <p className="font-medium">${submission.operationalCosts ? Number(submission.operationalCosts).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentation Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>Review submitted device documents</CardDescription>
              </CardHeader>
              <CardContent>
                {submission.files && submission.files?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {submission.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="truncate">{file.filename}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`/uploads/${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View ${file.filename}`}
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`/uploads/${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Download ${file.filename}`}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded</p>
                )}
              </CardContent>
            </Card>

            {/* Reviewer Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Notes</CardTitle>
                <CardDescription>Add your validation comments and observations</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your detailed review notes, concerns, or recommendations..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - TRUFA Scoring & Actions */}
          <div className="space-y-6">
            {/* TRUFA Scoring */}
            <Card>
              <CardHeader>
                <CardTitle>TRUFA Scoring</CardTitle>
                <CardDescription>Evaluate across key criteria</CardDescription>
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
              </CardContent>
            </Card>

            {/* Approval Decision */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Decision</CardTitle>
                <CardDescription>Approve or reject this submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isApproved === false ? "destructive" : "outline"}
                    size="lg"
                    onClick={() => setIsApproved(false)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant={isApproved === true ? "default" : "outline"}
                    size="lg"
                    onClick={() => setIsApproved(true)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>

                {isApproved !== null && (
                  <Alert className={isApproved ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {isApproved
                        ? "Device approved for certification. Ready to sign and submit to Stellar."
                        : "Device rejected. This decision will be recorded on-chain."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Wallet Status & Signing */}
            <Card>
              <CardHeader>
                <CardTitle>Wallet Status</CardTitle>
                <CardDescription>Admin wallet connection and signing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection Status</span>
                    <Badge variant={isWalletConnected ? "default" : "secondary"}>
                      {isWalletConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Status</span>
                    <Badge variant={isWalletWhitelisted ? "default" : "secondary"}>
                      {isWalletWhitelisted ? "Admin" : "Not Admin"}
                    </Badge>
                  </div>
                  {connectedWallet && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {connectedWallet.slice(0, 8)}...{connectedWallet.slice(-8)}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSignAndSubmit}
                  disabled={!canSign}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sign & Submit to Stellar
                    </>
                  )}
                </Button>

                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Demo Mode:</strong> This simulation demonstrates the validation workflow. 
                    In production, this would integrate with a Stellar wallet (Freighter, Albedo, etc.) 
                    to sign actual blockchain transactions.
                  </AlertDescription>
                </Alert>

                {!isWalletConnected && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please connect an admin wallet to sign and submit this validation.
                    </AlertDescription>
                  </Alert>
                )}

                {isWalletConnected && !isWalletWhitelisted && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connected wallet is not authorized as an admin. Please connect an admin wallet.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Transaction Status */}
            {isSubmitted && (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Status</CardTitle>
                  <CardDescription>Stellar blockchain transaction details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Transaction Hash</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                        {stellarTxHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyTxHash}
                        className="shrink-0"
                      >
                        {copiedHash ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={txStatus === "confirmed" ? "default" : "secondary"}>
                      {txStatus === "confirmed" ? "Confirmed" : "Pending"}
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${stellarTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Stellar Expert
                    </a>
                  </Button>

                  {txStatus === "confirmed" && (
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
