"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabaseService } from "@/lib/supabase-service"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react"

interface Submission {
  id: string
  device_name: string
  device_type: string
  custom_device_type?: string
  location: string
  submitted_at: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  certificate_id?: string
}

interface Draft {
  id: string
  device_name: string
  device_type: string
  custom_device_type?: string
  location: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRejection, setSelectedRejection] = useState<any>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get wallet address from localStorage
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.log('No auth token found')
        setSubmissions([])
        setDrafts([])
        return
      }

      const tokenData = JSON.parse(authToken)
      const walletAddress = tokenData.walletAddress

      if (!walletAddress) {
        console.log('No wallet address found in token')
        setSubmissions([])
        setDrafts([])
        return
      }

      console.log('Fetching data for wallet:', walletAddress)

      // Fetch submissions and drafts using Supabase service
      const [submissionsData, draftsData] = await Promise.all([
        supabaseService.getUserSubmissions(walletAddress),
        supabaseService.getUserDrafts(walletAddress)
      ])

      console.log('Submissions data:', submissionsData)
      console.log('Drafts data:', draftsData)

      setSubmissions(submissionsData || [])
      setDrafts(draftsData || [])

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
      await supabaseService.deleteDraft(draftId)
      
      console.log('✅ Draft deleted successfully')
      toast({
        title: "Draft Deleted",
        description: "The draft has been successfully deleted.",
      })
      // Refresh the data to update the dashboard
      await fetchData()
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
    // Handle certificate viewing
    console.log('Viewing certificate for device:', device.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDraftCompletion = (draft: any) => {
    const fields = [
      draft.device_name,
      draft.device_type,
      draft.location,
      draft.serial_number,
      draft.manufacturer,
      draft.model,
      draft.year_of_manufacture,
      draft.condition,
      draft.specifications,
      draft.purchase_price,
      draft.current_value,
      draft.expected_revenue,
      draft.operational_costs
    ]
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length
    const totalFields = fields.length
    const percentage = Math.round((filledFields / totalFields) * 100)
    
    return percentage
  }

  const getStatusBadge = (item: any) => {
    switch (item.status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'UNDER_REVIEW':
        return <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'draft':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Draft</Badge>
      default:
        return <Badge variant="secondary">{item.status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchData} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Device Dashboard</h1>
          <p className="text-muted-foreground">Manage your device submissions and drafts</p>
        </div>
        <Button onClick={handleCreateDevice} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Device
        </Button>
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Drafts ({drafts.length})
            </CardTitle>
            <CardDescription>
              Continue working on your device submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drafts.map((draft) => {
                const completion = calculateDraftCompletion(draft)
                return (
                  <Card key={draft.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {draft.device_name || 'Untitled Device'}
                          </CardTitle>
                          <CardDescription>
                            {draft.device_type || 'No type specified'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDevice(draft.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDraft(draft.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion:</span>
                          <span className="font-medium">{completion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last updated: {formatDate(draft.updated_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions Section */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Submissions ({submissions.length})
            </CardTitle>
            <CardDescription>
              Track the status of your submitted devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{submission.device_name}</h3>
                      {getStatusBadge(submission)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {submission.device_type} • {submission.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {formatDate(submission.submitted_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {submission.status === 'APPROVED' && (
                      <Button variant="outline" size="sm" onClick={() => handleViewCertificate(submission)}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {drafts.length === 0 && submissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No devices yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first device submission
            </p>
            <Button onClick={handleCreateDevice}>
              Create Your First Device
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 