"use client"

import type React from "react"
import type { DeviceData } from "@/components/device-verification-flow"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, Plus } from "lucide-react"
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'
import { generateFileName } from '@/lib/fileNaming'

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
    additionalDocuments: [] as number[],
  })
  const maxSize = 10 * 1024 * 1024 // 10MB
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Get operatorId from wallet address
  const operatorId = typeof window !== 'undefined' ? localStorage.getItem('stellarPublicKey') || 'unknown' : 'unknown'

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!deviceData.technicalCertification) newErrors.technicalCertification = "Technical certification is required (PDF, max 10MB)"
    if (!deviceData.purchaseProof) newErrors.purchaseProof = "Purchase proof is required (PDF, max 10MB)"
    if (!deviceData.maintenanceRecords) newErrors.maintenanceRecords = "Maintenance records are required (PDF, max 10MB)"
    // Additional documents are optional, but check size/type if present
    deviceData.additionalDocuments.forEach((file, idx) => {
      if (file.size > 10 * 1024 * 1024) newErrors[`additionalDocuments_${idx}`] = "File too large (max 10MB)"
      if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'].includes(file.name.split('.').pop()?.toLowerCase() || '')) newErrors[`additionalDocuments_${idx}`] = "Invalid file type"
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

  const handleAdditionalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      updateDeviceData({
        additionalDocuments: [...deviceData.additionalDocuments, ...newFiles],
      })
    }
  }

  const removeAdditionalFile = (index: number) => {
    const updatedFiles = [...deviceData.additionalDocuments]
    updatedFiles.splice(index, 1)
    updateDeviceData({ additionalDocuments: updatedFiles })
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
        // Optionally handle fileRejections for error UI
      },
    })
  }

  const getMultiDropzone = () => {
    return useDropzone({
      accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
      maxSize,
      onDrop: (acceptedFiles, fileRejections) => {
        if (acceptedFiles.length > 0) {
          // Generate convention-based file names for each file
          const namedFiles = acceptedFiles.map(file => new File([
            file
          ], generateFileName({
            operatorId,
            documentType: 'additionalDocument',
            originalName: file.name
          }), { type: file.type }))
          updateDeviceData({
            additionalDocuments: [...deviceData.additionalDocuments, ...namedFiles],
          })
          setProgress((prev) => ({ ...prev, additionalDocuments: [...(prev.additionalDocuments || []), 100] }))
        }
        // Optionally handle fileRejections for error UI
      },
    })
  }

  // Replace each file input section with dropzone logic
  // Example for technicalCertification:
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
    getRootProps: getAdditionalRootProps,
    getInputProps: getAdditionalInputProps,
    isDragActive: isAdditionalDragActive,
    fileRejections: additionalRejections,
  } = getMultiDropzone()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Documentation</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="technicalCertification" className="mb-2 block">
              Technical Certification
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
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
                    onClick={() => updateDeviceData({ technicalCertification: null })}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <label {...getTechCertRootProps()} className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-500">Upload technical certification</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</span>
                  </div>
                  <input {...getTechCertInputProps()} />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="purchaseProof" className="mb-2 block">
              Proof of Purchase
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
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
                    onClick={() => updateDeviceData({ purchaseProof: null })}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <label {...getPurchaseProofRootProps()} className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-500">Upload proof of purchase</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</span>
                  </div>
                  <input {...getPurchaseProofInputProps()} />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="maintenanceRecords" className="mb-2 block">
              Maintenance Records
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
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
                    onClick={() => updateDeviceData({ maintenanceRecords: null })}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <label {...getMaintenanceRootProps()} className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-500">Upload maintenance records</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</span>
                  </div>
                  <input {...getMaintenanceInputProps()} />
                </label>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Additional Documents (Optional)</Label>
              <label {...getAdditionalRootProps()} className="flex items-center text-[#6366F1] text-sm cursor-pointer">
                <div className="flex items-center">
                  <Plus size={16} className="mr-1" />
                  <span>Add file</span>
                </div>
                <input {...getAdditionalInputProps()} />
              </label>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              {deviceData.additionalDocuments.length > 0 ? (
                <div className="space-y-2">
                  {deviceData.additionalDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <FileText className="text-[#6366F1] mr-2" size={16} />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAdditionalFile(index)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">No additional documents added</div>
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
