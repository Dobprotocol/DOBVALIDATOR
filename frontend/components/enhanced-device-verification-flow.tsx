"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DeviceBasicInfo } from "@/components/steps/device-basic-info"
import { DeviceTechnicalInfo } from "@/components/steps/device-technical-info"
import { DeviceFinancialInfo } from "@/components/steps/device-financial-info"
import { DeviceDocumentation } from "@/components/steps/device-documentation"
import { DeviceReview } from "@/components/steps/device-review"
import { DeviceSuccess } from "@/components/steps/device-success"
import { StellarWallet } from "@/components/stellar-wallet"
import { useRouter, useSearchParams } from "next/navigation"
import { useDraft } from "@/hooks/use-draft"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export function EnhancedDeviceVerificationFlow() {
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
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { saveDraft, loadDraft, loading: draftLoading } = useDraft()
  const { toast } = useToast()

  const totalSteps = 6

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

  // Always start at step 1 when wallet connects
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

  const updateDeviceData = useCallback((data: Partial<DeviceData>) => {
    setDeviceData((prev) => ({ ...prev, ...data }))
  }, [])

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      
      // Smooth scroll to the previous step
      setTimeout(() => {
        const targetStep = stepRefs.current[newStep - 1]
        if (targetStep && containerRef.current) {
          const container = containerRef.current
          const targetRect = targetStep.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          
          const scrollTop = container.scrollTop + (targetRect.top - containerRect.top)
          
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }

  const goToStep = (step: number) => {
    // Don't allow navigation to step 6 unless submission is successful
    if (step === 6 && !submissionSuccess) {
      return
    }
    
    if (step >= 1 && step <= totalSteps && step !== currentStep) {
      setCurrentStep(step)
      
      // Smooth scroll to the target step
      setTimeout(() => {
        const targetStep = stepRefs.current[step - 1]
        if (targetStep && containerRef.current) {
          const container = containerRef.current
          const targetRect = targetStep.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          
          const scrollTop = container.scrollTop + (targetRect.top - containerRect.top)
          
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }

  const handleSaveDraft = async () => {
    try {
      const savedDraft = await saveDraft(deviceData, currentDraftId || undefined)
      if (!currentDraftId && savedDraft) {
        setCurrentDraftId(savedDraft.id)
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  }

  const downloadFormQuestions = () => {
    const questions = [
      "=== DOB VALIDATOR - DEVICE VERIFICATION FORM ===\n",
      "STEP 1: BASIC INFORMATION",
      "1. Device Name: " + (deviceData.deviceName || "Not provided"),
      "2. Device Type: " + (deviceData.deviceType || "Not provided"),
      "3. Serial Number: " + (deviceData.serialNumber || "Not provided"),
      "4. Manufacturer: " + (deviceData.manufacturer || "Not provided"),
      "\nSTEP 2: TECHNICAL INFORMATION",
      "5. Model: " + (deviceData.model || "Not provided"),
      "6. Year of Manufacture: " + (deviceData.yearOfManufacture || "Not provided"),
      "7. Condition: " + (deviceData.condition || "Not provided"),
      "8. Specifications: " + (deviceData.specifications || "Not provided"),
      "\nSTEP 3: FINANCIAL INFORMATION",
      "9. Purchase Price: " + (deviceData.purchasePrice || "Not provided"),
      "10. Current Value: " + (deviceData.currentValue || "Not provided"),
      "11. Expected Revenue: " + (deviceData.expectedRevenue || "Not provided"),
      "12. Operational Costs: " + (deviceData.operationalCosts || "Not provided"),
      "\nSTEP 4: DOCUMENTATION",
      "13. Technical Certification: " + (deviceData.technicalCertification ? "Uploaded" : "Not uploaded"),
      "14. Purchase Proof: " + (deviceData.purchaseProof ? "Uploaded" : "Not uploaded"),
      "15. Maintenance Records: " + (deviceData.maintenanceRecords ? "Uploaded" : "Not uploaded"),
      "16. Device Images: " + (deviceData.deviceImages.length > 0 ? `${deviceData.deviceImages.length} images uploaded` : "No images uploaded"),
      "\n=== END OF FORM ==="
    ].join('\n')

    const blob = new Blob([questions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dob-validator-form-questions.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Form Downloaded",
      description: "Your form questions have been downloaded as a text file.",
    })
  }

  const handleSubmissionSuccess = () => {
    setSubmissionSuccess(true)
  }

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

  // Step Indicator with clickable steps
  const StepIndicator = () => (
    <div className="flex justify-center items-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        // Don't show step 6 until submission is successful
        if (index === 5 && !submissionSuccess) {
          return null
        }
        
        return (
          <div key={index} className="flex items-center">
            <button
              onClick={() => goToStep(index + 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 hover:scale-110 ${
                index + 1 === currentStep
                  ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
                  : index + 1 < currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary hover:bg-primary/30"
                    : "bg-muted text-muted-foreground border-2 border-muted hover:bg-muted/80 hover:border-primary/50"
              }`}
            >
              {index + 1}
            </button>
            {index < totalSteps - 1 && (
              <div className={`h-1 w-12 transition-all duration-500 ease-in-out ${
                index + 1 < currentStep 
                  ? "bg-primary" 
                  : index + 1 === currentStep 
                    ? "bg-gradient-to-r from-primary to-muted" 
                    : "bg-muted"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )

  // Multi-step View Component with smooth scroll
  const MultiStepView = () => (
    <div 
      ref={containerRef}
      className="relative h-[70vh] overflow-y-auto overflow-x-hidden"
    >
      <div className="relative min-h-full">
        {/* Step 1 */}
        <div
          ref={(el) => { stepRefs.current[0] = el }}
          className={`min-h-[70vh] flex items-center justify-center ${
            currentStep === 1 
              ? 'opacity-100' 
              : 'opacity-50'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceBasicInfo deviceData={deviceData} updateDeviceData={updateDeviceData} onNext={nextStep} />
          </div>
        </div>

        {/* Step 2 */}
        <div
          ref={(el) => { stepRefs.current[1] = el }}
          className={`min-h-[70vh] flex items-center justify-center ${
            currentStep === 2 
              ? 'opacity-100' 
              : 'opacity-50'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceTechnicalInfo
              deviceData={deviceData}
              updateDeviceData={updateDeviceData}
              onNext={nextStep}
              onBack={prevStep}
            />
          </div>
        </div>

        {/* Step 3 */}
        <div
          ref={(el) => { stepRefs.current[2] = el }}
          className={`min-h-[70vh] flex items-center justify-center ${
            currentStep === 3 
              ? 'opacity-100' 
              : 'opacity-50'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceFinancialInfo
              deviceData={deviceData}
              updateDeviceData={updateDeviceData}
              onNext={nextStep}
              onBack={prevStep}
            />
          </div>
        </div>

        {/* Step 4 */}
        <div
          ref={(el) => { stepRefs.current[3] = el }}
          className={`min-h-[70vh] flex items-center justify-center ${
            currentStep === 4 
              ? 'opacity-100' 
              : 'opacity-50'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceDocumentation
              deviceData={deviceData}
              updateDeviceData={updateDeviceData}
              onNext={nextStep}
              onBack={prevStep}
            />
          </div>
        </div>

        {/* Step 5 */}
        <div
          ref={(el) => { stepRefs.current[4] = el }}
          className={`min-h-[70vh] flex items-center justify-center ${
            currentStep === 5 
              ? 'opacity-100' 
              : 'opacity-50'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceReview
              deviceData={deviceData}
              onNext={nextStep}
              onBack={prevStep}
              onSubmissionSuccess={handleSubmissionSuccess}
            />
          </div>
        </div>

        {/* Step 6 - Only show if submission is successful */}
        {submissionSuccess && (
          <div
            ref={(el) => { stepRefs.current[5] = el }}
            className={`min-h-[70vh] flex items-center justify-center ${
              currentStep === 6 
                ? 'opacity-100' 
                : 'opacity-50'
            }`}
          >
            <div className="w-full max-w-2xl p-8">
              <DeviceSuccess showModal={submissionSuccess} />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Step-by-step view - fixed height with scroll */}
      <div className="h-screen py-8 px-4 overflow-hidden">
        <div className="container mx-auto h-full flex flex-col">
          {/* Header with Download */}
          <div className="flex justify-end items-center mb-8 gap-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Button
                onClick={downloadFormQuestions}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Form
              </Button>

              {currentStep < 5 && (
                <Button
                  onClick={handleSaveDraft}
                  disabled={draftLoading}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {draftLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {currentDraftId ? 'Update Draft' : 'Save Draft'}
                </Button>
              )}
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Form Content - Fixed height with scroll */}
          <div className="flex-1 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full">
              <MultiStepView />
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 