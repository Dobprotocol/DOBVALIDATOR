"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Share2, Star, Award, TrendingUp } from "lucide-react"

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  certificateData: {
    deviceName: string
    deviceType: string
    manufacturer: string
    validatedAt: string
    validator: string
    trufaScore: number
    certificateId: string
    blockchainTx: string
    validationCriteria: {
      technical: boolean
      financial: boolean
      operational: boolean
      regulatory: boolean
    }
    investmentGrade: string
    riskLevel: string
  }
}

export function CertificateModal({ isOpen, onClose, certificateData }: CertificateModalProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Award className="h-5 w-5" />
            TRUFA Validation Certificate
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{certificateData.deviceName}</h2>
                <p className="text-muted-foreground">{certificateData.deviceType} • {certificateData.manufacturer}</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(certificateData.trufaScore)}`}>
                  {certificateData.trufaScore}
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${getScoreBadge(certificateData.trufaScore)}`}>
                  TRUFA Score
                </div>
              </div>
            </div>
          </div>

          {/* Validation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Validation Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate ID:</span>
                  <span className="font-mono text-sm">{certificateData.certificateId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validated:</span>
                  <span>{certificateData.validatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validator:</span>
                  <span>{certificateData.validator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Grade:</span>
                  <Badge variant="outline">{certificateData.investmentGrade}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Level:</span>
                  <Badge variant="outline">{certificateData.riskLevel}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Validation Criteria</h3>
              <div className="space-y-3">
                {Object.entries(certificateData.validationCriteria).map(([criterion, passed]) => (
                  <div key={criterion} className="flex items-center justify-between">
                    <span className="capitalize">{criterion}:</span>
                    <div className="flex items-center gap-2">
                      {passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-red-300" />
                      )}
                      <span className={passed ? "text-green-600" : "text-red-600"}>
                        {passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blockchain Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-3">Blockchain Verification</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/images/stellar_logo_white_small.svg" alt="Stellar Logo" className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                <span className="font-mono text-sm bg-background px-2 py-1 rounded">
                  {certificateData.blockchainTx.slice(0, 20)}...{certificateData.blockchainTx.slice(-20)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Network:</span>
                <span className="text-sm font-medium">
                  {process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' ? 'Mainnet' : 'Testnet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Explorer:</span>
                <a 
                  href={`${process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' 
                    ? 'https://stellar.expert/explorer/public' 
                    : 'https://stellar.expert/explorer/testnet'}/tx/${certificateData.blockchainTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  View Transaction
                </a>
              </div>
            </div>
          </div>

          {/* Investment Potential */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-foreground">Investment Potential</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This device has been validated and is ready for tokenization. The TRUFA score of {certificateData.trufaScore} 
              indicates strong investment potential with {certificateData.riskLevel.toLowerCase()} risk profile.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Certificate
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 