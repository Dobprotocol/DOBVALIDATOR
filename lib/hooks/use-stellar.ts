'use client'

import { useState, useEffect } from 'react'
import StellarSdk from 'stellar-sdk'

export function useStellar() {
  const [server, setServer] = useState<StellarSdk.Server | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeStellar = async () => {
      try {
        // Create server instance
        const serverInstance = new StellarSdk.Server('https://horizon-testnet.stellar.org')
        
        // Set network
        StellarSdk.Network.useTestNetwork()
        
        // Set server and initialization state
        setServer(serverInstance)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize Stellar SDK:', error)
        // Still set initialized to true to show the connect button
        setIsInitialized(true)
      }
    }

    initializeStellar()
  }, [])

  return {
    server,
    isInitialized,
    StellarSdk
  }
} 