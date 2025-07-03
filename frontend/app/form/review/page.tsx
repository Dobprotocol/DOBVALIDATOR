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
        
        // Check if files are missing and show file upload section
        const hasFiles = parsedData.technicalCertification || 
                        parsedData.purchaseProof || 
                        parsedData.maintenanceRecords || 
                        (parsedData.deviceImages && parsedData.deviceImages.length > 0)
        
        if (!hasFiles) {
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
    
    setDeviceData(prev => ({
      ...prev!,
      [field]: file
    }))
  }

  const handleImagesUpload = (files: File[]) => {
    if (!deviceData) return
    
    setDeviceData(prev => ({
      ...prev!,
      deviceImages: files
    }))
  }

  const handleSubmissionSuccess = () => {
    toast({
      title: "Success",
      description: "Your device has been submitted successfully!",
    })
    // Clear form data
    localStorage.removeItem('dobFormBackup')
    localStorage.removeItem('dobFormStep1Backup')
    localStorage.removeItem('dobFormStep2Backup')
    localStorage.removeItem('dobFormStep3Backup')
    localStorage.removeItem('dobFormStep4Backup')
    localStorage.removeItem('currentDraftId')
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleSubmit = async () => {
    if (!deviceData) return

    setLoading(true)
    try {
      // Enforce all file fields are File objects
      if (
        !(deviceData.technicalCertification instanceof File) ||
        !(deviceData.purchaseProof instanceof File) ||
        !(deviceData.maintenanceRecords instanceof File) ||
        !Array.isArray(deviceData.deviceImages) ||
        !deviceData.deviceImages.length ||
        !deviceData.deviceImages.every(f => f instanceof File)
      ) {
        toast({
          title: "Missing or Invalid Files",
          description: "Please re-upload all required files before submitting.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate that all required files are uploaded
      if (!deviceData.technicalCertification || !deviceData.purchaseProof || 
          !deviceData.maintenanceRecords || deviceData.deviceImages.length === 0) {
        toast({
          title: "Missing Files",
          description: "Please upload all required documentation before submitting.",
          variant: "destructive",
        })
        setShowFileUpload(true)
        setLoading(false)
        return
      }

      // Create FormData for submission
      const formData = new FormData()
      
      // Add draft ID if it exists
      const draftId = localStorage.getItem('currentDraftId')
      if (draftId) {
        formData.append('draftId', draftId)
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

      // Add files
      if (deviceData.technicalCertification) {
        formData.append('technicalCertification', deviceData.technicalCertification)
      }
      if (deviceData.purchaseProof) {
        formData.append('purchaseProof', deviceData.purchaseProof)
      }
      if (deviceData.maintenanceRecords) {
        formData.append('maintenanceRecords', deviceData.maintenanceRecords)
      }
      if (deviceData.deviceImages && deviceData.deviceImages.length > 0) {
        deviceData.deviceImages.forEach((file, index) => {
          formData.append(`deviceImages[${index}]`, file)
        })
      }

      // Submit using API service
      const response = await apiService.submitDevice(formData)

      if (response.success) {
        // Clear the draft ID from localStorage after successful submission
        localStorage.removeItem('currentDraftId')
        console.log('Draft ID cleared after successful submission')
        handleSubmissionSuccess()
      } else {
        throw new Error('Submission failed')
      }
    } catch (error: any) {
      console.error('Submission error:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit device",
        variant: "destructive",
      })
    } finally {
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
                onClick={handleSubmit}
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