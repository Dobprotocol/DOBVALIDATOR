"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { useWallet } from '../hooks/useWallet'
import { useToast } from './ui/use-toast'

export function StellarWallet() {
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWallet()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      // TODO: Implement actual wallet connection
      // This is a placeholder for the actual implementation
      const address = 'MOCK_ADDRESS' // Replace with actual wallet connection
      await connectWallet(address)
      
      toast({
        title: 'Wallet Connected',
        description: 'Your Stellar wallet has been connected successfully.',
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect your Stellar wallet. Please try again.',
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
          <span className="text-sm text-gray-600">
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