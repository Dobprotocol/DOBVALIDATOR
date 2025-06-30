"use client"
import { EnhancedDeviceVerificationFlow } from "@/components/enhanced-device-verification-flow"
import { Suspense } from 'react'

export default function FormPage() {
  return (
    <div className="w-full mt-20 min-h-screen pb-20 form-page">
      <Suspense fallback={<div>Loading...</div>}>
        <EnhancedDeviceVerificationFlow />
      </Suspense>
    </div>
  )
} 