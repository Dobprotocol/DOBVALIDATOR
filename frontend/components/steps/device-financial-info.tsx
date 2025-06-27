"use client"

import type React from "react"
import { useState } from "react"

import type { DeviceData } from "@/components/device-verification-flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DeviceFinancialInfoProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
  onBack: () => void
}

export function DeviceFinancialInfo({ deviceData, updateDeviceData, onNext, onBack }: DeviceFinancialInfoProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!deviceData.purchasePrice || isNaN(Number(deviceData.purchasePrice)) || Number(deviceData.purchasePrice) <= 0) newErrors.purchasePrice = "Purchase price must be > 0"
    if (!deviceData.currentValue || isNaN(Number(deviceData.currentValue)) || Number(deviceData.currentValue) < 0) newErrors.currentValue = "Current value must be >= 0"
    if (!deviceData.expectedRevenue || isNaN(Number(deviceData.expectedRevenue)) || Number(deviceData.expectedRevenue) < 0) newErrors.expectedRevenue = "Expected revenue must be >= 0"
    if (!deviceData.operationalCosts || isNaN(Number(deviceData.operationalCosts)) || Number(deviceData.operationalCosts) < 0) newErrors.operationalCosts = "Operational costs must be >= 0"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="bg-background/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
      <h2 className="text-xl font-medium text-white mb-6">Financial Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={deviceData.purchasePrice}
              onChange={(e) => updateDeviceData({ purchasePrice: e.target.value })}
              placeholder="Enter the purchase price"
              required
              className="form-input"
            />
            {errors.purchasePrice && <p className="text-red-500 text-sm">{errors.purchasePrice}</p>}
          </div>

          <div>
            <Label htmlFor="currentValue">Current Value</Label>
            <Input
              id="currentValue"
              type="number"
              min="0"
              step="0.01"
              value={deviceData.currentValue}
              onChange={(e) => updateDeviceData({ currentValue: e.target.value })}
              placeholder="Enter the current value"
              required
              className="form-input"
            />
            {errors.currentValue && <p className="text-red-500 text-sm">{errors.currentValue}</p>}
          </div>

          <div>
            <Label htmlFor="expectedRevenue">Expected Annual Revenue</Label>
            <Input
              id="expectedRevenue"
              type="number"
              min="0"
              step="0.01"
              value={deviceData.expectedRevenue}
              onChange={(e) => updateDeviceData({ expectedRevenue: e.target.value })}
              placeholder="Enter expected annual revenue"
              required
              className="form-input"
            />
            {errors.expectedRevenue && <p className="text-red-500 text-sm">{errors.expectedRevenue}</p>}
          </div>

          <div>
            <Label htmlFor="operationalCosts">Annual Operational Costs</Label>
            <Input
              id="operationalCosts"
              type="number"
              min="0"
              step="0.01"
              value={deviceData.operationalCosts}
              onChange={(e) => updateDeviceData({ operationalCosts: e.target.value })}
              placeholder="Enter annual operational costs"
              required
              className="form-input"
            />
            {errors.operationalCosts && <p className="text-red-500 text-sm">{errors.operationalCosts}</p>}
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="bg-[#6366F1] hover:bg-[#5355d1] text-white btn-primary">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
