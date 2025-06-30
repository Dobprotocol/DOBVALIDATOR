"use client"

import { useState, useEffect } from "react"
import { Networks, BASE_FEE } from '@stellar/stellar-sdk'

export function useStellar() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Initialize Stellar SDK
      Networks.PUBLIC // Use public network
      setIsInitialized(true)
    } catch (err) {
      console.error('Error initializing Stellar SDK:', err)
      setError('Failed to initialize Stellar SDK')
    }
  }, [])

  return {
    isInitialized,
    error,
    baseFee: BASE_FEE,
    network: Networks.PUBLIC
  }
} 