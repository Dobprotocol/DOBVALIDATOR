"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, FileText, Calendar, User } from "lucide-react"

interface RejectionReviewModalProps {
  isOpen: boolean
  onClose: () => void
  deviceData: {
    deviceName: string
    deviceType: string
    manufacturer: string
    submittedAt: string
    rejectedAt: string
    rejectionReason: string
    reviewer: string
    reviewerNotes: string
  }
}

export function RejectionReviewModal({ isOpen, onClose, deviceData }: RejectionReviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Device Rejection Review
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Device Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-3">Device Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Device Name:</span>
                <p className="font-medium">{deviceData.deviceName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Device Type:</span>
                <p className="font-medium">{deviceData.deviceType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Manufacturer:</span>
                <p className="font-medium">{deviceData.manufacturer}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <p className="font-medium">{deviceData.submittedAt}</p>
              </div>
            </div>
          </div>

          {/* Rejection Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Rejected</Badge>
              <span className="text-sm text-muted-foreground">
                Rejected on {deviceData.rejectedAt}
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Rejection Reason</h4>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive font-medium">{deviceData.rejectionReason}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Reviewer Notes</h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{deviceData.reviewerNotes}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Reviewed by: {deviceData.reviewer}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="secondary">
              <FileText className="h-4 w-4 mr-2" />
              Download Review Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 