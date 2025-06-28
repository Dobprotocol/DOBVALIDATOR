"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

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
  onBack: () => void
  onSaveDraft?: () => Promise<void>
}

export function DeviceTechnicalInfo({ deviceData, updateDeviceData, onNext, onBack, onSaveDraft }: DeviceTechnicalInfoProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const currentYear = new Date().getFullYear()

  // Use local state for form inputs to prevent re-renders
  const [localData, setLocalData] = useState({
    serialNumber: deviceData.serialNumber || "",
    manufacturer: deviceData.manufacturer || "",
    model: deviceData.model || "",
    yearOfManufacture: deviceData.yearOfManufacture || "",
    condition: deviceData.condition || "",
    specifications: deviceData.specifications || ""
  })

  // Only update local state from props on mount
  useEffect(() => {
    setLocalData({
      serialNumber: deviceData.serialNumber || "",
      manufacturer: deviceData.manufacturer || "",
      model: deviceData.model || "",
      yearOfManufacture: deviceData.yearOfManufacture || "",
      condition: deviceData.condition || "",
      specifications: deviceData.specifications || ""
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }

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
      // Update parent state with current local data
      updateDeviceData(localData)
      
      // Save draft
      await onSaveDraft()
      
      toast({
        title: "Draft Saved",
        description: "Your progress has been automatically saved.",
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

  const conditionOptions = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"]

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
                value={localData.condition}
                onValueChange={(value) => handleInputChange('condition', value)}
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

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex items-center gap-2 ml-auto">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
