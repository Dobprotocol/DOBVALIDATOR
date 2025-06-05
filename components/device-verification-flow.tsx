"use client"

import { useState } from "react"
import { DeviceBasicInfo } from "@/components/steps/device-basic-info"
import { DeviceTechnicalInfo } from "@/components/steps/device-technical-info"
import { DeviceFinancialInfo } from "@/components/steps/device-financial-info"
import { DeviceDocumentation } from "@/components/steps/device-documentation"
import { DeviceReview } from "@/components/steps/device-review"
import { DeviceSuccess } from "@/components/steps/device-success"
import { Header } from "@/components/ui/header"
import { StepIndicator } from "@/components/ui/step-indicator"

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
  additionalDocuments: File[]
}

export function DeviceVerificationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [deviceData, setDeviceData] = useState<DeviceData>({
    deviceName: "",
    deviceType: "",
    serialNumber: "",
    manufacturer: "",
    model: "",
    yearOfManufacture: "",
    condition: "",
    specifications: "",
    purchasePrice: "",
    currentValue: "",
    expectedRevenue: "",
    operationalCosts: "",
    technicalCertification: null,
    purchaseProof: null,
    maintenanceRecords: null,
    additionalDocuments: [],
  })

  const updateDeviceData = (data: Partial<DeviceData>) => {
    setDeviceData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 6))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const totalSteps = 5

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />

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
