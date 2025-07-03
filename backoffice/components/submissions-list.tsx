"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  User,
  Loader2,
  AlertCircle
} from "lucide-react"
import { apiService, Submission } from "@/lib/api-service"
import { isAuthenticated } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

export function SubmissionsList() {
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!isAuthenticated()) {
          setError('Authentication required')
          return
        }

        const submissionsData = await apiService.getAllSubmissions()
        setSubmissions(submissionsData)
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

    fetchSubmissions()
  }, [toast])

  // Filter submissions based on search term and status
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === "" || 
      submission.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user?.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "" || submission.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleReviewSubmission = (submissionId: string) => {
    router.push(`/submission-review?id=${submissionId}`)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Submissions</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Submissions</h2>
          <p className="text-muted-foreground">
            {filteredSubmissions.length} of {submissions.length} submissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by device name, manufacturer, model, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Submissions Grid */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No submissions found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{submission.device_name}</h3>
                      <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
                        {statusLabels[submission.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {submission.user?.wallet_address 
                            ? `${submission.user.wallet_address.slice(0, 8)}...${submission.user.wallet_address.slice(-8)}`
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">{submission.manufacturer} {submission.model}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium">{submission.device_type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{submission.location}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Serial:</span>
                        <p className="font-medium">{submission.serial_number}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <p className="font-medium">${Number(submission.current_value).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button 
                      onClick={() => handleReviewSubmission(submission.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 