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

    // TEMPORARY: Skip file validation for testing until backend deployment
    console.log('🔍 Skipping file validation for testing - backend deployment pending')
    console.log('🔍 File types:', {
      technicalCertification: deviceData.technicalCertification ? ('id' in deviceData.technicalCertification ? 'FileInfo' : 'File') : 'null',
      purchaseProof: deviceData.purchaseProof ? ('id' in deviceData.purchaseProof ? 'FileInfo' : 'File') : 'null',
      maintenanceRecords: deviceData.maintenanceRecords ? ('id' in deviceData.maintenanceRecords ? 'FileInfo' : 'File') : 'null',
      deviceImages: deviceData.deviceImages?.map(f => f ? ('id' in f ? 'FileInfo' : 'File') : 'null')
    })

    try {
      // Create FormData for submission
      const formData = new FormData()
      
      // Add draft ID if it exists
      const draftId = localStorage.getItem('currentDraftId')
      if (draftId) {
        formData.append('draftId', draftId)
      }
      
      // Only add fields that are defined in the backend schema
      const backendFields = [
        'deviceName', 'deviceType', 'location', 'serialNumber', 'manufacturer', 
        'model', 'yearOfManufacture', 'condition', 'specifications',
        'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts'
      ]
      
      // Note: customDeviceType removed since "OTHER" option was removed from device types
      
      // Add all backend-defined device data to formData
      backendFields.forEach(field => {
        const value = deviceData[field as keyof DeviceData]
        if (value !== null && value !== undefined && value !== '') {
          formData.append(field, value.toString())
        }
      })

      // TEMPORARY: Skip file uploads for testing until backend deployment
      console.log('🔍 Skipping file uploads for testing - backend deployment pending')
      console.log('🔍 Files would be uploaded:', {
        technicalCertification: deviceData.technicalCertification ? ('id' in deviceData.technicalCertification ? 'FileInfo' : 'File') : 'null',
        purchaseProof: deviceData.purchaseProof ? ('id' in deviceData.purchaseProof ? 'FileInfo' : 'File') : 'null',
        maintenanceRecords: deviceData.maintenanceRecords ? ('id' in deviceData.maintenanceRecords ? 'FileInfo' : 'File') : 'null',
        deviceImages: deviceData.deviceImages?.map(f => f ? ('id' in f ? 'FileInfo' : 'File') : 'null')
      })

      console.log('🔍 Submitting form data:')
      for (let [key, value] of formData.entries()) {
        console.log(`🔍 ${key}:`, value instanceof File ? value.name : value)
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
        throw new Error('Submission failed')
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

      {/* Validation message removed - now handled on the form page */}

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
              <p className="font-medium text-white">{deviceData.deviceType || "-"}</p>
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
          <h3 className="text-lg font-medium text-white mb-3">Documentation</h3>
          <div className="space-y-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg">
            {/* Technical Certification */}
            <div className="flex items-start space-x-3">
              <FileText className="text-blue-400 mt-1" size={18} />
              <div className="flex-1">
                <p className="font-medium text-white">Technical Certification</p>
                {deviceData.technicalCertification ? (
                  <div className="mt-1">
                    <p className="text-sm text-gray-300">{deviceData.technicalCertification.name || 'Technical Certification'}</p>
                    <p className="text-xs text-gray-400">
                      Size: {deviceData.technicalCertification.size ? (deviceData.technicalCertification.size / 1024 / 1024).toFixed(2) : 'Unknown'} MB
                    </p>
                    {deviceData.technicalCertification.type === 'application/pdf' && (
                      <div className="mt-2">
                        <iframe
                          src={URL.createObjectURL(deviceData.technicalCertification)}
                          className="w-full h-32 border border-gray-600 rounded"
                          title="Technical Certification Preview"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-400">Not uploaded</p>
                )}
              </div>
            </div>

            {/* Purchase Proof */}
            <div className="flex items-start space-x-3">
              <FileText className="text-blue-400 mt-1" size={18} />
              <div className="flex-1">
                <p className="font-medium text-white">Proof of Purchase</p>
                {deviceData.purchaseProof ? (
                  <div className="mt-1">
                    <p className="text-sm text-gray-300">{deviceData.purchaseProof.name || 'Purchase Proof'}</p>
                    <p className="text-xs text-gray-400">
                      Size: {deviceData.purchaseProof.size ? (deviceData.purchaseProof.size / 1024 / 1024).toFixed(2) : 'Unknown'} MB
                    </p>
                    {deviceData.purchaseProof.type === 'application/pdf' && (
                      <div className="mt-2">
                        <iframe
                          src={URL.createObjectURL(deviceData.purchaseProof)}
                          className="w-full h-32 border border-gray-600 rounded"
                          title="Purchase Proof Preview"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-400">Not uploaded</p>
                )}
              </div>
            </div>

            {/* Maintenance Records */}
            <div className="flex items-start space-x-3">
              <FileText className="text-blue-400 mt-1" size={18} />
              <div className="flex-1">
                <p className="font-medium text-white">Maintenance Records</p>
                {deviceData.maintenanceRecords ? (
                  <div className="mt-1">
                    <p className="text-sm text-gray-300">{deviceData.maintenanceRecords.name || 'Maintenance Records'}</p>
                    <p className="text-xs text-gray-400">
                      Size: {deviceData.maintenanceRecords.size ? (deviceData.maintenanceRecords.size / 1024 / 1024).toFixed(2) : 'Unknown'} MB
                    </p>
                    {deviceData.maintenanceRecords.type === 'application/pdf' && (
                      <div className="mt-2">
                        <iframe
                          src={URL.createObjectURL(deviceData.maintenanceRecords)}
                          className="w-full h-32 border border-gray-600 rounded"
                          title="Maintenance Records Preview"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-400">Not uploaded</p>
                )}
              </div>
            </div>

            {/* Device Images */}
            {deviceData.deviceImages && deviceData.deviceImages.length > 0 && (
              <div>
                <div className="flex items-center mb-3">
                  <ImageIcon className="text-blue-400 mr-2" size={18} />
                  <p className="font-medium text-white">Device Images ({deviceData.deviceImages.length} files)</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {deviceData.deviceImages.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                        {file && file.type && file.type.startsWith('image/') ? (
                          <img
                        src={URL.createObjectURL(file)}
                            alt={`Device Image ${index + 1}`}
                            className="w-full h-full object-cover"
                      />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 truncate">{file?.name || `Image ${index + 1}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Navigation buttons removed - handled by parent component */}

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
