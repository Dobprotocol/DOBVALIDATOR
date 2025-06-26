"use client"

import type React from "react"
import type { DeviceData } from "@/components/device-verification-flow"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react"
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'
import { generateFileName } from '@/lib/fileNaming'
import Image from 'next/image'

interface DeviceDocumentationProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
  onBack: () => void
}

export function DeviceDocumentation({ deviceData, updateDeviceData, onNext, onBack }: DeviceDocumentationProps) {
  const [progress, setProgress] = useState({
    technicalCertification: 0,
    purchaseProof: 0,
    maintenanceRecords: 0,
    deviceImages: [] as number[],
  })
  const maxSize = 10 * 1024 * 1024 // 10MB
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Get operatorId from wallet address
  const operatorId = typeof window !== 'undefined' ? localStorage.getItem('stellarPublicKey') || 'unknown' : 'unknown'

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!deviceData.technicalCertification) newErrors.technicalCertification = "Technical certification is required (PDF, max 10MB)"
    if (!deviceData.purchaseProof) newErrors.purchaseProof = "Purchase proof is required (PDF, max 10MB)"
    if (!deviceData.maintenanceRecords) newErrors.maintenanceRecords = "Maintenance records are required (PDF, max 10MB)"
    if (deviceData.deviceImages.length === 0) newErrors.deviceImages = "At least one device image is required"

    // Validate device images
    deviceData.deviceImages.forEach((file, idx) => {
      if (file.size > 10 * 1024 * 1024) newErrors[`deviceImages_${idx}`] = "Image too large (max 10MB)"
      if (!['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
        newErrors[`deviceImages_${idx}`] = "Only JPG, JPEG, and PNG images are allowed"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof DeviceData) => {
    if (e.target.files && e.target.files[0]) {
      updateDeviceData({ [field]: e.target.files[0] })
    }
  }

  const removeDeviceImage = (index: number) => {
    const updatedFiles = [...deviceData.deviceImages]
    const updatedPreviews = [...imagePreviews]
    updatedFiles.splice(index, 1)
    updatedPreviews.splice(index, 1)
    updateDeviceData({ deviceImages: updatedFiles })
    setImagePreviews(updatedPreviews)
  }

  // Helper for dropzone
  const getDropzone = (field: keyof DeviceData, accept: string) => {
    return useDropzone({
      accept: { [accept]: ['.pdf'] },
      maxFiles: 1,
      maxSize,
      onDrop: (acceptedFiles, fileRejections) => {
        if (acceptedFiles.length > 0) {
          // Generate convention-based file name
          const file = acceptedFiles[0]
          const namedFile = new File([file], generateFileName({
            operatorId,
            documentType: field,
            originalName: file.name
          }), { type: file.type })
          updateDeviceData({ [field]: namedFile })
          setProgress((prev) => ({ ...prev, [field]: 100 }))
        }
      },
    })
  }

  const getImageDropzone = () => {
    return useDropzone({
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      },
      maxSize,
      onDrop: (acceptedFiles, fileRejections) => {
        if (acceptedFiles.length > 0) {
          // Generate convention-based file names for each file
          const namedFiles = acceptedFiles.map(file => new File([file], generateFileName({
            operatorId,
            documentType: 'deviceImage',
            originalName: file.name
          }), { type: file.type }))

          // Create preview URLs for the new images
          const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file))

          updateDeviceData({
            deviceImages: [...deviceData.deviceImages, ...namedFiles],
          })
          setImagePreviews([...imagePreviews, ...newPreviews])
          setProgress((prev) => ({ ...prev, deviceImages: [...(prev.deviceImages || []), 100] }))
        }
      },
    })
  }

  // Replace each file input section with dropzone logic
  const {
    getRootProps: getTechCertRootProps,
    getInputProps: getTechCertInputProps,
    isDragActive: isTechCertDragActive,
    fileRejections: techCertRejections,
  } = getDropzone('technicalCertification', 'application/pdf')

  const {
    getRootProps: getPurchaseProofRootProps,
    getInputProps: getPurchaseProofInputProps,
    isDragActive: isPurchaseProofDragActive,
    fileRejections: purchaseProofRejections,
  } = getDropzone('purchaseProof', 'application/pdf')

  const {
    getRootProps: getMaintenanceRootProps,
    getInputProps: getMaintenanceInputProps,
    isDragActive: isMaintenanceDragActive,
    fileRejections: maintenanceRejections,
  } = getDropzone('maintenanceRecords', 'application/pdf')

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
    fileRejections: imageRejections,
  } = getImageDropzone()

  return (
    <div className="bg-background/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Documentation</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">
              Technical Certification
            </Label>
            <div {...getTechCertRootProps()} className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer">
              {deviceData.technicalCertification ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <FileText className="text-[#6366F1] mr-2" size={20} />
                    <span className="text-sm truncate max-w-[200px]">{deviceData.technicalCertification.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={e => { e.stopPropagation(); updateDeviceData({ technicalCertification: null }) }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Upload technical certification</span>
                  <span className="text-xs text-gray-400 mt-1">PDF only (max 10MB)</span>
                </div>
              )}
              <input {...getTechCertInputProps()} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">
              Proof of Purchase
            </Label>
            <div {...getPurchaseProofRootProps()} className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer">
              {deviceData.purchaseProof ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <FileText className="text-[#6366F1] mr-2" size={20} />
                    <span className="text-sm truncate max-w-[200px]">{deviceData.purchaseProof.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={e => { e.stopPropagation(); updateDeviceData({ purchaseProof: null }) }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Upload proof of purchase</span>
                  <span className="text-xs text-gray-400 mt-1">PDF only (max 10MB)</span>
                </div>
              )}
              <input {...getPurchaseProofInputProps()} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">
              Maintenance Records
            </Label>
            <div {...getMaintenanceRootProps()} className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer">
              {deviceData.maintenanceRecords ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <FileText className="text-[#6366F1] mr-2" size={20} />
                    <span className="text-sm truncate max-w-[200px]">{deviceData.maintenanceRecords.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={e => { e.stopPropagation(); updateDeviceData({ maintenanceRecords: null }) }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Upload maintenance records</span>
                  <span className="text-xs text-gray-400 mt-1">PDF only (max 10MB)</span>
                </div>
              )}
              <input {...getMaintenanceInputProps()} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">
              Device Images
            </Label>
            <div className="space-y-4">
              <div {...getImageRootProps()} className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer">
                <div className="flex flex-col items-center">
                  <ImageIcon className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Upload device images</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, JPEG, PNG (max 10MB each)</span>
                  <span className="text-xs text-gray-400 mt-1">Recommended size: 1920x1080 pixels</span>
                </div>
                <input {...getImageInputProps()} />
              </div>

              {errors.deviceImages && (
                <p className="text-red-500 text-sm">{errors.deviceImages}</p>
              )}

              {deviceData.deviceImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {deviceData.deviceImages.map((file, index) => {
                    const previewUrl = imagePreviews[index]
                    if (!previewUrl) return null // Skip rendering if no preview URL

                    return (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                          <Image
                            src={previewUrl}
                            alt={`Device image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => removeDeviceImage(index)}
                            >
                              <X size={16} className="text-white" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="bg-[#6366F1] hover:bg-[#5355d1] text-white">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
