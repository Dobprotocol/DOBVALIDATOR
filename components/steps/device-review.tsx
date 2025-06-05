"use client"

import type { DeviceData } from "@/components/device-verification-flow"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface DeviceReviewProps {
  deviceData: DeviceData
  onNext: () => void
  onBack: () => void
}

export function DeviceReview({ deviceData, onNext, onBack }: DeviceReviewProps) {
  const formatCurrency = (value: string) => {
    if (!value) return "-"
    return `$${Number.parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

            {deviceData.additionalDocuments.length > 0 && (
              <div>
                <p className="font-medium mb-2">Additional Documents</p>
                <div className="space-y-1 pl-6">
                  {deviceData.additionalDocuments.map((file, index) => (
                    <div key={index} className="flex items-center">
                      <FileText className="text-gray-400 mr-2" size={14} />
                      <p className="text-sm text-gray-500">{file.name}</p>
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
        <Button type="button" className="bg-[#6366F1] hover:bg-[#5355d1] text-white" onClick={onNext}>
          Submit for Verification
        </Button>
      </div>
    </div>
  )
}
