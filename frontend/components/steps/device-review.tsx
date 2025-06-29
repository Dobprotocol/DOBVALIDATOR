"use client"

import type { DeviceData } from "@/components/enhanced-device-verification-flow"
import { Button } from "@/components/ui/button"
import { FileText, Image as ImageIcon, Send } from "lucide-react"
import { useState } from "react"
import Image from 'next/image'
import { useToast } from "@/components/ui/use-toast"
import { apiService } from '@/lib/api-service'
import { useIsMobile } from "@/hooks/use-mobile"

interface DeviceReviewProps {
  deviceData: DeviceData
  onNext: () => void
  onBack: () => void
  onSubmissionSuccess: () => void
}

export function DeviceReview({ deviceData, onNext, onBack, onSubmissionSuccess }: DeviceReviewProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ field: string; error: string }[]>([])
  const { toast } = useToast()

  const formatCurrency = (value: string) => {
    if (!value || isNaN(Number(value))) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value))
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError('')
    setValidationErrors([])

    // Validate required fields before submission
    const requiredFields = [
      'deviceName', 'deviceType', 'location', 'serialNumber', 'manufacturer', 
      'model', 'yearOfManufacture', 'condition', 'specifications',
      'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts'
    ]
    
    const missingFields = requiredFields.filter(field => {
      const value = deviceData[field as keyof DeviceData]
      return !value || (typeof value === 'string' && value.trim() === '')
    })
    
    if (missingFields.length > 0) {
      setError(`Please complete the following fields: ${missingFields.join(', ')}`)
      setLoading(false)
      return
    }

    try {
      // Create FormData for submission
      const formData = new FormData()
      
      // Add draft ID if it exists
      const draftId = localStorage.getItem('currentDraftId')
      if (draftId) {
        formData.append('draftId', draftId)
      }
      
      // Add all device data to formData
      Object.entries(deviceData).forEach(([key, value]) => {
        if (value === null || value === undefined) return
        
        if (typeof value === 'string' || typeof value === 'number') {
          formData.append(key, value.toString())
        } else if (Array.isArray(value)) {
          value.forEach((file, idx) => {
            if (file instanceof File) {
              formData.append(`${key}[${idx}]`, file)
            }
          })
        } else if (value instanceof File) {
          formData.append(key, value)
        }
      })

      console.log('🔍 Submitting form data:')
      for (let [key, value] of formData.entries()) {
        console.log(`🔍 ${key}:`, value)
      }

      // Submit using API service
      const response = await apiService.submitDevice(formData)

      if (response.success) {
        // Clear the draft ID from localStorage after successful submission
        localStorage.removeItem('currentDraftId')
        console.log('Draft ID cleared after successful submission')

        setSuccess(true)
        toast({
          title: "Success",
          description: "Your submission has been received",
        })
        
        // Call the success callback to trigger the success modal
        onSubmissionSuccess()
        onNext()
      } else {
        throw new Error(response.message || 'Submission failed')
      }
    } catch (err: any) {
      console.error('Submission error:', err)
      
      // Handle validation errors
      if (err.status === 400 && err.errors) {
        setValidationErrors(err.errors)
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive",
        })
      } else {
        setError(err.message || 'Submission failed. Please try again.')
        toast({
          title: "Error",
          description: err.message || 'Submission failed. Please try again.',
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
      <h2 className="text-xl font-medium text-white mb-6">Review Information</h2>

      {/* Check for missing required fields */}
      {(() => {
        const requiredFields = [
          'deviceName', 'deviceType', 'location', 'serialNumber', 'manufacturer', 
          'model', 'yearOfManufacture', 'condition', 'specifications',
          'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts'
        ]
        
        const missingFields = requiredFields.filter(field => {
          const value = deviceData[field as keyof DeviceData]
          return !value || (typeof value === 'string' && value.trim() === '')
        })
        
        if (missingFields.length > 0) {
          return (
            <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-700/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-yellow-200 font-medium mb-2">⚠️ Incomplete Form</h3>
              <p className="text-yellow-300 text-sm">
                Please complete the following fields before submitting: <strong>{missingFields.join(', ')}</strong>
              </p>
            </div>
          )
        }
        return null
      })()}

      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-lg backdrop-blur-sm">
          <h3 className="text-red-200 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-red-300 text-sm">
                {error.field}: {error.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-medium text-white mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-300">Device Name</p>
              <p className="font-medium text-white">{deviceData.deviceName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Device Type</p>
              <p className="font-medium text-white">
                {deviceData.deviceType === 'other' && deviceData.customDeviceType 
                  ? deviceData.customDeviceType 
                  : deviceData.deviceType || "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-300">Location</p>
              <p className="font-medium text-white">{deviceData.location || "-"}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-white mb-3">Technical Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-300">Serial Number</p>
              <p className="font-medium text-white">{deviceData.serialNumber || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Manufacturer</p>
              <p className="font-medium text-white">{deviceData.manufacturer || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Model</p>
              <p className="font-medium text-white">{deviceData.model || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Year of Manufacture</p>
              <p className="font-medium text-white">{deviceData.yearOfManufacture || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Condition</p>
              <p className="font-medium text-white">{deviceData.condition || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-300">Technical Specifications</p>
              <p className="font-medium text-white whitespace-pre-wrap">{deviceData.specifications || "-"}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-white mb-3">Financial Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-300">Purchase Price</p>
              <p className={`font-medium ${!deviceData.purchasePrice ? 'text-red-400' : 'text-white'}`}>
                {deviceData.purchasePrice ? formatCurrency(deviceData.purchasePrice) : 'Missing'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Current Value</p>
              <p className={`font-medium ${!deviceData.currentValue ? 'text-red-400' : 'text-white'}`}>
                {deviceData.currentValue ? formatCurrency(deviceData.currentValue) : 'Missing'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Expected Annual Revenue</p>
              <p className={`font-medium ${!deviceData.expectedRevenue ? 'text-red-400' : 'text-white'}`}>
                {deviceData.expectedRevenue ? formatCurrency(deviceData.expectedRevenue) : 'Missing'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Annual Operational Costs</p>
              <p className={`font-medium ${!deviceData.operationalCosts ? 'text-red-400' : 'text-white'}`}>
                {deviceData.operationalCosts ? formatCurrency(deviceData.operationalCosts) : 'Missing'}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Documentation</h3>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="text-[#6366F1] mr-2" size={18} />
              <div>
                <p className="font-medium">Technical Certification</p>
                <p className="text-sm text-gray-500">{deviceData.technicalCertification?.name || "Not uploaded"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FileText className="text-[#6366F1] mr-2" size={18} />
              <div>
                <p className="font-medium">Proof of Purchase</p>
                <p className="text-sm text-gray-500">{deviceData.purchaseProof?.name || "Not uploaded"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FileText className="text-[#6366F1] mr-2" size={18} />
              <div>
                <p className="font-medium">Maintenance Records</p>
                <p className="text-sm text-gray-500">{deviceData.maintenanceRecords?.name || "Not uploaded"}</p>
              </div>
            </div>

            {deviceData.deviceImages.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <ImageIcon className="text-[#6366F1] mr-2" size={18} />
                  <p className="font-medium">Device Images</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {deviceData.deviceImages.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Device image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 pt-4 border-t flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="bg-[#6366F1] hover:bg-[#5355d1] text-white btn-primary"
          onClick={handleFinalSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {useIsMobile() ? "" : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2 md:mr-2" />
              {useIsMobile() ? "" : "Submit for Verification"}
            </>
          )}
        </Button>
      </div>

      {success && (
        <div className="mt-4 text-center text-green-500">
          Submission successful!
        </div>
      )}

      {error && (
        <div className="mt-4 text-center text-red-500">
          {error}
        </div>
      )}
    </div>
  )
}
