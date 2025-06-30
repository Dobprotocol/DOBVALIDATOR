"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { useWallet } from '../hooks/useWallet'
import { useToast } from './ui/use-toast'
import { TransactionBuilder, Networks, Operation } from '@stellar/stellar-sdk'

export function StellarWallet() {
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWallet()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)

      // Request challenge from backend
      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: 'temp' }) // Temporary wallet address
      })

      if (!challengeResponse.ok) {
        throw new Error('Failed to get challenge')
      }

      const { challenge } = await challengeResponse.json()

      // Create transaction for signing
      const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.manageData({
          name: 'DOB_VALIDATOR_AUTH',
          value: challenge,
        }))
        .setTimeout(30)
        .build()

      // Get XDR for signing
      const xdr = tx.toXDR()

      // Open Simple Signer
      const signerUrl = `https://sign.stellar.expert/#xdr=${encodeURIComponent(xdr)}`
      window.open(signerUrl, '_blank')

      // Wait for user to sign and provide signature
      const signature = prompt('Please paste the signed transaction XDR:')
      if (!signature) {
        throw new Error('No signature provided')
      }

      await connectWallet()
      
      toast({
        title: 'Wallet Connected',
        description: 'Your Stellar wallet has been connected successfully.',
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect your Stellar wallet. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      disconnectWallet()
      toast({
        title: 'Wallet Disconnected',
        description: 'Your Stellar wallet has been disconnected.',
      })
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect your Stellar wallet. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </span>
          <Button
            variant="outline"
            onClick={handleDisconnect}
            className="text-sm"
          >
            Disconnect Wallet
          </Button>
        </>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="text-sm"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  )
} 