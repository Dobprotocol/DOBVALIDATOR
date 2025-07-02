"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { PlusCircle, FileText, Edit, Eye, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { RejectionReviewModal } from "@/components/ui/rejection-review-modal"
import { CertificateModal } from "@/components/ui/certificate-modal"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { apiService } from '@/lib/api-service'

interface Submission {
  id: string
  deviceName: string
  deviceType: string
  customDeviceType?: string
  location: string
  submittedAt: string
  status: 'pending' | 'under review' | 'approved' | 'rejected' | 'draft'
  certificateId?: string
}

interface Draft {
  id: string
  name: string
  deviceName: string
  deviceType: string
  customDeviceType?: string
  location: string
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
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch submissions from backend database
      try {
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          console.log('No auth token found for submissions')
          setSubmissions([])
          return
        }

        const tokenData = JSON.parse(authToken)
        console.log('Auth token data:', tokenData)
        console.log('Token being sent:', tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token')
        console.log('Fetching submissions from backend database...')
        
        const submissionsResponse = await fetch('https://v.dobprotocol.com/api/submissions', {
          headers: {
            'Authorization': `Bearer ${tokenData.token}`
          }
        })

        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json()
          console.log('Submissions response:', submissionsData)
          if (submissionsData.success) {
            console.log('Setting submissions to:', submissionsData.submissions || [])
            setSubmissions(submissionsData.submissions || [])
          } else {
            console.log('Submissions API returned error:', submissionsData.error)
            setSubmissions([])
          }
        } else {
          console.log('Submissions API request failed:', submissionsResponse.status, submissionsResponse.statusText)
          // Fall back to frontend submissions if backend is down
          console.log('Falling back to frontend submissions...')
          try {
            const frontendResponse = await fetch('/api/submissions', {
              headers: {
                'Authorization': `Bearer ${tokenData.token}`
              }
            })
            if (frontendResponse.ok) {
              const frontendData = await frontendResponse.json()
              if (frontendData.success) {
                console.log('Using frontend submissions:', frontendData.submissions || [])
                setSubmissions(frontendData.submissions || [])
              } else {
                setSubmissions([])
              }
            } else {
              setSubmissions([])
            }
          } catch (fallbackError) {
            console.error('Fallback submissions failed:', fallbackError)
            setSubmissions([])
          }
        }
      } catch (submissionError) {
        console.error('Error fetching submissions:', submissionError)
        setSubmissions([])
      }

      // Fetch drafts from frontend API routes
      try {
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          console.log('No auth token found for drafts')
          setDrafts([])
          return
        }

        const tokenData = JSON.parse(authToken)
        console.log('Auth token data:', tokenData)
        console.log('Token being sent:', tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token')
        console.log('Fetching drafts from frontend API...')
        
        const draftsResponse = await fetch('/api/drafts', {
          headers: {
            'Authorization': `Bearer ${tokenData.token}`
          }
        })

        if (draftsResponse.ok) {
          const draftsData = await draftsResponse.json()
          console.log('Drafts response:', draftsData)
          console.log('Drafts response.success:', draftsData.success)
          console.log('Drafts response.drafts:', draftsData.drafts)
          console.log('Drafts response.drafts length:', draftsData.drafts?.length)
          console.log('Drafts response.drafts type:', typeof draftsData.drafts)
          if (draftsData.success) {
            console.log('Setting drafts to:', draftsData.drafts || [])
            setDrafts(draftsData.drafts || [])
          } else {
            console.log('Drafts API returned error:', draftsData.error)
            setDrafts([])
          }
        } else {
          console.log('Drafts API request failed:', draftsResponse.status, draftsResponse.statusText)
          setDrafts([])
        }
      } catch (draftError) {
        console.error('Error fetching drafts:', draftError)
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

  useEffect(() => {
    fetchData()
  }, [toast])

  const handleCreateDevice = () => {
    // Clear all localStorage backups to ensure clean slate
    localStorage.removeItem('dobFormStep1Backup')
    localStorage.removeItem('dobFormStep2Backup')
    localStorage.removeItem('dobFormStep3Backup')
    localStorage.removeItem('dobFormStep4Backup')
    localStorage.removeItem('dobFormBackup')
    
    // Navigate to form (this will trigger creation of new draft)
    router.push('/form')
  }

  const handleEditDevice = (deviceId: string) => {
    console.log('🔍 Editing device with ID:', deviceId)
    // Navigate to form with edit parameter
    router.push(`/form?edit=${deviceId}`)
  }

  const handleDeleteDraft = async (draftId: string) => {
    console.log('🔍 Deleting draft with ID:', draftId)
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')
    if (!confirmed) {
      console.log('❌ Delete cancelled by user')
      return
    }

    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ No auth token found for delete')
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        })
        return
      }

      const tokenData = JSON.parse(authToken)
      console.log('🔍 Auth token data for delete:', { 
        hasToken: !!tokenData.token, 
        walletAddress: tokenData.walletAddress 
      })
      
      console.log('🔍 Sending delete request to:', `/api/drafts/${draftId}`)
      
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenData.token}`
        }
      })

      console.log('🔍 Delete response status:', response.status)
      console.log('🔍 Delete response ok:', response.ok)

      if (response.ok) {
        console.log('✅ Draft deleted successfully')
        toast({
          title: "Draft Deleted",
          description: "The draft has been successfully deleted.",
        })
        // Refresh the data to update the dashboard
        await fetchData()
      } else {
        const errorData = await response.json()
        console.error('❌ Delete failed:', errorData)
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete draft",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Error deleting draft:', error)
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive",
      })
    }
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

  // Calculate draft completion percentage
  const calculateDraftCompletion = (draft: any) => {
    const requiredFields = [
      'deviceName', 'deviceType', 'location', 'serialNumber', 
      'manufacturer', 'model', 'yearOfManufacture', 'condition', 
      'specifications', 'purchasePrice', 'currentValue', 
      'expectedRevenue', 'operationalCosts'
    ]
    
    const optionalFields = ['customDeviceType']
    const allFields = [...requiredFields, ...optionalFields]
    
    let completedFields = 0
    allFields.forEach(field => {
      if (draft[field] && draft[field].toString().trim() !== '') {
        completedFields++
      }
    })
    
    // Check if files are uploaded
    if (draft.files && draft.files.length > 0) {
      completedFields += 2 // Give extra points for files
    }
    
    const percentage = Math.round((completedFields / (allFields.length + 2)) * 100)
    return Math.min(percentage, 100)
  }

  // Get status badge component
  const getStatusBadge = (item: any) => {
    const completion = item.status === 'draft' ? calculateDraftCompletion(item) : null
    
    // Map backend status values to frontend status values
    let status = item.status
    if (status === 'PENDING') status = 'pending'
    if (status === 'UNDER_REVIEW') status = 'under review'
    if (status === 'APPROVED') status = 'approved'
    if (status === 'REJECTED') status = 'rejected'
    
    switch (status) {
      case 'draft':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Draft
            </Badge>
            {completion !== null && (
              <div className="flex items-center gap-1">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{completion}%</span>
              </div>
            )}
          </div>
        )
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>
      case 'under review':
        return <Badge variant="default" className="text-xs">Under Review</Badge>
      case 'approved':
        return <Badge variant="default" className="text-xs bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{item.status}</Badge>
    }
  }

  // Only show real submissions (not drafts)
  const realSubmissions = submissions.filter(s => s.status && [
    'pending', 'under review', 'approved', 'rejected', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'
  ].includes(s.status))
  // Only show drafts
  const onlyDrafts = drafts.filter(d => d.status && (d.status === 'draft' || d.status === 'DRAFT'))

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
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              My Submissions
            </h1>
          </div>
          
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
          <div className="overflow-x-auto mb-12">
            <table className="min-w-full divide-y divide-border bg-background/90 backdrop-blur-sm rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {realSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      No device submissions yet.
                    </td>
                  </tr>
                ) : (
                  realSubmissions.map((item: any) => {
                    console.log('Rendering item:', item)
                    console.log('Item status:', item.status)
                    console.log('Item type:', typeof item.status)
                    
                    // Handle different data structures from backend vs frontend
                    const deviceName = item.deviceName || item.name || 'Unknown Device'
                    const deviceType = item.deviceType || 'Unknown Type'
                    const location = item.location || 'Not specified' // Now properly stored in database
                    const status = item.status || 'unknown'
                    const date = item.updatedAt || item.submittedAt || new Date().toISOString()
                    
                    console.log('Processed status:', status)
                    console.log('Is draft?', status === 'draft')
                    
                    return (
                      <tr key={`${status}-${item.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">
                          {deviceName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {deviceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDate(date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {(status === "approved" || item.status === "APPROVED") && (
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
                          {(status === "rejected" || item.status === "REJECTED") && (
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
                          {((status === "under review" || item.status === "UNDER_REVIEW") || 
                            (status === "pending" || item.status === "PENDING")) && (
                            <Button size="sm" variant="ghost" className="gap-2" disabled>
                              <FileText className="h-4 w-4" />
                              In Review
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Drafts Section */}
          {onlyDrafts.length > 0 && (
            <div className="overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Incomplete Drafts</h2>
              <table className="min-w-full divide-y divide-border bg-background/90 backdrop-blur-sm rounded-lg shadow-lg">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {onlyDrafts.map((draft: any) => {
                    const deviceName = draft.deviceName || draft.name || 'Unknown Device'
                    const deviceType = draft.deviceType || 'Unknown Type'
                    const location = draft.location || 'Not specified'
                    const date = draft.updatedAt || draft.submittedAt || new Date().toISOString()
                    const completion = calculateDraftCompletion(draft)
                    return (
                      <tr key={`draft-${draft.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">{deviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{deviceType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{completion}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDate(date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="gap-2"
                              onClick={() => handleEditDevice(draft.id)}
                            >
                              <Edit className="h-4 w-4" />
                              Continue Editing
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="gap-2"
                              onClick={() => handleDeleteDraft(draft.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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