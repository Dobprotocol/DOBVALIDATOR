"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModalUtils, MODAL_KEYS } from "@/lib/modal-utils"

// This component is only for development/debugging purposes
// It should not be used in production
export function ModalDebug() {
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const handleResetAll = () => {
    ModalUtils.clearAllModalStorage()
    alert('All modal storage cleared! Refresh the page to see modals again.')
  }

  const handleResetWelcome = () => {
    ModalUtils.clearModalStorage(MODAL_KEYS.WELCOME)
    alert('Welcome modal storage cleared! Navigate to the form to see it again.')
  }

  const handleResetSuccess = () => {
    ModalUtils.clearModalStorage(MODAL_KEYS.SUCCESS)
    alert('Success modal storage cleared! Complete the form to see it again.')
  }

  const checkStatus = () => {
    const welcomeSeen = ModalUtils.hasSeenModal(MODAL_KEYS.WELCOME)
    const successSeen = ModalUtils.hasSeenModal(MODAL_KEYS.SUCCESS)
    
    alert(`Modal Status:
Welcome Modal: ${welcomeSeen ? 'Seen' : 'Not seen'}
Success Modal: ${successSeen ? 'Seen' : 'Not seen'}`)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Debug Modals
        </Button>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg space-y-2 min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Modal Debug</h3>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          
          <Button
            onClick={checkStatus}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Check Status
          </Button>
          
          <Button
            onClick={handleResetWelcome}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Reset Welcome Modal
          </Button>
          
          <Button
            onClick={handleResetSuccess}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Reset Success Modal
          </Button>
          
          <Button
            onClick={handleResetAll}
            size="sm"
            variant="destructive"
            className="w-full text-xs"
          >
            Reset All Modals
          </Button>
        </div>
      )}
    </div>
  )
} 