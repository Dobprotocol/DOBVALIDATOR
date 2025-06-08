"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

// Helper function to truncate wallet address
function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function StellarWallet() {
  const [isOpen, setIsOpen] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Load saved public key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('stellarPublicKey')
    if (savedKey) {
      setPublicKey(savedKey)
      console.log('Loaded saved wallet address:', savedKey)
    }
  }, [])

  // Handle messages from Simple Signer
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Reject messages that are not coming from Simple Signer
      if (e.origin !== SIMPLE_SIGNER_URL) {
        return
      }

      const messageEvent = e.data

      if (messageEvent.type === 'onConnect') {
        const publicKey = messageEvent.message.publicKey
        const wallet = messageEvent.message.wallet
        
        console.log('Connected wallet details:', {
          address: publicKey,
          walletType: wallet,
          timestamp: new Date().toISOString()
        })
        
        // Store the public key and wallet type
        localStorage.setItem('stellarPublicKey', publicKey)
        localStorage.setItem('stellarWallet', wallet)
        setPublicKey(publicKey)
        setIsOpen(false)
        setIsConnecting(false)
        toast({
          title: "Connected successfully",
          description: `Connected with ${wallet} wallet`,
        })
      } else if (messageEvent.type === 'onCancel') {
        setIsConnecting(false)
        console.log('Wallet connection cancelled by user')
        toast({
          title: "Connection cancelled",
          description: "Wallet connection was cancelled.",
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [toast])

  const handleConnect = () => {
    setIsConnecting(true)
    console.log('Initiating wallet connection...')
    const connectWindow = window.open(
      `${SIMPLE_SIGNER_URL}/connect`,
      'Connect_Window',
      'width=360, height=450'
    )

    // Configure available wallets
    window.addEventListener('message', (e) => {
      if (
        e.origin === SIMPLE_SIGNER_URL &&
        e.data.type === 'onReady' &&
        e.data.page === 'connect'
      ) {
        console.log('Simple Signer ready, configuring available wallets...')
        connectWindow?.postMessage(
          { wallets: ['freighter', 'xbull', 'albedo'] },
          SIMPLE_SIGNER_URL
        )
      }
    })
  }

  const handleDisconnect = () => {
    console.log('Disconnecting wallet:', publicKey)
    
    // Clear all wallet-related data
    localStorage.removeItem('stellarPublicKey')
    localStorage.removeItem('stellarWallet')
    setPublicKey(null)
    setIsOpen(false)
    
    console.log('Wallet disconnected successfully')
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full"
      >
        {publicKey ? truncateAddress(publicKey) : "Connect Wallet"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              You will be redirected to sign with a Stellar-compatible web3 wallet (Freighter, xBull, or Albedo) to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {publicKey ? (
              <Button
                onClick={handleDisconnect}
                className="w-full"
                variant="destructive"
              >
                Disconnect Wallet
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="w-full"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 