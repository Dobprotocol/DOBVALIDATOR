"use client"

import { useState, useEffect } from "react"
import { getStellarSDK, isInitialized as sdkInitialized } from "@/lib/stellar-sdk"

export function useStellar() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [sdk, setSdk] = useState<any>(null)

  useEffect(() => {
    const initializeStellar = () => {
      try {
        if (!sdkInitialized) {
          console.error('Stellar SDK not initialized')
          return
        }

        const stellarSDK = getStellarSDK()
        setSdk(stellarSDK)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize Stellar SDK:', error)
        setIsInitialized(false)
      }
    }

    if (typeof window !== 'undefined') {
      initializeStellar()
    }

    return () => {
      setSdk(null)
    }
  }, [])

  return {
    sdk,
    isInitialized
  }
} 