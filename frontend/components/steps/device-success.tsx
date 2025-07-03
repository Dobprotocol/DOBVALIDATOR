"use client"

import { useState, useEffect, useRef } from "react"
import { Modal } from "@/components/ui/modal"
import { PixelExplosion } from "@/components/ui/pixel-explosion"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { ModalUtils, MODAL_KEYS } from "@/lib/modal-utils"

interface DeviceSuccessProps {
  showModal?: boolean
}

export function DeviceSuccess({ showModal = false }: DeviceSuccessProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // Check if user has seen the success modal in this session and if showModal is true
  useEffect(() => {
    if (showModal && !ModalUtils.hasSeenModal(MODAL_KEYS.SUCCESS)) {
      setShowSuccessModal(true)
    }
  }, [showModal])

  const handleCloseModal = () => {
    // Mark that user has seen the success modal
    ModalUtils.markModalAsSeen(MODAL_KEYS.SUCCESS)
    
    // Get modal position for explosion animation
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      setExplosionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
    }
    
    setShowSuccessModal(false)
    setShowExplosion(true)
  }

  const handleExplosionComplete = () => {
    setShowExplosion(false)
  }

  return (
    <>
      {showSuccessModal && (
        <div ref={modalRef}>
          <Modal
            title="Verification Submitted!"
            description="Your device information has been submitted for verification."
            showCloseButton={false}
          >
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="text-white w-16 h-16 mb-4" />
              <p className="text-center mb-6">
                We'll review your information and documentation. This process typically takes 1-2 business days.
              </p>
            </div>
            <div className="flex justify-end">
              <Button className="bg-[#6366F1] text-white hover:bg-[#5355d1]" onClick={handleCloseModal}>
                Continue to Dashboard
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

      <div className="bg-background/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-8 text-center">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#6366F1]/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="text-[#6366F1] w-8 h-8" />
          </div>

          <h2 className="text-2xl font-medium text-white mb-4">Verification Submitted!</h2>

          <p className="text-white mb-8">
            Your device information has been submitted for verification. We'll review your information and
            documentation. This process typically takes 1-2 business days.
          </p>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 w-full mb-8">
            <h3 className="font-medium text-white mb-2">What's Next?</h3>
            <ul className="text-sm text-white text-left space-y-2">
              <li className="flex items-start">
                <span className="text-[#6366F1] mr-2">1.</span>
                <span>Our team will review your device information and documentation</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#6366F1] mr-2">2.</span>
                <span>You'll receive a notification when the verification is complete</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#6366F1] mr-2">3.</span>
                <span>Once verified, you can create your investment pool and tokenize your device's revenue</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>View My Devices</Button>
            <Button className="bg-[#6366F1] hover:bg-[#5355d1] text-white" onClick={() => window.open('https://home.dobprotocol.com', '_blank')}>Create Pool</Button>
          </div>
        </div>
      </div>
    </>
  )
}
