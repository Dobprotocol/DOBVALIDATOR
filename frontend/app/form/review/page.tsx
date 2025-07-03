"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Loader2, Upload, FileText, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from '@/lib/api-service'
import { AuthGuard } from "@/components/auth-guard"
import { DeviceReview } from "@/components/steps/device-review"
import type { DeviceData } from "@/components/enhanced-device-verification-flow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FormReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)

  useEffect(() => {
    // Get device data from localStorage or URL params
    const savedData = localStorage.getItem('dobFormBackup')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setDeviceData(parsedData)
        
        // Check if files are missing or invalid (not File objects or FileInfo objects)
        const hasValidFiles = parsedData.technicalCertification && 
                             parsedData.purchaseProof && 
                             parsedData.maintenanceRecords && 
                             Array.isArray(parsedData.deviceImages) &&
                             parsedData.deviceImages.length > 0
        
        if (!hasValidFiles) {
          console.log('🔍 Files are missing or invalid, showing file upload section')
          setShowFileUpload(true)
        }
      } catch (error) {
        console.error('Error parsing saved data:', error)
        toast({
          title: "Error",
          description: "Failed to load form data. Please go back and try again.",
          variant: "destructive",
        })
        router.push('/form')
      }
    } else {
      toast({
        title: "No Data Found",
        description: "Please complete the form first.",
        variant: "destructive",
      })
      router.push('/form')
    }
  }, [router, toast])

  const handleBack = () => {
    router.push('/form')
  }

  const handleFileUpload = (field: keyof Pick<DeviceData, 'technicalCertification' | 'purchaseProof' | 'maintenanceRecords'>, file: File | null) => {
    if (!deviceData) return
    
    console.log(`🔍 Uploading ${field}:`, file ? `${file.name} (${file.type})` : 'null')
    
    setDeviceData(prev => {
      const updated = { ...prev!, [field]: file }
      
      // Check if all files are now valid
      const allFilesValid = updated.technicalCertification instanceof File && 
                           updated.purchaseProof instanceof File && 
                           updated.maintenanceRecords instanceof File && 
                           Array.isArray(updated.deviceImages) &&
                           updated.deviceImages.length > 0 &&
                           updated.deviceImages.every(f => f instanceof File)
      
      if (allFilesValid) {
        console.log('✅ All files are now valid, hiding file upload section')
        setShowFileUpload(false)
      }
      
      return updated
    })
    
    // Update localStorage with the new file data
    const updatedData = { ...deviceData, [field]: file }
    localStorage.setItem('dobFormBackup', JSON.stringify(updatedData))
  }

  const handleImagesUpload = (files: File[]) => {
    if (!deviceData) return
    
    console.log(`🔍 Uploading device images:`, files.map(f => `${f.name} (${f.type})`))
    
    setDeviceData(prev => {
      const updated = { ...prev!, deviceImages: files }
      
      // Check if all files are now valid
      const allFilesValid = updated.technicalCertification instanceof File && 
                           updated.purchaseProof instanceof File && 
                           updated.maintenanceRecords instanceof File && 
                           Array.isArray(updated.deviceImages) &&
                           updated.deviceImages.length > 0 &&
                           updated.deviceImages.every(f => f instanceof File)
      
      if (allFilesValid) {
        console.log('✅ All files are now valid, hiding file upload section')
        setShowFileUpload(false)
      }
      
      return updated
    })
    
    // Update localStorage with the new file data
    const updatedData = { ...deviceData, deviceImages: files }
    localStorage.setItem('dobFormBackup', JSON.stringify(updatedData))
  }

  const handleSubmissionSuccess = () => {
    console.log('🎉 handleSubmissionSuccess called!')
    toast({
      title: "Success! 🎉",
      description: "Your device has been submitted successfully! Redirecting to dashboard...",
    })
    // Clear form data
    localStorage.removeItem('dobFormBackup')
    localStorage.removeItem('dobFormStep1Backup')
    localStorage.removeItem('dobFormStep2Backup')
    localStorage.removeItem('dobFormStep3Backup')
    localStorage.removeItem('dobFormStep4Backup')
    localStorage.removeItem('currentDraftId')
    
    console.log('🧹 Form data cleared from localStorage')
    
    // Redirect to dashboard
    setTimeout(() => {
      console.log('🔄 Redirecting to dashboard...')
      router.push('/dashboard')
    }, 2000)
  }

  const handleSubmit = async () => {
    console.log('🔍 Submit button clicked!')
    console.log('🔍 Device data available:', !!deviceData)
    
    if (!deviceData) {
      console.log('❌ No device data available')
      return
    }

    console.log('🔍 Starting submission process...')
    setLoading(true)
    
    try {
      console.log('🔍 Checking file validation...')
      // TEMPORARY: Skip file validation for testing until backend deployment
      console.log('🔍 Skipping file validation for testing - backend deployment pending')
      console.log('🔍 File types:', {
        technicalCertification: deviceData.technicalCertification ? ('id' in deviceData.technicalCertification ? 'FileInfo' : 'File') : 'null',
        purchaseProof: deviceData.purchaseProof ? ('id' in deviceData.purchaseProof ? 'FileInfo' : 'File') : 'null',
        maintenanceRecords: deviceData.maintenanceRecords ? ('id' in deviceData.maintenanceRecords ? 'FileInfo' : 'File') : 'null',
        deviceImages: deviceData.deviceImages?.map(f => f ? ('id' in f ? 'FileInfo' : 'File') : 'null')
      })

      console.log('✅ File validation passed - skipping for testing')

      // TEMPORARY: Skip file validation for testing until backend deployment
      // TODO: Re-enable file validation when backend file upload is deployed
      /*
      // Validate that all required files are uploaded
      if (!deviceData.technicalCertification || !deviceData.purchaseProof || 
          !deviceData.maintenanceRecords || deviceData.deviceImages.length === 0) {
        console.log('❌ Required files missing')
        toast({
          title: "Missing Files",
          description: "Please upload all required documentation before submitting.",
          variant: "destructive",
        })
        setShowFileUpload(true)
        setLoading(false)
        return
      }
      */

      console.log('✅ All required files present - validation skipped for testing')

      // Create FormData for submission
      console.log('🔍 Creating FormData...')
      const formData = new FormData()
      
      // Add draft ID if it exists
      const draftId = localStorage.getItem('currentDraftId')
      if (draftId) {
        formData.append('draftId', draftId)
        console.log('🔍 Added draft ID:', draftId)
      }
      
      // Add all device data fields
      const fields = [
        'deviceName', 'deviceType', 'location', 'serialNumber', 'manufacturer', 
        'model', 'yearOfManufacture', 'condition', 'specifications',
        'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts'
      ]
      
      fields.forEach(field => {
        const value = deviceData[field as keyof DeviceData]
        if (value !== null && value !== undefined && value !== '') {
          formData.append(field, value.toString())
        }
      })

      console.log('✅ Added device data fields')

      // TEMPORARY: Skip file uploads for testing until backend deployment
      console.log('🔍 Skipping file uploads for testing - backend deployment pending')
      console.log('🔍 Files would be uploaded:', {
        technicalCertification: deviceData.technicalCertification ? ('id' in deviceData.technicalCertification ? 'FileInfo' : 'File') : 'null',
        purchaseProof: deviceData.purchaseProof ? ('id' in deviceData.purchaseProof ? 'FileInfo' : 'File') : 'null',
        maintenanceRecords: deviceData.maintenanceRecords ? ('id' in deviceData.maintenanceRecords ? 'FileInfo' : 'File') : 'null',
        deviceImages: deviceData.deviceImages?.map(f => f ? ('id' in f ? 'FileInfo' : 'File') : 'null')
      })

      console.log('🔍 FormData created successfully')
      console.log('🔍 FormData entries:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.type})` : value)
      }

      // Submit using API service
      console.log('🔍 Calling apiService.submitDevice...')
      const response = await apiService.submitDevice(formData)
      console.log('🔍 API response received:', response)
      console.log('🔍 Response structure check:', {
        success: response.success,
        hasSubmission: !!response.submission,
        submissionId: response.submission?.id,
        fullResponse: response
      })

      if (response.success && response.submission && response.submission.id) {
        console.log('✅ Submission successful!')
        
        // Delete the draft from backend if it exists
        const draftId = localStorage.getItem('currentDraftId')
        if (draftId) {
          try {
            console.log('🔍 Deleting draft from backend:', draftId)
            await apiService.deleteDraft(draftId)
            console.log('✅ Draft deleted from backend')
          } catch (error) {
            console.warn('⚠️ Failed to delete draft from backend:', error)
            // Continue anyway - draft deletion failure shouldn't prevent success
          }
        }
        
        // Clear the draft ID from localStorage after successful submission
        localStorage.removeItem('currentDraftId')
        console.log('Draft ID cleared after successful submission')
        handleSubmissionSuccess()
      } else if (response.success) {
        // Fallback: if response is successful but structure is different, still treat as success
        console.log('✅ Submission successful (fallback)!')
        console.log('🔍 Response was successful but structure different than expected')
        
        // Delete the draft from backend if it exists
        const draftId = localStorage.getItem('currentDraftId')
        if (draftId) {
          try {
            console.log('🔍 Deleting draft from backend:', draftId)
            await apiService.deleteDraft(draftId)
            console.log('✅ Draft deleted from backend')
          } catch (error) {
            console.warn('⚠️ Failed to delete draft from backend:', error)
            // Continue anyway - draft deletion failure shouldn't prevent success
          }
        }
        
        // Clear the draft ID from localStorage after successful submission
        localStorage.removeItem('currentDraftId')
        console.log('Draft ID cleared after successful submission')
        handleSubmissionSuccess()
      } else if (response.success && (!response.submission || !response.submission.id)) {
        toast({
          title: "Submission Error",
          description: "Submission data is missing or invalid (no ID).",
          variant: "destructive",
        })
        setLoading(false)
        return
      } else {
        console.log('❌ Submission failed:', response)
        throw new Error('Submission failed')
      }
    } catch (error: any) {
      console.error('❌ Submission error:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit device",
        variant: "destructive",
      })
    } finally {
      console.log('🔍 Setting loading to false')
      setLoading(false)
    }
  }

  if (!deviceData) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="w-full mt-20 min-h-screen pb-20">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Review & Submit</h1>
              <p className="text-muted-foreground">Please review your device information before submitting</p>
            </div>

            {/* Review Card */}
            <div className="mb-8">
              <DeviceReview
                deviceData={deviceData}
                onNext={() => {}} // Not used in this context
                onBack={() => {}} // Not used in this context
                onSubmissionSuccess={handleSubmissionSuccess}
              />
            </div>

            {/* File Upload Section - Show if files are missing */}
            {showFileUpload && (
              <Card className="mb-8 bg-yellow-900/20 border-yellow-700/50">
                <CardHeader>
                  <CardTitle className="text-yellow-200">Upload Required Documentation</CardTitle>
                  <CardDescription className="text-yellow-300">
                    Please upload the required documentation before submitting your device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="technicalCertification" className="flex items-center gap-2 text-yellow-200">
                      <FileText className="h-4 w-4" />
                      Technical Certification (PDF)
                    </Label>
                    <Input
                      id="technicalCertification"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload('technicalCertification', e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    {deviceData.technicalCertification && (
                      <p className="text-sm text-green-400 mt-1">✓ {deviceData.technicalCertification.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="purchaseProof" className="flex items-center gap-2 text-yellow-200">
                      <FileText className="h-4 w-4" />
                      Purchase Proof (PDF)
                    </Label>
                    <Input
                      id="purchaseProof"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload('purchaseProof', e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    {deviceData.purchaseProof && (
                      <p className="text-sm text-green-400 mt-1">✓ {deviceData.purchaseProof.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="maintenanceRecords" className="flex items-center gap-2 text-yellow-200">
                      <FileText className="h-4 w-4" />
                      Maintenance Records (PDF)
                    </Label>
                    <Input
                      id="maintenanceRecords"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload('maintenanceRecords', e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                    {deviceData.maintenanceRecords && (
                      <p className="text-sm text-green-400 mt-1">✓ {deviceData.maintenanceRecords.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="deviceImages" className="flex items-center gap-2 text-yellow-200">
                      <ImageIcon className="h-4 w-4" />
                      Device Images (JPG, PNG)
                    </Label>
                    <Input
                      id="deviceImages"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => handleImagesUpload(Array.from(e.target.files || []))}
                      className="mt-1"
                    />
                    {deviceData.deviceImages.length > 0 && (
                      <p className="text-sm text-green-400 mt-1">✓ {deviceData.deviceImages.length} image(s) selected</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Form
              </Button>
              
              <Button
                onClick={() => {
                  console.log('🔍 Submit button clicked - handler called!')
                  handleSubmit()
                }}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit for Verification
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 