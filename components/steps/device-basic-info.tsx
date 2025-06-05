"use client"

import type React from "react"

import { useState } from "react"
import type { DeviceData } from "@/components/device-verification-flow"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DeviceBasicInfoProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
}

export function DeviceBasicInfo({ deviceData, updateDeviceData, onNext }: DeviceBasicInfoProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const deviceTypes = ["Solar Panel", "Wind Turbine", "Battery Storage", "Mining Equipment", "Server", "Other"]

  return (
    <>
      {showWelcomeModal && (
        <Modal
          title="Device Verification"
          description="Let's verify your device to create an investment pool and tokenize its future revenue."
          onClose={() => setShowWelcomeModal(false)}
        >
          <p className="mb-6">
            We'll guide you through the process of verifying your device's technical and financial information. This
            helps investors trust your pool and ensures transparency.
          </p>
          <div className="flex justify-end">
            <Button className="bg-white text-[#6366F1] hover:bg-white/90" onClick={() => setShowWelcomeModal(false)}>
              Get Started
            </Button>
          </div>
        </Modal>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-medium text-gray-800 mb-6">Basic Device Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={deviceData.deviceName}
                onChange={(e) => updateDeviceData({ deviceName: e.target.value })}
                placeholder="Enter a name for your device"
                required
              />
            </div>

            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={deviceData.deviceType}
                onValueChange={(value) => updateDeviceData({ deviceType: value })}
                required
              >
                <SelectTrigger id="deviceType">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((type) => (
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
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="bg-[#6366F1] hover:bg-[#5355d1] text-white">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
