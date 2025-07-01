"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { useWallet } from '../hooks/useWallet'
import { useToast } from './ui/use-toast'

export function StellarWallet() {
  const { address, isConnected, isAuthenticating, connectWallet, disconnectWallet } = useWallet()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setError(null)
      await connectWallet()
      
      toast({
        title: 'Wallet Connected',
        description: 'Your Stellar wallet has been connected successfully.',
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setError(errorMessage)
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = () => {
    try {
      disconnectWallet()
      setError(null)
      
      toast({
        title: 'Wallet Disconnected',
        description: 'Your Stellar wallet has been disconnected.',
      })
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect wallet'
      setError(errorMessage)
      
      toast({
        title: 'Disconnection Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {isConnected ? (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            Connected: {address}
          </div>
          <Button 
            onClick={handleDisconnect}
            variant="outline"
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleConnect}
          disabled={isAuthenticating}
          className="w-full"
        >
          {isAuthenticating ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  )
} 