"use client"

import type React from "react"

import type { DeviceData } from "@/components/device-verification-flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface DeviceTechnicalInfoProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
  onBack: () => void
}

export function DeviceTechnicalInfo({ deviceData, updateDeviceData, onNext, onBack }: DeviceTechnicalInfoProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const conditionOptions = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString())

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Technical Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={deviceData.model}
              onChange={(e) => updateDeviceData({ model: e.target.value })}
              placeholder="Enter the device model"
              required
            />
          </div>

          <div>
            <Label htmlFor="yearOfManufacture">Year of Manufacture</Label>
            <Select
              value={deviceData.yearOfManufacture}
              onValueChange={(value) => updateDeviceData({ yearOfManufacture: value })}
              required
            >
              <SelectTrigger id="yearOfManufacture">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
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
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {conditionOptions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specifications">Technical Specifications</Label>
            <Textarea
              id="specifications"
              value={deviceData.specifications}
              onChange={(e) => updateDeviceData({ specifications: e.target.value })}
              placeholder="Enter detailed technical specifications"
              className="min-h-[100px]"
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
