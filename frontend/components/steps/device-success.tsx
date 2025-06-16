"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function DeviceSuccess() {
  const [showModal, setShowModal] = useState(true)

  return (
    <>
      {showModal && (
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
            <Button className="bg-white text-[#6366F1] hover:bg-white/90" onClick={() => setShowModal(false)}>
              Continue to Dashboard
            </Button>
          </div>
        </Modal>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#6366F1]/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="text-[#6366F1] w-8 h-8" />
          </div>

          <h2 className="text-2xl font-medium text-gray-800 mb-4">Verification Submitted!</h2>

          <p className="text-gray-600 mb-8">
            Your device information has been submitted for verification. We'll review your information and
            documentation. This process typically takes 1-2 business days.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 w-full mb-8">
            <h3 className="font-medium text-gray-700 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 text-left space-y-2">
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
            <Button variant="outline" onClick={() => window.location.href = '/devices'}>View My Devices</Button>
            <Button className="bg-[#6366F1] hover:bg-[#5355d1] text-white" onClick={() => window.open('https://home.dobprotocol.com', '_blank')}>Create Pool</Button>
          </div>
        </div>
      </div>
    </>
  )
}
