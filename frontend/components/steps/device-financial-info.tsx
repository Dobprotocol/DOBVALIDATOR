"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

import type { DeviceData } from "@/components/enhanced-device-verification-flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeviceFinancialInfoProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
  onBack?: () => void
  onSaveDraft?: (data: Partial<DeviceData>) => Promise<void>
  onAutoSave?: () => void
}

export function DeviceFinancialInfo({ deviceData, updateDeviceData, onNext, onBack, onSaveDraft, onAutoSave }: DeviceFinancialInfoProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Use local state for form inputs to prevent re-renders
  const [localData, setLocalData] = useState({
    purchasePrice: deviceData.purchasePrice || "",
    currentValue: deviceData.currentValue || "",
    expectedRevenue: deviceData.expectedRevenue || "",
    operationalCosts: deviceData.operationalCosts || ""
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dobFormStep3Backup')
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
      localStorage.setItem('dobFormStep3Backup', JSON.stringify(localData))
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [localData])

  // Only sync on draftId change, not on parent state changes
  useEffect(() => {
    setLocalData({
      purchasePrice: deviceData.purchasePrice || "",
      currentValue: deviceData.currentValue || "",
      expectedRevenue: deviceData.expectedRevenue || "",
      operationalCosts: deviceData.operationalCosts || ""
    })
  }, [deviceData.draftId]) // Only reset if draftId changes

  const handleInputChange = (field: string, value: string) => {
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
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!localData.purchasePrice || isNaN(Number(localData.purchasePrice)) || Number(localData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Valid purchase price is required"
    }
    if (!localData.currentValue || isNaN(Number(localData.currentValue)) || Number(localData.currentValue) < 0) {
      newErrors.currentValue = "Valid current value is required"
    }
    if (!localData.expectedRevenue || isNaN(Number(localData.expectedRevenue)) || Number(localData.expectedRevenue) < 0) {
      newErrors.expectedRevenue = "Valid expected revenue is required"
    }
    if (!localData.operationalCosts || isNaN(Number(localData.operationalCosts)) || Number(localData.operationalCosts) < 0) {
      newErrors.operationalCosts = "Valid operational costs are required"
    }
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
        <CardTitle className="text-2xl font-bold text-white mb-2">Financial Information</CardTitle>
        <CardDescription className="text-gray-300">
          Please provide the financial details about your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={localData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                placeholder="Enter purchase price"
                className="form-input"
              />
              {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
            </div>

            <div>
              <Label htmlFor="currentValue">Current Market Value (USD)</Label>
              <Input
                id="currentValue"
                type="number"
                value={localData.currentValue}
                onChange={(e) => handleInputChange('currentValue', e.target.value)}
                placeholder="Enter current market value"
                className="form-input"
              />
              {errors.currentValue && <p className="text-red-500 text-sm mt-1">{errors.currentValue}</p>}
            </div>

            <div>
              <Label htmlFor="expectedRevenue">Expected Annual Revenue (USD)</Label>
              <Input
                id="expectedRevenue"
                type="number"
                value={localData.expectedRevenue}
                onChange={(e) => handleInputChange('expectedRevenue', e.target.value)}
                placeholder="Enter expected annual revenue"
                className="form-input"
              />
              {errors.expectedRevenue && <p className="text-red-500 text-sm mt-1">{errors.expectedRevenue}</p>}
            </div>

            <div>
              <Label htmlFor="operationalCosts">Annual Operational Costs (USD)</Label>
              <Input
                id="operationalCosts"
                type="number"
                value={localData.operationalCosts}
                onChange={(e) => handleInputChange('operationalCosts', e.target.value)}
                placeholder="Enter annual operational costs"
                className="form-input"
              />
              {errors.operationalCosts && <p className="text-red-500 text-sm mt-1">{errors.operationalCosts}</p>}
            </div>
          </div>

          {/* Navigation buttons removed - using single button at bottom */}
        </form>
      </CardContent>
    </Card>
  )
}
