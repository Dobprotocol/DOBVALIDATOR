"use client"

import { useState, useEffect } from "react"
import { Network, BASE_FEE } from '@stellar/stellar-sdk'

export function useStellar() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [network, setNetwork] = useState<Network | null>(null)
  const [baseFee, setBaseFee] = useState<string>('100')
  const [networkType, setNetworkType] = useState<'testnet' | 'public'>('testnet')

  useEffect(() => {
    const initializeStellar = () => {
      try {
        if (typeof window === 'undefined') {
          return
        }

        // Get network configuration from environment
        const networkType = (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'public') || 'testnet'
        setNetworkType(networkType)

        // Set the network passphrase based on environment
        if (networkType === 'testnet') {
          Network.useTestNetwork()
        } else {
          Network.usePublicNetwork()
        }
        
        // Set the base fee
        BASE_FEE = '100'
        
        setNetwork(Network)
        setBaseFee(BASE_FEE)
        setIsInitialized(true)
        console.log(`✅ Stellar SDK initialized in hook for ${networkType} network`)
      } catch (error) {
        console.error('Failed to initialize Stellar SDK in hook:', error)
        setIsInitialized(false)
      }
    }

    initializeStellar()

    return () => {
      setNetwork(null)
      setIsInitialized(false)
    }
  }, [])

  return {
    network,
    baseFee,
    isInitialized,
    networkType
  }
} 