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
import { useRouter, useSearchParams } from "next/navigation"
import { useDraft } from "@/hooks/use-draft"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export type DeviceData = {
  // Basic info
  deviceName: string
  deviceType: string
  customDeviceType: string
  location: string

  // Technical info
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
    customDeviceType: '',
    location: '',
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
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { saveDraft, loadDraft, loading: draftLoading } = useDraft()
  const { toast } = useToast()

  // Check for edit mode and load draft if needed
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      setIsLoadingDraft(true)
      loadDraft(editId).then((loadedData) => {
        if (loadedData) {
          setDeviceData(loadedData)
          setCurrentDraftId(editId)
          toast({
            title: "Draft Loaded",
            description: "Your draft has been loaded. Please re-upload any files.",
          })
        }
        setIsLoadingDraft(false)
      }).catch(() => {
        setIsLoadingDraft(false)
      })
    }
  }, [searchParams, loadDraft, toast])

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

  if (isLoadingDraft) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your draft...</p>
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

  const handleSaveDraft = async () => {
    try {
      // Filter out customDeviceType to avoid backend schema issues
      const { customDeviceType, ...draftDataWithoutCustomType } = deviceData
      const savedDraft = await saveDraft(draftDataWithoutCustomType, currentDraftId || undefined)
      if (!currentDraftId && savedDraft) {
        setCurrentDraftId(savedDraft.id)
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="mt-8 mb-12">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Draft Save Button */}
        {currentStep < 5 && (
          <div className="max-w-3xl mx-auto mb-6 flex justify-end">
            <Button
              onClick={handleSaveDraft}
              disabled={draftLoading}
              variant="outline"
              className="gap-2 bg-background/90 backdrop-blur-sm"
            >
              {draftLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {currentDraftId ? 'Update Draft' : 'Save Draft'}
            </Button>
          </div>
        )}

        <div className="max-w-3xl mx-auto pb-8">
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

          {currentStep === 5 && (
            <DeviceReview
              deviceData={deviceData}
              onNext={nextStep}
              onBack={prevStep}
              onSubmissionSuccess={() => {
                // Handle submission success
                toast({
                  title: "Success",
                  description: "Your device has been submitted successfully!",
                })
              }}
            />
          )}

          {currentStep === 6 && <DeviceSuccess />}
        </div>
      </div>
    </div>
  )
}
