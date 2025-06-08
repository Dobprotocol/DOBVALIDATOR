"use client"

import { useState } from "react"
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

// Mock submission data
const mockSubmission = {
  id: "PROJ-001",
  title: "Helium Chile Expansion",
  submitter: "HeliumTech Solutions",
  submittedAt: "2024-01-15T10:30:00Z",
  status: "pending",
  priority: "high",
  description:
    "Expansion of Helium network infrastructure across Chile with focus on rural connectivity and IoT device deployment.",
  documents: [
    { name: "technical-specifications.pdf", size: "2.4 MB", type: "pdf" },
    { name: "financial-projections.xlsx", size: "1.8 MB", type: "excel" },
    { name: "environmental-impact.pdf", size: "3.2 MB", type: "pdf" },
    { name: "regulatory-compliance.pdf", size: "1.5 MB", type: "pdf" },
  ],
  extractedMetadata: {
    deviceCount: 1250,
    projectedRevenue: "$2.4M",
    deploymentTimeframe: "18 months",
    coverageArea: "45,000 km²",
    energyConsumption: "125 kWh/month",
    regulatoryStatus: "Pre-approved",
  },
  submitterWallet: "GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ",
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "under-review": "bg-blue-100 text-blue-800 border-blue-200",
  certified: "bg-green-100 text-green-800 border-green-200",
  declined: "bg-red-100 text-red-800 border-red-200",
}

interface SubmissionReviewProps {
  submissionId?: string
  onBack?: () => void
}

export function SubmissionReview({ submissionId = "PROJ-001", onBack }: SubmissionReviewProps) {
  const { toast } = useToast()
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

  // Mock wallet connection state
  const [isWalletConnected] = useState(true)
  const [isWalletWhitelisted] = useState(true)
  const connectedWallet = "GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ"

  const averageScore = Math.round(Object.values(trufaScores).reduce((sum, score) => sum + score[0], 0) / 4)

  const handleSignAndSubmit = async () => {
    if (!isWalletConnected || !isWalletWhitelisted || isApproved === null) return

    setIsSubmitting(true)

    try {
      // Simulate Stellar transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockTxHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
      setStellarTxHash(mockTxHash)
      setIsSubmitted(true)
      setTxStatus("pending")

      toast({
        title: "Metadata successfully pushed to Stellar 🚀",
        description: "Transaction is being processed on the network",
      })

      // Simulate confirmation after 5 seconds
      setTimeout(() => {
        setTxStatus("confirmed")
        toast({
          title: "Transaction Confirmed ✅",
          description: "Validation has been recorded on-chain",
        })
      }, 5000)
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to submit to Stellar network. Please try again.",
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
                <h1 className="text-2xl font-bold">{mockSubmission.title}</h1>
                <Badge className={statusColors[mockSubmission.status as keyof typeof statusColors]}>
                  {mockSubmission.status.replace("-", " ")}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3" />
                  TRUFA: {averageScore}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {mockSubmission.id} • Submitted by {mockSubmission.submitter} on{" "}
                {new Date(mockSubmission.submittedAt).toLocaleDateString()}
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
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{mockSubmission.description}</p>
              </CardContent>
            </Card>

            {/* Documentation Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>Review submitted project documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockSubmission.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Auto-extracted Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Extracted Metadata
                </CardTitle>
                <CardDescription>Automatically extracted project metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(mockSubmission.extractedMetadata).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
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
                  <div className="text-3xl font-bold text-blue-600">{averageScore}</div>
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
                  <Alert className={isApproved ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {isApproved
                        ? "Project approved for certification. Ready to sign and submit to Stellar."
                        : "Project rejected. This decision will be recorded on-chain."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Wallet Status & Signing */}
            <Card>
              <CardHeader>
                <CardTitle>Stellar Submission</CardTitle>
                <CardDescription>Sign and submit validation to blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isWalletConnected && (
                  <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertDescription>Connect your validator wallet to sign transactions</AlertDescription>
                  </Alert>
                )}

                {isWalletConnected && !isWalletWhitelisted && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Your wallet is not authorized for validation signing</AlertDescription>
                  </Alert>
                )}

                {isWalletConnected && (
                  <div className="space-y-2">
                    <Label className="text-sm">Connected Wallet</Label>
                    <div className="p-2 bg-muted rounded text-xs font-mono break-all">{connectedWallet}</div>
                  </div>
                )}

                <Button onClick={handleSignAndSubmit} disabled={!canSign || isSubmitting} className="w-full" size="lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing & Submitting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Sign & Submit to Stellar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Transaction Status */}
            {isSubmitted && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {txStatus === "confirmed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    )}
                    Transaction Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Stellar Transaction Hash</Label>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-muted rounded text-xs font-mono break-all flex-1">{stellarTxHash}</div>
                      <Button variant="ghost" size="sm" onClick={copyTxHash}>
                        {copiedHash ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://stellar.expert/explorer/public/tx/${stellarTxHash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${txStatus === "confirmed" ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <span className="text-sm">
                      {txStatus === "confirmed" ? "Confirmed on-chain" : "Awaiting confirmation"}
                    </span>
                  </div>

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
