"use client"

import React from 'react'
import { ToastProvider as UIToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <UIToastProvider>
      {children}
      <Toaster />
    </UIToastProvider>
  )
} 