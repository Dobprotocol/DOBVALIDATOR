"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { PlusCircle, FileText, Edit, Eye, AlertCircle } from "lucide-react"
import { RejectionReviewModal } from "@/components/ui/rejection-review-modal"
import { CertificateModal } from "@/components/ui/certificate-modal"
import { AuthGuard } from "@/components/auth-guard"

const mockDevices = [
  {
    id: 1,
    deviceName: "Solar Inverter X1",
    deviceType: "Inverter",
    manufacturer: "SunPower",
    submittedAt: "2024-06-01",
    status: "approved",
    // Certificate data
    certificateData: {
      deviceName: "Solar Inverter X1",
      deviceType: "Inverter",
      manufacturer: "SunPower",
      validatedAt: "2024-06-15",
      validator: "DOB Validation Team",
      trufaScore: 92,
      certificateId: "CERT-2024-001",
      blockchainTx: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      validationCriteria: {
        technical: true,
        financial: true,
        operational: true,
        regulatory: true,
      },
      investmentGrade: "A+",
      riskLevel: "Low",
    }
  },
  {
    id: 2,
    deviceName: "Battery Pack B2",
    deviceType: "Battery",
    manufacturer: "PowerCell",
    submittedAt: "2024-06-03",
    status: "under review",
  },
  {
    id: 3,
    deviceName: "Wind Turbine W3",
    deviceType: "Turbine",
    manufacturer: "WindGen",
    submittedAt: "2024-06-05",
    status: "rejected",
    // Rejection data
    rejectionData: {
      deviceName: "Wind Turbine W3",
      deviceType: "Turbine",
      manufacturer: "WindGen",
      submittedAt: "2024-06-05",
      rejectedAt: "2024-06-12",
      rejectionReason: "Insufficient technical documentation and missing safety certifications",
      reviewer: "DOB Validation Team",
      reviewerNotes: "The submitted technical documentation does not meet our standards for wind turbine validation. Missing critical safety certifications and operational history. Please provide complete technical specifications, safety certifications, and at least 6 months of operational data before resubmitting.",
    }
  },
  {
    id: 4,
    deviceName: "Draft Device",
    deviceType: "Sensor",
    manufacturer: "DraftTech",
    submittedAt: "2024-06-10",
    status: "draft",
  },
]

const statusColor = {
  approved: "success",
  "under review": "warning",
  rejected: "destructive",
  draft: "secondary",
}

export default function MockupDashboardPage() {
  const router = useRouter()
  const [selectedRejection, setSelectedRejection] = useState<any>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)

  const handleCreateDevice = () => {
    router.push('/form')
  }

  const handleEditDevice = (deviceId: number) => {
    // For now, just navigate to form with a query parameter
    router.push(`/form?edit=${deviceId}`)
  }

  const handleViewRejection = (device: any) => {
    setSelectedRejection(device.rejectionData)
  }

  const handleViewCertificate = (device: any) => {
    setSelectedCertificate(device.certificateData)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">My Devices</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your device submissions and track their status
            </p>
          </div>
          <div className="flex justify-end mt-8 mb-8">
            <Button
              onClick={handleCreateDevice}
              className="inline-flex items-center gap-2 text-base py-3 px-6 rounded-lg font-semibold shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              Validate New Device
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border bg-card rounded-lg shadow">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockDevices.map((device) => (
                  <tr key={device.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">{device.deviceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{device.deviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{device.manufacturer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{device.submittedAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusColor[device.status] || "secondary"} className="capitalize">
                        {device.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {device.status === "approved" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => handleViewCertificate(device)}
                        >
                          <Eye className="h-4 w-4" />
                          View Certificate
                        </Button>
                      )}
                      {device.status === "rejected" && (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="gap-2"
                          onClick={() => handleViewRejection(device)}
                        >
                          <AlertCircle className="h-4 w-4" />
                          Review Reason
                        </Button>
                      )}
                      {device.status === "draft" && (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="gap-2"
                          onClick={() => handleEditDevice(device.id)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      {device.status === "under review" && (
                        <Button size="sm" variant="ghost" className="gap-2" disabled>
                          <FileText className="h-4 w-4" />
                          In Review
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </AuthGuard>
  )
} 