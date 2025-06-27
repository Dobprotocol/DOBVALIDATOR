"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { DeviceData } from "@/components/device-verification-flow"
import { Modal } from "@/components/ui/modal"
import { PixelExplosion } from "@/components/ui/pixel-explosion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModalUtils, MODAL_KEYS } from "@/lib/modal-utils"

interface DeviceBasicInfoProps {
  deviceData: DeviceData
  updateDeviceData: (data: Partial<DeviceData>) => void
  onNext: () => void
}

export function DeviceBasicInfo({ deviceData, updateDeviceData, onNext }: DeviceBasicInfoProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const modalRef = useRef<HTMLDivElement>(null)

  // Check if user has seen the welcome modal in this session
  useEffect(() => {
    if (!ModalUtils.hasSeenModal(MODAL_KEYS.WELCOME)) {
      setShowWelcomeModal(true)
    }
  }, [])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!deviceData.deviceName || deviceData.deviceName.length < 2) newErrors.deviceName = "Device name is required (min 2 chars)"
    if (!deviceData.deviceType) newErrors.deviceType = "Device type is required"
    if (!deviceData.serialNumber || deviceData.serialNumber.length < 3) newErrors.serialNumber = "Serial number is required (min 3 chars)"
    if (!deviceData.manufacturer || deviceData.manufacturer.length < 2) newErrors.manufacturer = "Manufacturer is required (min 2 chars)"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
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

  const deviceTypes = ["Solar Panel", "Wind Turbine", "Battery Storage", "Mining Equipment", "Server", "Other"]

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

      <div className="bg-background/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-medium text-white mb-6">Basic Device Information</h2>

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
                className="form-input"
              />
              {errors.deviceName && <p className="text-red-500 text-sm">{errors.deviceName}</p>}
            </div>

            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={deviceData.deviceType}
                onValueChange={(value) => updateDeviceData({ deviceType: value })}
                required
              >
                <SelectTrigger id="deviceType" className="form-select">
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
              {errors.deviceType && <p className="text-red-500 text-sm">{errors.deviceType}</p>}
            </div>

            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={deviceData.serialNumber}
                onChange={(e) => updateDeviceData({ serialNumber: e.target.value })}
                placeholder="Enter the device serial number"
                required
                className="form-input"
              />
              {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber}</p>}
            </div>

            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={deviceData.manufacturer}
                onChange={(e) => updateDeviceData({ manufacturer: e.target.value })}
                placeholder="Enter the device manufacturer"
                required
                className="form-input"
              />
              {errors.manufacturer && <p className="text-red-500 text-sm">{errors.manufacturer}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="bg-[#6366F1] hover:bg-[#5355d1] text-white btn-primary">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
