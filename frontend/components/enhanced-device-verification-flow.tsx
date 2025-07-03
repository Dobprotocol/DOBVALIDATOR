"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { DeviceBasicInfo } from "@/components/steps/device-basic-info"
import { DeviceTechnicalInfo } from "@/components/steps/device-technical-info"
import { DeviceFinancialInfo } from "@/components/steps/device-financial-info"
import { DeviceDocumentation } from "@/components/steps/device-documentation"
import { StellarWallet } from "@/components/stellar-wallet"
import { useRouter, useSearchParams } from "next/navigation"
import { useDraft } from "@/hooks/use-draft"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Download, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
// import { animateScroll as scroll } from 'react-scroll'

export type FileInfo = {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
}

export type DeviceData = {
  // Basic info
  deviceName: string
  deviceType: string
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

  // Documentation - can be File objects (during upload) or FileInfo objects (after upload)
  technicalCertification: File | FileInfo | null
  purchaseProof: File | FileInfo | null
  maintenanceRecords: File | FileInfo | null
  deviceImages: (File | FileInfo)[]

  // Draft ID for state sync
  draftId?: string | null
}

export function EnhancedDeviceVerificationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [deviceData, setDeviceData] = useState<DeviceData>({
    deviceName: '',
    deviceType: '',
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
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const isInitialLoad = useRef(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { saveDraft, loadDraft, loading: draftLoading } = useDraft()
  const { toast } = useToast()

  const totalSteps = 4

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
          
          // Save to localStorage for persistence across Fast Refresh
          localStorage.setItem('dobFormBackup', JSON.stringify(mergedData))
          
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
      console.log('🔍 No edit mode - checking for localStorage backup')
      
      // Check for localStorage backup first
      const savedData = localStorage.getItem('dobFormBackup')
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          console.log('🔍 Found localStorage backup:', parsedData)
          // Use setTimeout to avoid blocking the render cycle
          setTimeout(() => {
            setDeviceData(parsedData)
            setCurrentDraftId(parsedData.draftId || null)
            setHasShownFirstSaveToast(true) // Don't show first save toast for restored data
          }, 0)
        } catch (error) {
          console.error('🔍 Error parsing localStorage data:', error)
          // Fall back to clean state
          resetFormToCleanState()
        }
              } else {
          console.log('🔍 No localStorage backup - creating new project with clean slate')
          resetFormToCleanState()
        }
      }
      
      // Mark initial load as complete
      isInitialLoad.current = false
    }, [searchParams, loadDraft, toast])

  // Helper function to reset form to clean state
  const resetFormToCleanState = () => {
    // Clear any existing draft ID to ensure new draft creation
    setCurrentDraftId(null)
    // Reset form to clean state
    setDeviceData({
      deviceName: '',
      deviceType: '',
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

  const updateDeviceData = useCallback((data: Partial<DeviceData>) => {
    setDeviceData((prev) => {
      const updatedData = { ...prev, ...data }
      
      // Only save to localStorage if not during initial load
      if (!isInitialLoad.current) {
        // Save to localStorage for persistence across Fast Refresh
        // Only save non-file fields to localStorage
        const localStorageData = {
          ...updatedData,
          technicalCertification: null, // Don't save files to localStorage
          purchaseProof: null,
          maintenanceRecords: null,
          deviceImages: []
        }
        
        // Use setTimeout to avoid blocking the render cycle
        setTimeout(() => {
          localStorage.setItem('dobFormBackup', JSON.stringify(localStorageData))
        }, 0)
      }
      
      return updatedData
    })
  }, [])

  const handleSaveDraft = async (currentStepData?: Partial<DeviceData>) => {
    try {
      console.log('🔍 Saving draft with ID:', currentDraftId)
      console.log('🔍 Current step data:', currentStepData)
      console.log('🔍 Current device data:', deviceData)
      
      // Collect all current form data from localStorage
      const step1Data = localStorage.getItem('dobFormStep1Backup')
      const step2Data = localStorage.getItem('dobFormStep2Backup')
      const step3Data = localStorage.getItem('dobFormStep3Backup')
      
      let currentFormData = { ...deviceData }
      
      // Parse and merge step data
      if (step1Data) {
        try {
          const parsed = JSON.parse(step1Data)
          currentFormData = { ...currentFormData, ...parsed }
        } catch (error) {
          console.error('Error parsing step 1 data:', error)
        }
      }
      
      if (step2Data) {
        try {
          const parsed = JSON.parse(step2Data)
          currentFormData = { ...currentFormData, ...parsed }
        } catch (error) {
          console.error('Error parsing step 2 data:', error)
        }
      }
      
      if (step3Data) {
        try {
          const parsed = JSON.parse(step3Data)
          currentFormData = { ...currentFormData, ...parsed }
        } catch (error) {
          console.error('Error parsing step 3 data:', error)
        }
      }
      
      // Use current step data if provided, otherwise use collected form data
      const dataToSave = currentStepData ? { ...currentFormData, ...currentStepData } : currentFormData
      
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
      
      // Note: customDeviceType removed since "OTHER" option was removed from device types
      const draftDataForSave = dataToSave
      
      const savedDraft = await saveDraft(draftDataForSave, currentDraftId || undefined)
      console.log('🔍 Save response:', savedDraft)
      
      if (!currentDraftId && savedDraft && savedDraft.id) {
        console.log('🔍 Setting new draft ID:', savedDraft.id)
        setCurrentDraftId(savedDraft.id)
        // Update the deviceData with the new draft ID and current form data
        setDeviceData(prev => ({ ...dataToSave, draftId: savedDraft.id }))
        // Store the draft ID in localStorage for persistence
        localStorage.setItem('currentDraftId', savedDraft.id)
        
        // Also update the main localStorage backup with current form data
        const localStorageData = {
          ...dataToSave,
          draftId: savedDraft.id,
          technicalCertification: null, // Don't save files to localStorage
          purchaseProof: null,
          maintenanceRecords: null,
          deviceImages: []
        }
        localStorage.setItem('dobFormBackup', JSON.stringify(localStorageData))
      } else if (currentDraftId && savedDraft) {
        // Update the deviceData with current form data for existing drafts
        setDeviceData(prev => ({ ...dataToSave, draftId: currentDraftId }))
        
        // Update the main localStorage backup with current form data
        const localStorageData = {
          ...dataToSave,
          draftId: currentDraftId,
          technicalCertification: null, // Don't save files to localStorage
          purchaseProof: null,
          maintenanceRecords: null,
          deviceImages: []
        }
        localStorage.setItem('dobFormBackup', JSON.stringify(localStorageData))
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

  // Scroll-based step highlighting with smooth fade-in
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    let isScrolling = false
    let lastScrollTop = 0
    
    const handleScroll = () => {
      if (isScrolling) return // Prevent updates during programmatic scrolling
      
      const currentScrollTop = window.scrollY
      const scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up'
      lastScrollTop = currentScrollTop
      
      clearTimeout(scrollTimeout)
      
      scrollTimeout = setTimeout(() => {
        const headerHeight = 80
        const stepIndicatorHeight = 56
        const totalOffset = headerHeight + stepIndicatorHeight + 20
        const scrollPosition = window.scrollY + totalOffset
        const viewportHeight = window.innerHeight

        // More sensitive detection with smaller thresholds
        for (let step = 1; step <= totalSteps; step++) {
          const stepElement = document.getElementById(`step-${step}`)
          if (stepElement) {
            const elementTop = stepElement.offsetTop
            const elementBottom = elementTop + stepElement.offsetHeight
            const elementCenter = elementTop + (elementBottom - elementTop) / 2
            
            // More sensitive detection - trigger when element is 30% visible
            const visibilityThreshold = 0.3
            const elementVisibleHeight = Math.min(elementBottom, scrollPosition + viewportHeight) - Math.max(elementTop, scrollPosition)
            const elementVisibility = elementVisibleHeight / (elementBottom - elementTop)
            
            // Check if element is sufficiently visible or if we're near its center
            const isElementVisible = elementVisibility > visibilityThreshold
            const isNearCenter = Math.abs(scrollPosition + viewportHeight / 2 - elementCenter) < viewportHeight / 3
            
            if (isElementVisible || isNearCenter) {
              if (currentStep !== step) {
                // Immediate transition for better responsiveness
                setCurrentStep(step)
              }
              break
            }
          }
        }
      }, 50) // Much shorter debounce for better responsiveness
    }

    // Detect programmatic scrolling
    const handleScrollStart = () => {
      isScrolling = true
      setTimeout(() => {
        isScrolling = false
      }, 800) // Shorter delay for better responsiveness
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScrollStart, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScrollStart)
      clearTimeout(scrollTimeout)
    }
  }, [currentStep, totalSteps])

  // Add tab navigation with smooth scrolling
  useEffect(() => {
    const handleTabNavigation = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const activeElement = document.activeElement as HTMLElement
        if (!activeElement) return

        // Check if we're on the last field of a step
        const currentStepElement = document.getElementById(`step-${currentStep}`)
        if (!currentStepElement) return

        const inputs = currentStepElement.querySelectorAll('input, textarea, select')
        const lastInput = inputs[inputs.length - 1] as HTMLElement

        // If tabbing from the last field of current step, scroll to next step
        if (activeElement === lastInput && !e.shiftKey && currentStep < totalSteps) {
          e.preventDefault()
          
          // Smooth scroll to next step
          setTimeout(() => {
            const nextStepElement = document.getElementById(`step-${currentStep + 1}`)
            if (nextStepElement) {
              const headerHeight = 80
              const stepIndicatorHeight = 56
              const totalOffset = headerHeight + stepIndicatorHeight + 20
              const elementTop = nextStepElement.offsetTop - totalOffset
              
              window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
              })

              // Focus the first input of the next step
              setTimeout(() => {
                const firstInput = nextStepElement.querySelector('input, textarea, select') as HTMLElement
                if (firstInput) {
                  firstInput.focus()
                }
              }, 600) // Wait for scroll to complete
            }
          }, 50)
        }
      }
    }

    window.addEventListener('keydown', handleTabNavigation)
    return () => window.removeEventListener('keydown', handleTabNavigation)
  }, [currentStep, totalSteps])

  // Validation function
  const validateForm = () => {
    const requiredFields = [
      'deviceName', 'deviceType', 'location', 'serialNumber', 'manufacturer', 
      'model', 'yearOfManufacture', 'condition', 'specifications',
      'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts'
    ]
    
    const missingFields = requiredFields.filter(field => {
      const value = deviceData[field as keyof DeviceData]
      return !value || (typeof value === 'string' && value.trim() === '')
    })
    
    setValidationErrors(missingFields)
    return missingFields.length === 0
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [autoSaveTimeout])

  // Reset initial load flag when component unmounts
  useEffect(() => {
    return () => {
      isInitialLoad.current = true
    }
  }, [])

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
    if (step >= 1 && step <= totalSteps && step !== currentStep) {
      setCurrentStep(step)
      
      // Use native smooth scrolling for better performance
      setTimeout(() => {
        const headerHeight = 80 // Header height
        const stepIndicatorHeight = 56 // Step indicator height
        const totalOffset = headerHeight + stepIndicatorHeight + 20 // Extra padding
        
        // Scroll to the specific step with smooth animation
        const stepElement = document.getElementById(`step-${step}`)
        if (stepElement) {
          const elementTop = stepElement.offsetTop - totalOffset
          
          // Use native smooth scrolling
          window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
          })
        }
      }, 50)
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
      "4. Serial Number: " + (deviceData.serialNumber || "Not provided"),
      "5. Manufacturer: " + (deviceData.manufacturer || "Not provided"),
      "6. Model: " + (deviceData.model || "Not provided"),
      "7. Year of Manufacture: " + (deviceData.yearOfManufacture || "Not provided"),
      "8. Condition: " + (deviceData.condition || "Not provided"),
      "9. Specifications: " + (deviceData.specifications || "Not provided"),
      "\nSTEP 3: FINANCIAL INFORMATION",
      "10. Purchase Price: " + (deviceData.purchasePrice || "Not provided"),
      "11. Current Value: " + (deviceData.currentValue || "Not provided"),
      "12. Expected Revenue: " + (deviceData.expectedRevenue || "Not provided"),
      "13. Operational Costs: " + (deviceData.operationalCosts || "Not provided"),
      "\nSTEP 4: DOCUMENTATION",
      "14. Technical Certification: " + (deviceData.technicalCertification ? "Uploaded" : "Not uploaded"),
      "15. Purchase Proof: " + (deviceData.purchaseProof ? "Uploaded" : "Not uploaded"),
      "16. Maintenance Records: " + (deviceData.maintenanceRecords ? "Uploaded" : "Not uploaded"),
      "17. Device Images: " + (deviceData.deviceImages.length > 0 ? `${deviceData.deviceImages.length} images uploaded` : "No images uploaded"),
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
    localStorage.removeItem('currentDraftId')
    
    // Reset form state
    setDeviceData({
      deviceName: '',
      deviceType: '',
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

  // Step Indicator with clickable steps - Fixed at top with frosted glass
  const StepIndicator = useMemo(() => {
    return (
      <div className="fixed top-24 left-0 right-0 z-40 flex justify-center">
        <div className="bg-black/20 backdrop-blur-md border border-white/10 shadow-lg rounded-full px-6 py-3">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => {
              return (
                <div key={index} className="flex items-center">
                  <button
                    onClick={() => goToStep(index + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 shadow-md ${
                      index + 1 === currentStep
                        ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20 scale-110 step-indicator-active"
                        : index + 1 < currentStep
                          ? "bg-primary/20 text-primary border-2 border-primary hover:bg-primary/30 hover:scale-105"
                          : "bg-muted text-muted-foreground border-2 border-muted hover:bg-muted/80 hover:border-primary/50 hover:scale-105"
                    }`}
                  >
                    {index + 1}
                  </button>
                  {index < totalSteps - 1 && (
                    <div className={`h-0.5 w-8 transition-all duration-400 ease-in-out rounded-full ${
                      index + 1 < currentStep 
                        ? "bg-primary scale-x-100" 
                        : index + 1 === currentStep 
                          ? "bg-gradient-to-r from-primary to-muted scale-x-75" 
                          : "bg-muted scale-x-50"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }, [currentStep, totalSteps, goToStep])

  // Multi-step View Component (show all cards for scrolling)
  const MultiStepView = useMemo(() => (
    <div className="space-y-8">
      {/* Step 1: Basic Information */}
      <div 
        id="step-1" 
        className={`transition-all duration-400 ease-in-out transform ${
          currentStep === 1 
            ? 'opacity-100 scale-100 step-active' 
            : currentStep > 1 
              ? 'opacity-70 scale-98 step-inactive' 
              : 'opacity-40 scale-95 step-inactive'
        }`}
      >
        <DeviceBasicInfo 
          key={`basic-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData} 
          updateDeviceData={updateDeviceData} 
          onNext={() => {}} // Remove navigation
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Step 2: Technical Information */}
      <div 
        id="step-2" 
        className={`transition-all duration-400 ease-in-out transform ${
          currentStep === 2 
            ? 'opacity-100 scale-100 step-active' 
            : currentStep > 2 
              ? 'opacity-70 scale-98 step-inactive' 
              : 'opacity-40 scale-95 step-inactive'
        }`}
      >
        <DeviceTechnicalInfo
          key={`technical-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData}
          updateDeviceData={updateDeviceData}
          onNext={() => {}} // Remove navigation
          onBack={() => {}} // Remove navigation
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Step 3: Financial Information */}
      <div 
        id="step-3" 
        className={`transition-all duration-400 ease-in-out transform ${
          currentStep === 3 
            ? 'opacity-100 scale-100 step-active' 
            : currentStep > 3 
              ? 'opacity-70 scale-98 step-inactive' 
              : 'opacity-40 scale-95 step-inactive'
        }`}
      >
        <DeviceFinancialInfo
          key={`financial-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData}
          updateDeviceData={updateDeviceData}
          onNext={() => {}} // Remove navigation
          onBack={() => {}} // Remove navigation
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Step 4: Documentation */}
      <div 
        id="step-4" 
        className={`transition-all duration-400 ease-in-out transform ${
          currentStep === 4 
            ? 'opacity-100 scale-100 step-active' 
            : currentStep > 4 
              ? 'opacity-70 scale-98 step-inactive' 
              : 'opacity-40 scale-95 step-inactive'
        }`}
      >
        <DeviceDocumentation
          key={`documentation-${currentDraftId || 'new'}-${draftLoadKey}`}
          deviceData={deviceData}
          updateDeviceData={updateDeviceData}
          onNext={() => {}} // Remove navigation
          onBack={() => {}} // Remove navigation
          onSaveDraft={handleSaveDraft}
          onAutoSave={debouncedAutoSave}
        />
      </div>

      {/* Review step removed - now only accessible via review page */}

      {/* Success step removed - handled on review page */}
    </div>
  ), [currentStep, currentDraftId, draftLoadKey, deviceData, updateDeviceData, handleSaveDraft, debouncedAutoSave])

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

  return (
    <>
      {/* Multi-step view with natural scrolling */}
      <div className="min-h-screen py-8 px-4 pt-28">
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
          {StepIndicator}

          {/* Form Content - Natural scrolling */}
          <div className="max-w-4xl mx-auto">
            {MultiStepView}
            
            {/* Single Next Button */}
            <div className="mt-12 flex flex-col items-center space-y-4">
              {/* Validation Error Message */}
              {validationErrors.length > 0 && (
                <div className="w-full max-w-md p-4 bg-yellow-900/50 border border-yellow-700/50 rounded-lg backdrop-blur-sm animate-pulse">
                  <h3 className="text-yellow-200 font-medium mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Incomplete Form</span>
                  </h3>
                  <p className="text-yellow-300 text-sm">
                    Please complete the following fields before submitting: <strong>{validationErrors.join(', ')}</strong>
                  </p>
                </div>
              )}
              
              <Button
                onClick={async () => {
                  // Validate form before proceeding
                  if (!validateForm()) {
                    toast({
                      title: "Incomplete Form",
                      description: "Please complete all required fields before submitting.",
                      variant: "destructive",
                    })
                    return
                  }
                  
                  // Save current data to localStorage and navigate to review page
                  try {
                    await handleSaveDraft()
                    // Also save to localStorage for the review page
                    localStorage.setItem('dobFormBackup', JSON.stringify(deviceData))
                    router.push('/form/review')
                  } catch (error) {
                    console.error('Failed to save data:', error)
                    // Still navigate to review page even if save fails
                    localStorage.setItem('dobFormBackup', JSON.stringify(deviceData))
                    router.push('/form/review')
                  }
                }}
                className="px-8 py-3 text-sm font-medium bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                size="default"
              >
                <Send className="h-4 w-4" />
                Review & Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 