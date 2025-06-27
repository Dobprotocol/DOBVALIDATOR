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
              className="inline-flex items-center gap-2 text-base py-3 px-6 rounded-lg font-semibold shadow-md bg-blue-600 text-white hover:animate-neon-glow hover:shadow-[0_0_16px_4px_rgba(59,130,246,0.7)] focus-visible:shadow-[0_0_24px_8px_rgba(59,130,246,0.8)] transition-all duration-200"
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

          {/* Device Submissions Table (no tabs) */}
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
                {/* Show rows for submissions and drafts */}
                {submissions.concat(drafts).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      No device submissions or drafts yet.
                    </td>
                  </tr>
                ) : (
                  submissions.concat(drafts).map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">{item.deviceName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{item.deviceType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{item.manufacturer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDate(item.updatedAt || item.submittedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {item.status === "approved" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => handleViewCertificate(item)}
                          >
                            <Eye className="h-4 w-4" />
                            View Certificate
                          </Button>
                        )}
                        {item.status === "rejected" && (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="gap-2"
                            onClick={() => handleViewRejection(item)}
                          >
                            <AlertCircle className="h-4 w-4" />
                            Review Reason
                          </Button>
                        )}
                        {(item.status === "under review" || item.status === "pending") && (
                          <Button size="sm" variant="ghost" className="gap-2" disabled>
                            <FileText className="h-4 w-4" />
                            In Review
                          </Button>
                        )}
                        {item.status === "draft" && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="gap-2"
                            onClick={() => handleEditDevice(item.id)}
                          >
                            <Edit className="h-4 w-4" />
                            Continue Editing
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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