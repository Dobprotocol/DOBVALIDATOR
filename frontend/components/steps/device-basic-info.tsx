"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { DeviceData } from "@/components/enhanced-device-verification-flow"
import { Modal } from "@/components/ui/modal"
import { PixelExplosion } from "@/components/ui/pixel-explosion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModalUtils, MODAL_KEYS } from "@/lib/modal-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeviceBasicInfoProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
  onBack?: () => void
  onSaveDraft?: (data: Partial<DeviceData>) => Promise<void>
  onAutoSave?: () => void
}

// Device types that match the backend schema
const DEVICE_TYPES = [
  { value: "renewable-energy", label: "Renewable Energy" },
  { value: "wind-energy", label: "Wind Energy" },
  { value: "energy-storage", label: "Energy Storage" },
  { value: "solar-panel", label: "Solar Panel" },
  { value: "wind-turbine", label: "Wind Turbine" },
  { value: "battery-storage", label: "Battery Storage" },
  { value: "hydro-generator", label: "Hydro Generator" },
  { value: "geothermal", label: "Geothermal" },
  { value: "biomass", label: "Biomass" }
]

export function DeviceBasicInfo({ deviceData, updateDeviceData, onNext, onBack, onSaveDraft, onAutoSave }: DeviceBasicInfoProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Use local state for form inputs to prevent re-renders
  const [localData, setLocalData] = useState({
    deviceName: deviceData.deviceName || "",
    deviceType: deviceData.deviceType || "",
    customDeviceType: deviceData.customDeviceType || "",
    location: deviceData.location || ""
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dobFormStep1Backup')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setLocalData(prev => ({
          ...prev,
          ...parsedData
        }))
        // Also update parent state
        updateDeviceData(parsedData)
      } catch (error) {
        console.error('Error parsing localStorage data:', error)
      }
    }
  }, [])

  // Save to localStorage whenever localData changes
  useEffect(() => {
    localStorage.setItem('dobFormStep1Backup', JSON.stringify(localData))
  }, [localData])

  // Only sync on draftId change, not on parent state changes
  useEffect(() => {
    setLocalData({
      deviceName: deviceData.deviceName || "",
      deviceType: deviceData.deviceType || "",
      customDeviceType: deviceData.customDeviceType || "",
      location: deviceData.location || ""
    })
  }, [deviceData.draftId]) // Only reset if draftId changes

  // Check if user has seen the welcome modal in this session
  useEffect(() => {
    if (!ModalUtils.hasSeenModal(MODAL_KEYS.WELCOME)) {
      setShowWelcomeModal(true)
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    console.log('🔍 Input change:', field, value)
    setLocalData(prev => ({ ...prev, [field]: value }))
    
    // Trigger auto-save if available
    if (onAutoSave) {
      onAutoSave()
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!localData.deviceName || localData.deviceName.length < 2) newErrors.deviceName = "Device name is required (min 2 chars)"
    if (!localData.deviceType || localData.deviceType.length < 2) newErrors.deviceType = "Device type is required (min 2 chars)"
    if (!localData.location || localData.location.length < 2) newErrors.location = "Location is required (min 2 chars)"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return
    
    setIsSaving(true)
    try {
      // Update parent state first with current local data
      updateDeviceData(localData)
      
      // Then save the draft
      await onSaveDraft(localData)
      
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      // Only now update parent state
      updateDeviceData(localData)
      onNext()
    }
  }

  const handleCloseModal = () => {
    // Mark that user has seen the welcome modal
    ModalUtils.markModalAsSeen(MODAL_KEYS.WELCOME)
    
    // Get modal position for explosion animation
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      setExplosionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
    }
    
    setShowWelcomeModal(false)
    setShowExplosion(true)
  }

  const handleExplosionComplete = () => {
    setShowExplosion(false)
  }

  return (
    <>
      {showWelcomeModal && (
        <div ref={modalRef}>
          <Modal
            title="Device Verification"
            description="Let's verify your device to create an investment pool and tokenize its future revenue."
            onClose={handleCloseModal}
          >
            <p className="mb-6">
              We'll guide you through the process of verifying your device's technical and financial information. This
              helps investors trust your pool and ensures transparency.
            </p>
            <div className="flex justify-end">
              <Button className="bg-[#6366F1] text-white hover:bg-[#5355d1]" onClick={handleCloseModal}>
                Get Started
              </Button>
            </div>
          </Modal>
        </div>
      )}

      <PixelExplosion
        isActive={showExplosion}
        onComplete={handleExplosionComplete}
        x={explosionPosition.x}
        y={explosionPosition.y}
      />

      <Card className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-2">Device Basic Information</CardTitle>
          <CardDescription className="text-gray-300">
            Please provide the basic details about your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  value={localData.deviceName}
                  onChange={(e) => handleInputChange('deviceName', e.target.value)}
                  placeholder="Enter device name"
                  className="form-input"
                />
                {errors.deviceName && <p className="text-red-500 text-sm mt-1">{errors.deviceName}</p>}
              </div>

              <div>
                <Label htmlFor="deviceType">Device Type</Label>
                <Select
                  value={localData.deviceType}
                  onValueChange={(value) => handleInputChange('deviceType', value)}
                >
                  <SelectTrigger id="deviceType" className="form-select">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_TYPES.map((deviceType) => (
                      <SelectItem key={deviceType.value} value={deviceType.value}>
                        {deviceType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.deviceType && <p className="text-red-500 text-sm mt-1">{errors.deviceType}</p>}
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={localData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter device location"
                  className="form-input"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Navigation buttons removed - using single button at bottom */}
          </form>
        </CardContent>
      </Card>
    </>
  )
}
