"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useStellar } from "@/lib/hooks/use-stellar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function StellarWallet() {
  const { toast } = useToast()
  const { StellarSdk, isInitialized } = useStellar()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const storedKey = localStorage.getItem('stellarPublicKey')
    if (storedKey) {
      setPublicKey(storedKey)
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only handle messages from our own origin
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'STELLAR_CONNECTED') {
        if (event.data.error) {
          console.error('Connection error:', event.data.error)
        } else {
          const { publicKey: newPublicKey } = event.data
          localStorage.setItem('stellarPublicKey', newPublicKey)
          setPublicKey(newPublicKey)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const keypair = StellarSdk.Keypair.random()
      const newPublicKey = keypair.publicKey()
      
      localStorage.setItem('stellarPublicKey', newPublicKey)
      setPublicKey(newPublicKey)
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('stellarPublicKey')
    setPublicKey(null)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  if (!isInitialized) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {publicKey ? (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="font-mono text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            {`${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`}
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            className="bg-[#6366F1] hover:bg-[#5355d1] text-white font-medium px-6"
          >
            Connect Wallet
          </Button>
        )}
      </div>

      <Dialog open={isConnecting} onOpenChange={setIsConnecting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connecting to Stellar Wallet</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-muted-foreground">Please wait while we connect to your wallet...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 