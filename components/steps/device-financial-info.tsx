"use client"

import type React from "react"

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Financial Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
            />
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="bg-[#6366F1] hover:bg-[#5355d1] text-white">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
