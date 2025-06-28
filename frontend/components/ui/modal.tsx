"use client"

import type React from "react"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModalProps {
  title: string
  description?: string
  children: React.ReactNode
  onClose?: () => void
  showCloseButton?: boolean
}

export function Modal({ title, description, children, onClose, showCloseButton = true }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-[#6366F1] text-white rounded-lg w-full max-w-md p-6 relative">
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-white hover:bg-[#5355d1] hover:text-white"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        )}

        <div className="flex items-center mb-4">
          <img src="/images/dob-logo.png" alt="DOB Logo" className="w-10 h-10 mr-4" />
          <div>
            <h2 className="text-xl font-medium">{title}</h2>
            {description && <p className="text-sm text-white/80 mt-1">{description}</p>}
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
