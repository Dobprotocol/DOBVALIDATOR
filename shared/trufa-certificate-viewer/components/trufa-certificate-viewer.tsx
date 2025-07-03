"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, CheckCircle, Calendar, ExternalLink, Download, QrCode, Building, Hash, Award } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TrufaCertificateData {
  projectId: string
  certificateId: string
  projectName: string
  operatorName: string
  validationDate: string
  expiryDate: string
  validatorAddress: string
  transactionHash: string
  blockNumber: number
  validationScore: number
  status: "active" | "expired" | "revoked"
  validatedComponents: string[]
  qrCodeData: string
}

export interface TrufaCertificateViewerProps extends TrufaCertificateData {
  mode?: "full" | "compact"
  theme?: "light" | "dark"
  className?: string
}

export function TrufaCertificateViewer({
  projectId,
  certificateId,
  projectName,
  operatorName,
  validationDate,
  expiryDate,
  validatorAddress,
  transactionHash,
  blockNumber,
  validationScore,
  status,
  validatedComponents,
  qrCodeData,
  mode = "full",
  theme = "light",
  className,
}: TrufaCertificateViewerProps) {
  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    console.log("Downloading PDF certificate...")
    alert("PDF download functionality would be implemented here")
  }

  const handleVerifyOnBlockchain = () => {
    // Open blockchain explorer
    window.open(`https://etherscan.io/tx/${transactionHash}`, "_blank")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "expired":
        return "bg-yellow-500"
      case "revoked":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  if (mode === "compact") {
    return (
      <Card className={cn("max-w-md mx-auto", theme === "dark" && "bg-gray-900 border-gray-700", className)}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">TRUFA CERTIFIED</h3>
                <p className="text-sm text-gray-600">DOB Protocol Validated</p>
              </div>
            </div>
            <div className={cn("w-3 h-3 rounded-full mx-auto", getStatusColor(status))} />
          </div>

          {/* Project Info */}
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Project</p>
              <p className="text-sm">{projectName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Operator</p>
              <p className="text-sm">{operatorName}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Score</p>
                <p className={cn("text-sm font-bold", getScoreColor(validationScore))}>{validationScore}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Valid Until</p>
                <p className="text-sm">{new Date(expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <QrCode className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={handleDownloadPDF} className="w-full" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleVerifyOnBlockchain} variant="outline" className="w-full" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Verify on Blockchain
            </Button>
          </div>

          {/* Certificate ID */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">Certificate ID</p>
            <p className="text-xs font-mono">{certificateId}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("max-w-4xl mx-auto", theme === "dark" && "bg-gray-900 border-gray-700", className)}>
      <CardContent className="p-8">
        {/* Certificate Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TRUFA CERTIFICATE</h1>
              <p className="text-gray-600">DOB Protocol Infrastructure Validation</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant={status === "active" ? "default" : "secondary"} className="px-3 py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              {status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Score: <span className={cn("ml-1 font-bold", getScoreColor(validationScore))}>{validationScore}%</span>
            </Badge>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Certificate Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Project Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Project Information
              </h3>
              <div className="space-y-3 pl-7">
                <div>
                  <p className="text-sm font-medium text-gray-700">Project Name</p>
                  <p className="font-medium">{projectName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Project ID</p>
                  <p className="font-mono text-sm">{projectId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Infrastructure Operator</p>
                  <p className="font-medium">{operatorName}</p>
                </div>
              </div>
            </div>

            {/* Validation Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Validation Details
              </h3>
              <div className="space-y-3 pl-7">
                <div>
                  <p className="text-sm font-medium text-gray-700">Validation Date</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(validationDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Validation Score</p>
                  <p className={cn("text-xl font-bold", getScoreColor(validationScore))}>{validationScore}%</p>
                </div>
              </div>
            </div>

            {/* Validated Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Validated Components</h3>
              <div className="grid grid-cols-1 gap-2">
                {validatedComponents.map((component, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{component}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Blockchain Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Blockchain Verification
              </h3>
              <div className="space-y-3 pl-7">
                <div>
                  <p className="text-sm font-medium text-gray-700">Transaction Hash</p>
                  <p className="font-mono text-xs break-all">{transactionHash}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Block Number</p>
                  <p className="font-mono">{blockNumber.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Validator Address</p>
                  <p className="font-mono text-xs break-all">{validatorAddress}</p>
                </div>
                <Button onClick={handleVerifyOnBlockchain} variant="outline" size="sm" className="mt-2">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verify on Blockchain
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Verification QR Code</h3>
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-500" />
                </div>
              </div>
              <p className="text-xs text-center text-gray-600">Scan to verify certificate authenticity</p>
            </div>

            {/* Certificate ID */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Certificate ID</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-mono text-center text-lg font-bold">{certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            This certificate is cryptographically secured and immutable on the blockchain
          </p>
          <p className="text-xs text-gray-500">© 2025 DOB Protocol. All rights reserved.</p>
        </div>
      </CardContent>
    </Card>
  )
}
