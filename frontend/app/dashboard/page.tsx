"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { PlusCircle, FileText, Edit, Eye, AlertCircle, Loader2 } from "lucide-react"
import { RejectionReviewModal } from "@/components/ui/rejection-review-modal"
import { CertificateModal } from "@/components/ui/certificate-modal"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { apiService } from '@/lib/api-service'

interface Submission {
  id: string
  deviceName: string
  deviceType: string
  manufacturer: string
  submittedAt: string
  status: 'pending' | 'under review' | 'approved' | 'rejected' | 'draft'
  certificateId?: string
}

interface Draft {
  id: string
  deviceName: string
  deviceType: string
  manufacturer: string
  submittedAt: string
  updatedAt: string
  status: 'draft'
}

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  "under review": "secondary",
  rejected: "destructive",
  draft: "secondary",
  pending: "secondary",
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRejection, setSelectedRejection] = useState<any>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'submissions' | 'drafts'>('submissions')

  // Fetch submissions and drafts from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch submissions using apiService
        const submissionsResponse = await apiService.getSubmissions()
        if (submissionsResponse.success) {
          setSubmissions(submissionsResponse.submissions)
        } else {
          throw new Error('Failed to fetch submissions')
        }

        // Fetch drafts using apiService
        try {
          const draftsResponse = await apiService.getDrafts()
          if (draftsResponse.success) {
            setDrafts(draftsResponse.drafts)
          }
        } catch (draftError) {
          // Drafts might not be implemented yet, so we'll ignore this error
          console.log('Drafts not available:', draftError)
          // Set empty drafts array to avoid undefined errors
          setDrafts([])
        }

      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to fetch data')
        toast({
          title: "Error",
          description: err.message || 'Failed to fetch data',
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleCreateDevice = () => {
    router.push('/form')
  }

  const handleEditDevice = (deviceId: string) => {
    // Navigate to form with edit parameter
    router.push(`/form?edit=${deviceId}`)
  }

  const handleViewRejection = (device: any) => {
    setSelectedRejection(device.rejectionData)
  }

  const handleViewCertificate = (device: any) => {
    setSelectedCertificate(device.certificateData)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
  return (
      <AuthGuard>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      {/* Dashboard Content */}
      <div className="relative mt-20 z-10 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-8">
          <Button
            onClick={handleCreateDevice}
              className="inline-flex items-center gap-2 text-base py-3 px-6 rounded-lg font-semibold shadow-md bg-background/90 backdrop-blur-sm"
          >
            <PlusCircle className="h-5 w-5" />
            Validate New Device
          </Button>
        </div>

          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg bg-background/90 backdrop-blur-sm">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted/90 backdrop-blur-sm p-1 rounded-lg mb-8">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'submissions'
                  ? 'bg-background/90 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'drafts'
                  ? 'bg-background/90 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Drafts ({drafts.length})
            </button>
          </div>

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <>
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto bg-background/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start by submitting your first device for validation. This will allow you to create investment pools and tokenize your device's revenue.
                    </p>
                    <Button
                      onClick={handleCreateDevice}
                      className="inline-flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Submit Your First Device
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border bg-background/90 backdrop-blur-sm rounded-lg shadow-lg">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Manufacturer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">{submission.deviceName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{submission.deviceType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{submission.manufacturer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDate(submission.submittedAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={statusColor[submission.status] || "secondary"} className="capitalize">
                              {submission.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {submission.status === "approved" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => handleViewCertificate(submission)}
                              >
                                <Eye className="h-4 w-4" />
                                View Certificate
                              </Button>
                            )}
                            {submission.status === "rejected" && (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="gap-2"
                                onClick={() => handleViewRejection(submission)}
                              >
                                <AlertCircle className="h-4 w-4" />
                                Review Reason
                              </Button>
                            )}
                            {(submission.status === "under review" || submission.status === "pending") && (
                              <Button size="sm" variant="ghost" className="gap-2" disabled>
                                <FileText className="h-4 w-4" />
                                In Review
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Drafts Tab */}
          {activeTab === 'drafts' && (
            <>
              {drafts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto bg-background/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No drafts yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start creating a device submission and save it as a draft to continue later.
                    </p>
                    <Button
                      onClick={handleCreateDevice}
                      className="inline-flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create New Device
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border bg-background/90 backdrop-blur-sm rounded-lg shadow-lg">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Manufacturer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {drafts.map((draft) => (
                        <tr key={draft.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">{draft.deviceName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{draft.deviceType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{draft.manufacturer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDate(draft.updatedAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="gap-2"
                              onClick={() => handleEditDevice(draft.id)}
                            >
                              <Edit className="h-4 w-4" />
                              Continue Editing
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedRejection && (
        <RejectionReviewModal
          isOpen={!!selectedRejection}
          onClose={() => setSelectedRejection(null)}
          deviceData={selectedRejection}
        />
      )}

      {selectedCertificate && (
        <CertificateModal
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificateData={selectedCertificate}
        />
      )}
    </AuthGuard>
  )
} 