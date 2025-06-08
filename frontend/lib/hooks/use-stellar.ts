"use client"

import { useState, useEffect } from "react"
import { StellarSdk } from "@/lib/stellar-sdk"

export function useStellar() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [server, setServer] = useState<any>(null)

  useEffect(() => {
    const initializeStellar = async () => {
      try {
        // Initialize the SDK
        StellarSdk.initialize()
        
        // Create a server instance
        const serverInstance = new StellarSdk.Server('https://horizon-testnet.stellar.org')
        
        setServer(serverInstance)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize Stellar SDK:', error)
        // Still set initialized to true to show the connect button
        setIsInitialized(true)
      }
    }

    if (typeof window !== 'undefined') {
      initializeStellar()
    }
  }, [])

  return {
    StellarSdk,
    server,
    isInitialized
  }
} 