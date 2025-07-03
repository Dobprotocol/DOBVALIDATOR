"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"

import type { DeviceData } from "@/components/enhanced-device-verification-flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeviceTechnicalInfoProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
  onBack?: () => void
  onSaveDraft?: (data: Partial<DeviceData>) => Promise<void>
  onAutoSave?: () => void
}

export function DeviceTechnicalInfo({ deviceData, updateDeviceData, onNext, onBack, onSaveDraft, onAutoSave }: DeviceTechnicalInfoProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const currentYear = new Date().getFullYear()

  // Memoize condition options to prevent re-creation on every render
  const conditionOptions = useMemo(() => ["New", "Like New", "Excellent", "Good", "Fair", "Poor"], [])

  // Use local state for form inputs to prevent re-renders
  const [localData, setLocalData] = useState({
    serialNumber: deviceData.serialNumber || "",
    manufacturer: deviceData.manufacturer || "",
    model: deviceData.model || "",
    yearOfManufacture: deviceData.yearOfManufacture || "",
    condition: deviceData.condition || "",
    specifications: deviceData.specifications || ""
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dobFormStep2Backup')
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
  }, []) // Remove updateDeviceData from dependencies

  // Save to localStorage whenever localData changes
  useEffect(() => {
    // Use setTimeout to avoid blocking the render cycle
    const timeoutId = setTimeout(() => {
      localStorage.setItem('dobFormStep2Backup', JSON.stringify(localData))
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [localData])

  // Only sync on draftId change, not on parent state changes
  useEffect(() => {
    setLocalData({
      serialNumber: deviceData.serialNumber || "",
      manufacturer: deviceData.manufacturer || "",
      model: deviceData.model || "",
      yearOfManufacture: deviceData.yearOfManufacture || "",
      condition: deviceData.condition || "",
      specifications: deviceData.specifications || ""
    })
  }, [deviceData.draftId]) // Only reset if draftId changes

  const handleInputChange = useCallback((field: string, value: string) => {
    const newLocalData = { ...localData, [field]: value }
    setLocalData(newLocalData)
    
    // Also update parent state immediately to persist the data
    updateDeviceData({ [field]: value })
    
    // Trigger auto-save if available (debounced)
    if (onAutoSave) {
      setTimeout(() => {
        onAutoSave()
      }, 500)
    }
  }, [localData, updateDeviceData, onAutoSave])

  // Memoize the condition change handler specifically
  const handleConditionChange = useCallback((value: string) => {
    handleInputChange('condition', value)
  }, [handleInputChange])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!localData.serialNumber || localData.serialNumber.length < 3) {
      newErrors.serialNumber = "Serial number must be at least 3 characters"
    }
    if (!localData.manufacturer || localData.manufacturer.length < 2) {
      newErrors.manufacturer = "Manufacturer must be at least 2 characters"
    }
    if (!localData.model || localData.model.length < 1) {
      newErrors.model = "Model is required"
    }
    if (!localData.yearOfManufacture || isNaN(Number(localData.yearOfManufacture)) || Number(localData.yearOfManufacture) < 1980 || Number(localData.yearOfManufacture) > currentYear) {
      newErrors.yearOfManufacture = `Year must be between 1980 and ${currentYear}`
    }
    if (!localData.condition) newErrors.condition = "Condition is required"
    if (!localData.specifications || localData.specifications.length < 10) newErrors.specifications = "Specifications required (min 10 chars)"
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

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white mb-2">Technical Information</CardTitle>
        <CardDescription className="text-gray-300">
          Please provide the technical details about your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={localData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                placeholder="Enter the serial number"
                className="form-input"
              />
              {errors.serialNumber && <p className="text-red-500 text-sm mt-1">{errors.serialNumber}</p>}
            </div>

            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={localData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Enter the manufacturer"
                className="form-input"
              />
              {errors.manufacturer && <p className="text-red-500 text-sm mt-1">{errors.manufacturer}</p>}
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={localData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Enter the model"
                className="form-input"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
            </div>

            <div>
              <Label htmlFor="yearOfManufacture">Year of Manufacture</Label>
              <Input
                id="yearOfManufacture"
                value={localData.yearOfManufacture}
                onChange={(e) => handleInputChange('yearOfManufacture', e.target.value)}
                placeholder="Enter the year of manufacture"
                className="form-input"
              />
              {errors.yearOfManufacture && <p className="text-red-500 text-sm mt-1">{errors.yearOfManufacture}</p>}
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={localData.condition || ""}
                onValueChange={handleConditionChange}
              >
                <SelectTrigger id="condition" className="form-select">
                  <SelectValue placeholder="Select device condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
            </div>

            <div>
              <Label htmlFor="specifications">Technical Specifications</Label>
              <Textarea
                id="specifications"
                value={localData.specifications}
                onChange={(e) => handleInputChange('specifications', e.target.value)}
                placeholder="Enter technical specifications"
                className="form-input min-h-[100px]"
              />
              {errors.specifications && <p className="text-red-500 text-sm mt-1">{errors.specifications}</p>}
            </div>
          </div>

          {/* Navigation buttons removed - using single button at bottom */}
        </form>
      </CardContent>
    </Card>
  )
}
