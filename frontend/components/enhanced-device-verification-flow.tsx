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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export type DeviceData = {
  // Basic info
  deviceName: string
  deviceType: string
  customDeviceType: string
  location: string

  // Technical info
  serialNumber: string
  manufacturer: string
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

  // Draft ID for state sync
  draftId?: string | null
}

export function EnhancedDeviceVerificationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [deviceData, setDeviceData] = useState<DeviceData>({
    deviceName: '',
    deviceType: '',
    customDeviceType: '',
    location: '',
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
    draftId: null,
  })
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [failedSaveAttempts, setFailedSaveAttempts] = useState(0)
  const [hasShownFirstSaveToast, setHasShownFirstSaveToast] = useState(false)
  const [draftLoadKey, setDraftLoadKey] = useState(0)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { saveDraft, loadDraft, loading: draftLoading } = useDraft()
  const { toast } = useToast()

  const totalSteps = 6

  // Check for edit mode and load draft if needed
  useEffect(() => {
    const editId = searchParams.get('edit')
    console.log('🔍 Checking for edit mode, editId:', editId)
    if (editId) {
      console.log('🔍 Edit mode detected, loading draft:', editId)
      setIsLoadingDraft(true)
      loadDraft(editId).then((loadedData) => {
        console.log('🔍 Loaded draft data:', loadedData)
        if (loadedData) {
          // Merge loaded data with default state to ensure all fields are present
          const defaultState = {
            deviceName: '',
            deviceType: '',
            customDeviceType: '',
            location: '',
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
            draftId: null,
          }
          const mergedData = { ...defaultState, ...loadedData, draftId: editId }
          console.log('🔍 Setting device data to:', mergedData)
          setDeviceData(mergedData)
          setCurrentDraftId(editId)
          setDraftLoadKey(prev => prev + 1) // Force re-render of step components
          toast({
            title: "Draft Loaded",
            description: "Your draft has been loaded. Please re-upload any files.",
          })
        }
        setIsLoadingDraft(false)
      }).catch((error) => {
        console.error('🔍 Error loading draft:', error)
        setIsLoadingDraft(false)
      })
    } else {
      console.log('🔍 No edit mode - creating new project with clean slate')
      // Clear any existing draft ID to ensure new draft creation
      setCurrentDraftId(null)
      // Reset form to clean state
      setDeviceData({
        deviceName: '',
        deviceType: '',
        customDeviceType: '',
        location: '',
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
        draftId: null,
      })
      setHasShownFirstSaveToast(false)
      setFailedSaveAttempts(0)
    }
  }, [searchParams, loadDraft, toast])

  const updateDeviceData = useCallback((data: Partial<DeviceData>) => {
    setDeviceData((prev) => ({ ...prev, ...data }))
  }, [])

  const handleSaveDraft = async (currentStepData?: Partial<DeviceData>) => {
    try {
      console.log('🔍 Saving draft with ID:', currentDraftId)
      console.log('🔍 Current step data:', currentStepData)
      console.log('🔍 Current device data:', deviceData)
      
      // Use current step data if provided, otherwise use deviceData
      const dataToSave = currentStepData ? { ...deviceData, ...currentStepData } : deviceData
      
      console.log('🔍 Data to save:', dataToSave)
      console.log('🔍 Device data fields:', {
        deviceName: dataToSave.deviceName,
        deviceType: dataToSave.deviceType,
        location: dataToSave.location,
        serialNumber: dataToSave.serialNumber,
        manufacturer: dataToSave.manufacturer,
        model: dataToSave.model,
        yearOfManufacture: dataToSave.yearOfManufacture,
        condition: dataToSave.condition,
        specifications: dataToSave.specifications,
        purchasePrice: dataToSave.purchasePrice,
        currentValue: dataToSave.currentValue,
        expectedRevenue: dataToSave.expectedRevenue,
        operationalCosts: dataToSave.operationalCosts,
      })
      
      // Filter out customDeviceType to avoid backend schema issues
      const { customDeviceType, ...draftDataWithoutCustomType } = dataToSave
      console.log('🔍 Draft data without customDeviceType:', draftDataWithoutCustomType)
      
      const savedDraft = await saveDraft(draftDataWithoutCustomType, currentDraftId || undefined)
      console.log('🔍 Save response:', savedDraft)
      
      if (!currentDraftId && savedDraft && savedDraft.id) {
        console.log('🔍 Setting new draft ID:', savedDraft.id)
        setCurrentDraftId(savedDraft.id)
        // Update the deviceData with the new draft ID
        setDeviceData(prev => ({ ...prev, draftId: savedDraft.id }))
        // Store the draft ID in localStorage for persistence
        localStorage.setItem('currentDraftId', savedDraft.id)
      }
      
      // Reset failed attempts on successful save
      setFailedSaveAttempts(0)
      
      // Only show toast on first save or when explicitly requested
      if (!hasShownFirstSaveToast) {
        setHasShownFirstSaveToast(true)
        toast({
          title: "Draft Saved",
          description: "Your progress has been automatically saved.",
        })
      }
    } catch (error) {
      console.error('🔍 Error in handleSaveDraft:', error)
      // Increment failed attempts
      setFailedSaveAttempts(prev => prev + 1)
      // Show error toast
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(() => {
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    // Set new timeout to save after 2 seconds of no typing
    const timeout = setTimeout(() => {
      const hasData = deviceData.deviceName || deviceData.deviceType || deviceData.location
      if (hasData && walletConnected && failedSaveAttempts < 3) {
        handleSaveDraft()
      }
    }, 2000)
    
    setAutoSaveTimeout(timeout)
  }, [deviceData, walletConnected, failedSaveAttempts, handleSaveDraft])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [autoSaveTimeout])

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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Save current step data before moving to next step
      handleSaveDraft()
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      // Save current step data before moving to previous step
      handleSaveDraft()
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    // Don't allow navigation to step 6 unless submission is successful
    if (step === 6 && !submissionSuccess) {
      return
    }
    
    if (step >= 1 && step <= totalSteps && step !== currentStep) {
      setCurrentStep(step)
    }
  }

  const downloadFormQuestions = () => {
    const questions = [
      "=== DOB VALIDATOR - DEVICE VERIFICATION FORM ===\n",
      "STEP 1: BASIC INFORMATION",
      "1. Device Name: " + (deviceData.deviceName || "Not provided"),
      "2. Device Type: " + (deviceData.deviceType || "Not provided"),
      "3. Location: " + (deviceData.location || "Not provided"),
      "\nSTEP 2: TECHNICAL INFORMATION",
      "4. Year of Manufacture: " + (deviceData.yearOfManufacture || "Not provided"),
      "5. Condition: " + (deviceData.condition || "Not provided"),
      "6. Specifications: " + (deviceData.specifications || "Not provided"),
      "\nSTEP 3: FINANCIAL INFORMATION",
      "7. Purchase Price: " + (deviceData.purchasePrice || "Not provided"),
      "8. Current Value: " + (deviceData.currentValue || "Not provided"),
      "9. Expected Revenue: " + (deviceData.expectedRevenue || "Not provided"),
      "10. Operational Costs: " + (deviceData.operationalCosts || "Not provided"),
      "\nSTEP 4: DOCUMENTATION",
      "11. Technical Certification: " + (deviceData.technicalCertification ? "Uploaded" : "Not uploaded"),
      "12. Purchase Proof: " + (deviceData.purchaseProof ? "Uploaded" : "Not uploaded"),
      "13. Maintenance Records: " + (deviceData.maintenanceRecords ? "Uploaded" : "Not uploaded"),
      "14. Device Images: " + (deviceData.deviceImages.length > 0 ? `${deviceData.deviceImages.length} images uploaded` : "No images uploaded"),
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
    // Redirect to dashboard after a short delay to show the new submission
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000) // 2 second delay to show success message
  }

  const handleNewProject = () => {
    // Clear all localStorage backups
    localStorage.removeItem('dobFormStep1Backup')
    localStorage.removeItem('dobFormStep2Backup')
    localStorage.removeItem('dobFormStep3Backup')
    localStorage.removeItem('dobFormStep4Backup')
    localStorage.removeItem('dobFormBackup')
    
    // Reset form state
    setDeviceData({
      deviceName: '',
      deviceType: '',
      customDeviceType: '',
      location: '',
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
      draftId: null,
    })
    
    // Clear current draft ID to force creation of new draft
    setCurrentDraftId(null)
    setHasShownFirstSaveToast(false)
    setFailedSaveAttempts(0)
    
    // Reset to step 1
    setCurrentStep(1)
    setSubmissionSuccess(false)
    
    // Navigate to form
    router.push('/form')
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

  // Multi-step View Component (show all cards for scrolling)
  const MultiStepView = () => (
    <div className="space-y-8">
      {/* Step 1: Basic Information */}
      <div className={`transition-opacity duration-300 ${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
        <DeviceBasicInfo 
          key={`basic-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData} 
          updateDeviceData={updateDeviceData} 
          onNext={nextStep}
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Step 2: Technical Information */}
      <div className={`transition-opacity duration-300 ${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
        <DeviceTechnicalInfo
          key={`technical-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData}
          updateDeviceData={updateDeviceData}
          onNext={nextStep}
          onBack={prevStep}
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Step 3: Financial Information */}
      <div className={`transition-opacity duration-300 ${currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
        <DeviceFinancialInfo
          key={`financial-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData}
          updateDeviceData={updateDeviceData}
          onNext={nextStep}
          onBack={prevStep}
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Step 4: Documentation */}
      <div className={`transition-opacity duration-300 ${currentStep >= 4 ? 'opacity-100' : 'opacity-50'}`}>
        <DeviceDocumentation
          key={`documentation-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData}
          updateDeviceData={updateDeviceData}
          onNext={nextStep}
          onBack={prevStep}
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Step 5: Review */}
      <div className={`transition-opacity duration-300 ${currentStep >= 5 ? 'opacity-100' : 'opacity-50'}`}>
        <DeviceReview
          key={`review-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData}
          onNext={nextStep}
          onBack={prevStep}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      </div>

      {/* Step 6: Success */}
      {submissionSuccess && (
        <div className="w-full max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
          <DeviceSuccess />
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Multi-step view with natural scrolling */}
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          {/* Header with Download */}
          <div className="flex justify-end items-center mb-8 gap-4">
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
                  onClick={() => handleSaveDraft()}
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

          {/* Form Content - Natural scrolling */}
          <div className="max-w-4xl mx-auto">
            <MultiStepView />
          </div>
        </div>
      </div>
    </>
  )
} 