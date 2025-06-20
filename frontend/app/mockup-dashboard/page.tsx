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

interface Submission {
  id: string
  deviceName: string
  deviceType: string
  manufacturer: string
  submittedAt: string
  status: 'pending' | 'under review' | 'approved' | 'rejected' | 'draft'
  certificateId?: string
}

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  "under review": "secondary",
  rejected: "destructive",
  draft: "secondary",
  pending: "secondary",
}

export default function MockupDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRejection, setSelectedRejection] = useState<any>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)

  // Fetch submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          throw new Error('No authentication token found')
        }

        const tokenData = JSON.parse(authToken)
        const response = await fetch('/api/submissions', {
          headers: {
            'Authorization': `Bearer ${tokenData.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch submissions')
        }

        const data = await response.json()
        if (data.success) {
          setSubmissions(data.submissions)
        } else {
          throw new Error(data.error || 'Failed to fetch submissions')
        }
      } catch (err: any) {
        console.error('Error fetching submissions:', err)
        setError(err.message || 'Failed to fetch submissions')
        toast({
          title: "Error",
          description: err.message || 'Failed to fetch submissions',
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [toast])

  const handleCreateDevice = () => {
    router.push('/form')
  }

  const handleEditDevice = (deviceId: string) => {
    // For now, just navigate to form with a query parameter
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
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">My Devices</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading your device submissions...
              </p>
            </div>
            <div className="flex justify-center items-center mt-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">My Devices</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your device submissions and track their status
            </p>
          </div>
          <div className="flex justify-end mt-8 mb-8">
            <Button
              onClick={handleCreateDevice}
              className="inline-flex items-center gap-2 text-base py-3 px-6 rounded-lg font-semibold shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              Validate New Device
            </Button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          {submissions.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No devices submitted yet</h3>
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
              <table className="min-w-full divide-y divide-border bg-card rounded-lg shadow">
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
                        {submission.status === "draft" && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="gap-2"
                            onClick={() => handleEditDevice(submission.id)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
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
      </div>
    </AuthGuard>
  )
} 