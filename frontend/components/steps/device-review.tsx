"use client"

import type { DeviceData } from "@/components/device-verification-flow"
import { Button } from "@/components/ui/button"
import { FileText, Image as ImageIcon } from "lucide-react"
import { useState } from "react"
import Image from 'next/image'

interface DeviceReviewProps {
  deviceData: DeviceData
  onNext: () => void
  onBack: () => void
}

export function DeviceReview({ deviceData, onNext, onBack }: DeviceReviewProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (value: string) => {
    if (!value) return "-"
    return `$${Number.parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const formData = new FormData()
      // Append all fields
      Object.entries(deviceData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (Array.isArray(value)) {
          value.forEach((file, idx) => {
            if (file instanceof File) {
              formData.append(`${key}[${idx}]`, file)
            }
          })
        } else {
          formData.append(key, value as string)
        }
      })
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())
      setSuccess(true)
      onNext()
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Review Information</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Device Name</p>
              <p className="font-medium">{deviceData.deviceName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Device Type</p>
              <p className="font-medium">{deviceData.deviceType || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="font-medium">{deviceData.serialNumber || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Manufacturer</p>
              <p className="font-medium">{deviceData.manufacturer || "-"}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Technical Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium">{deviceData.model || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year of Manufacture</p>
              <p className="font-medium">{deviceData.yearOfManufacture || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Condition</p>
              <p className="font-medium">{deviceData.condition || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Technical Specifications</p>
              <p className="font-medium whitespace-pre-wrap">{deviceData.specifications || "-"}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Financial Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Purchase Price</p>
              <p className="font-medium">{formatCurrency(deviceData.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="font-medium">{formatCurrency(deviceData.currentValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expected Annual Revenue</p>
              <p className="font-medium">{formatCurrency(deviceData.expectedRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Annual Operational Costs</p>
              <p className="font-medium">{formatCurrency(deviceData.operationalCosts)}</p>
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
        <Button type="button" className="bg-[#6366F1] hover:bg-[#5355d1] text-white" onClick={handleFinalSubmit}>
          {loading ? "Submitting..." : "Submit for Verification"}
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
