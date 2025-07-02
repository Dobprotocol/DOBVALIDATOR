"use client"
import { EnhancedDeviceVerificationFlow } from "@/components/enhanced-device-verification-flow"

export const dynamic = 'force-dynamic'

export default function FormPage() {
  return (
    <div className="w-full mt-20 min-h-screen pb-20 form-page">
      <EnhancedDeviceVerificationFlow />
    </div>
  )
} 