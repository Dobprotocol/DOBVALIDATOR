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
import { Save, Loader2, Download, LayoutGrid, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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
  const [isSinglePageView, setIsSinglePageView] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [previousStep, setPreviousStep] = useState(1)
  const [scrollProgress, setScrollProgress] = useState(0)
  
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

  // Handle step changes with slide direction
  useEffect(() => {
    if (currentStep > previousStep) {
      setSlideDirection('right')
    } else if (currentStep < previousStep) {
      setSlideDirection('left')
    }
    setPreviousStep(currentStep)
    
    // Set animation state
    setIsScrolling(true)
    const timer = setTimeout(() => {
      setIsScrolling(false)
    }, 500) // Match the transition duration
    
    return () => clearTimeout(timer)
  }, [currentStep, previousStep])

  // Scroll listener for step-by-step view
  useEffect(() => {
    if (isSinglePageView) return // Only for step-by-step view
    
    const handleScroll = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      
      // Calculate scroll progress (0 to 1)
      const progress = scrollTop / (scrollHeight - clientHeight)
      setScrollProgress(progress)
      
      // Calculate which step should be visible based on scroll position
      const stepHeight = scrollHeight / totalSteps
      const currentScrollStep = Math.floor(scrollTop / stepHeight) + 1
      
      if (currentScrollStep !== currentStep && currentScrollStep >= 1 && currentScrollStep <= totalSteps) {
        setCurrentStep(currentScrollStep)
      }
    }
    
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [isSinglePageView, currentStep, totalSteps])

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

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
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

  // Enhanced Step Indicator with clickable steps
  const StepIndicator = () => (
    <div className="flex justify-center items-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
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
      ))}
      
      {/* Scroll progress indicator */}
      <div className="ml-4 flex items-center space-x-2">
        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.round(scrollProgress * 100)}%
        </span>
      </div>
    </div>
  )

  // Multi-step View Component with scrollable layout and fade animations
  const MultiStepView = () => (
    <div 
      ref={containerRef}
      className="relative h-[70vh] overflow-y-auto overflow-x-hidden scroll-smooth"
    >
      <div className="relative min-h-full">
        {/* Step 1 */}
        <div
          ref={(el) => { stepRefs.current[0] = el }}
          className={`step-card min-h-[70vh] flex items-center justify-center transition-all duration-500 ease-in-out transform ${
            currentStep === 1 
              ? 'opacity-100 scale-100 translate-y-0' 
              : currentStep > 1 
                ? 'opacity-30 scale-95 translate-y-4' 
                : 'opacity-30 scale-95 -translate-y-4'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceBasicInfo deviceData={deviceData} updateDeviceData={updateDeviceData} onNext={nextStep} />
          </div>
        </div>

        {/* Step 2 */}
        <div
          ref={(el) => { stepRefs.current[1] = el }}
          className={`step-card min-h-[70vh] flex items-center justify-center transition-all duration-500 ease-in-out transform ${
            currentStep === 2 
              ? 'opacity-100 scale-100 translate-y-0' 
              : currentStep > 2 
                ? 'opacity-30 scale-95 translate-y-4' 
                : 'opacity-30 scale-95 -translate-y-4'
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
          className={`step-card min-h-[70vh] flex items-center justify-center transition-all duration-500 ease-in-out transform ${
            currentStep === 3 
              ? 'opacity-100 scale-100 translate-y-0' 
              : currentStep > 3 
                ? 'opacity-30 scale-95 translate-y-4' 
                : 'opacity-30 scale-95 -translate-y-4'
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
          className={`step-card min-h-[70vh] flex items-center justify-center transition-all duration-500 ease-in-out transform ${
            currentStep === 4 
              ? 'opacity-100 scale-100 translate-y-0' 
              : currentStep > 4 
                ? 'opacity-30 scale-95 translate-y-4' 
                : 'opacity-30 scale-95 -translate-y-4'
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
          className={`step-card min-h-[70vh] flex items-center justify-center transition-all duration-500 ease-in-out transform ${
            currentStep === 5 
              ? 'opacity-100 scale-100 translate-y-0' 
              : currentStep > 5 
                ? 'opacity-30 scale-95 translate-y-4' 
                : 'opacity-30 scale-95 -translate-y-4'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceReview deviceData={deviceData} onNext={nextStep} onBack={prevStep} />
          </div>
        </div>

        {/* Step 6 */}
        <div
          ref={(el) => { stepRefs.current[5] = el }}
          className={`step-card min-h-[70vh] flex items-center justify-center transition-all duration-500 ease-in-out transform ${
            currentStep === 6 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-30 scale-95 -translate-y-4'
          }`}
        >
          <div className="w-full max-w-2xl p-8">
            <DeviceSuccess />
          </div>
        </div>
      </div>
    </div>
  )

  // Single Page View Component - Continuous scrollable layout
  const SinglePageView = () => (
    <div className="relative space-y-12 pb-12">
      <Card className="transition-all duration-500 ease-in-out hover:shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-primary">Step 1: Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={deviceData.deviceName}
                onChange={(e) => updateDeviceData({ deviceName: e.target.value })}
                placeholder="Enter a name for your device"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={deviceData.deviceType}
                onValueChange={(value) => updateDeviceData({ deviceType: value })}
                required
              >
                <SelectTrigger id="deviceType" className="mt-2">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {["Solar Panel", "Wind Turbine", "Battery Storage", "Mining Equipment", "Server", "Other"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={deviceData.serialNumber}
                onChange={(e) => updateDeviceData({ serialNumber: e.target.value })}
                placeholder="Enter the device serial number"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={deviceData.manufacturer}
                onChange={(e) => updateDeviceData({ manufacturer: e.target.value })}
                placeholder="Enter the device manufacturer"
                required
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-500 ease-in-out hover:shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-primary">Step 2: Technical Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={deviceData.model}
                onChange={(e) => updateDeviceData({ model: e.target.value })}
                placeholder="Enter the device model"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="yearOfManufacture">Year of Manufacture</Label>
              <Select
                value={deviceData.yearOfManufacture}
                onValueChange={(value) => updateDeviceData({ yearOfManufacture: value })}
                required
              >
                <SelectTrigger id="yearOfManufacture" className="mt-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString()).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={deviceData.condition}
                onValueChange={(value) => updateDeviceData({ condition: value })}
                required
              >
                <SelectTrigger id="condition" className="mt-2">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {["New", "Like New", "Excellent", "Good", "Fair", "Poor"].map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="specifications">Technical Specifications</Label>
              <Textarea
                id="specifications"
                value={deviceData.specifications}
                onChange={(e) => updateDeviceData({ specifications: e.target.value })}
                placeholder="Enter detailed technical specifications"
                className="min-h-[120px] mt-2"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-500 ease-in-out hover:shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-primary">Step 3: Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={deviceData.purchasePrice}
                onChange={(e) => updateDeviceData({ purchasePrice: e.target.value })}
                placeholder="Enter the original purchase price"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="currentValue">Current Value (USD)</Label>
              <Input
                id="currentValue"
                type="number"
                min="0"
                step="0.01"
                value={deviceData.currentValue}
                onChange={(e) => updateDeviceData({ currentValue: e.target.value })}
                placeholder="Enter the current estimated value"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="expectedRevenue">Expected Annual Revenue (USD)</Label>
              <Input
                id="expectedRevenue"
                type="number"
                min="0"
                step="0.01"
                value={deviceData.expectedRevenue}
                onChange={(e) => updateDeviceData({ expectedRevenue: e.target.value })}
                placeholder="Enter the expected annual revenue"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="operationalCosts">Annual Operational Costs (USD)</Label>
              <Input
                id="operationalCosts"
                type="number"
                min="0"
                step="0.01"
                value={deviceData.operationalCosts}
                onChange={(e) => updateDeviceData({ operationalCosts: e.target.value })}
                placeholder="Enter the annual operational costs"
                required
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-500 ease-in-out hover:shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-primary">Step 4: Documentation</h3>
          <p className="text-muted-foreground mb-6">Documentation uploads are available in the step-by-step view.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Technical Certification:</span>
              <span className={`px-2 py-1 rounded text-sm ${deviceData.technicalCertification ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {deviceData.technicalCertification ? "Uploaded" : "Not uploaded"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Purchase Proof:</span>
              <span className={`px-2 py-1 rounded text-sm ${deviceData.purchaseProof ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {deviceData.purchaseProof ? "Uploaded" : "Not uploaded"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Maintenance Records:</span>
              <span className={`px-2 py-1 rounded text-sm ${deviceData.maintenanceRecords ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {deviceData.maintenanceRecords ? "Uploaded" : "Not uploaded"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Device Images:</span>
              <span className={`px-2 py-1 rounded text-sm ${deviceData.deviceImages.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {deviceData.deviceImages.length > 0 ? `${deviceData.deviceImages.length} images` : "No images"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-500 ease-in-out hover:shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-primary">Step 5: Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-muted-foreground border-b pb-2">Basic Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Device:</span>
                  <span className="text-muted-foreground">{deviceData.deviceName || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="text-muted-foreground">{deviceData.deviceType || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Serial:</span>
                  <span className="text-muted-foreground">{deviceData.serialNumber || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Manufacturer:</span>
                  <span className="text-muted-foreground">{deviceData.manufacturer || "Not provided"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-muted-foreground border-b pb-2">Financial Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Purchase Price:</span>
                  <span className="text-muted-foreground">${deviceData.purchasePrice || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Current Value:</span>
                  <span className="text-muted-foreground">${deviceData.currentValue || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Expected Revenue:</span>
                  <span className="text-muted-foreground">${deviceData.expectedRevenue || "0"}/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Operational Costs:</span>
                  <span className="text-muted-foreground">${deviceData.operationalCosts || "0"}/year</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <>
      <style jsx>{`
        .transform {
          will-change: transform, opacity;
        }
        .transition-all {
          transition-property: all;
        }
        .step-card {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
        .step-indicator {
          will-change: transform, background-color;
        }
        .scroll-container {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className={`${isSinglePageView ? 'h-auto' : 'h-screen'} py-8 px-4 overflow-hidden`}>
        <div className="container mx-auto h-full flex flex-col">
          {/* Header with Toggle and Download */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="view-mode"
                  checked={isSinglePageView}
                  onCheckedChange={setIsSinglePageView}
                />
                <Label htmlFor="view-mode" className="flex items-center space-x-2 cursor-pointer select-none">
                  {isSinglePageView ? (
                    <>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Single Page</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Step by Step</span>
                    </>
                  )}
                </Label>
              </div>
            </div>

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

              {!isSinglePageView && currentStep < 5 && (
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

          {/* Step Indicator - Only show in multi-step view */}
          {!isSinglePageView && <StepIndicator />}

          {/* Form Content */}
          <div className="flex-1 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full">
              {isSinglePageView ? <SinglePageView /> : <MultiStepView />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 