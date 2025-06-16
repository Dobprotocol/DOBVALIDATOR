"use client"

import { useState, useEffect } from "react"
import { DeviceBasicInfo } from "@/components/steps/device-basic-info"
import { DeviceTechnicalInfo } from "@/components/steps/device-technical-info"
import { DeviceFinancialInfo } from "@/components/steps/device-financial-info"
import { DeviceDocumentation } from "@/components/steps/device-documentation"
import { DeviceReview } from "@/components/steps/device-review"
import { DeviceSuccess } from "@/components/steps/device-success"
import { StepIndicator } from "@/components/ui/step-indicator"
import { StellarWallet } from "@/components/stellar-wallet"
import { useRouter } from "next/navigation"

export type DeviceData = {
  // Basic info
  deviceName: string
  deviceType: string
  serialNumber: string
  manufacturer: string

  // Technical info
  model: string
  yearOfManufacture: string
  condition: string
  specifications: string

  // Financial info
  purchasePrice: string
  currentValue: string
  expectedRevenue: string
  operationalCosts: string

  // Documentation
  technicalCertification: File | null
  purchaseProof: File | null
  maintenanceRecords: File | null
  deviceImages: File[]
}

export function DeviceVerificationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [deviceData, setDeviceData] = useState<DeviceData>({
    deviceName: '',
    deviceType: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    yearOfManufacture: '',
    condition: '',
    specifications: '',
    purchasePrice: '',
    currentValue: '',
    expectedRevenue: '',
    operationalCosts: '',
    technicalCertification: null,
    purchaseProof: null,
    maintenanceRecords: null,
    deviceImages: [],
  })
  const [walletConnected, setWalletConnected] = useState(false)
  const router = useRouter()

  // Always start at step 1 and show welcome modal when wallet connects
  useEffect(() => {
    const wallet = typeof window !== 'undefined' ? localStorage.getItem('stellarWallet') : null
    setWalletConnected(!!wallet)
    if (wallet) {
      setCurrentStep(1)
    }
    // Listen for wallet connect/disconnect events
    const onWalletChange = () => {
      const w = localStorage.getItem('stellarWallet')
      setWalletConnected(!!w)
      if (w) {
        setCurrentStep(1)
      }
    }
    window.addEventListener('walletStateChange', onWalletChange)
    return () => window.removeEventListener('walletStateChange', onWalletChange)
  }, [])

  if (!walletConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <StellarWallet />
      </div>
    )
  }

  const totalSteps = 6

  const updateDeviceData = (data: Partial<DeviceData>) => {
    setDeviceData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mt-8 mb-12">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="max-w-3xl mx-auto">
        {currentStep === 1 && (
          <DeviceBasicInfo deviceData={deviceData} updateDeviceData={updateDeviceData} onNext={nextStep} />
        )}

        {currentStep === 2 && (
          <DeviceTechnicalInfo
            deviceData={deviceData}
            updateDeviceData={updateDeviceData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && (
          <DeviceFinancialInfo
            deviceData={deviceData}
            updateDeviceData={updateDeviceData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 4 && (
          <DeviceDocumentation
            deviceData={deviceData}
            updateDeviceData={updateDeviceData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 5 && <DeviceReview deviceData={deviceData} onNext={nextStep} onBack={prevStep} />}

        {currentStep === 6 && <DeviceSuccess />}
      </div>
    </div>
  )
}
