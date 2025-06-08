"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useStellar } from "@/lib/hooks/use-stellar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

declare global {
  interface Window {
    freighterApi?: {
      isConnected: () => Promise<boolean>
      getPublicKey: () => Promise<string>
      disconnect: () => Promise<void>
    }
  }
}

export function StellarWallet() {
  const { toast } = useToast()
  const { StellarSdk, isInitialized } = useStellar()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectWindow, setConnectWindow] = useState<Window | null>(null)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const storedKey = localStorage.getItem('stellarPublicKey')
    if (storedKey) {
      setPublicKey(storedKey)
    }
  }, [])

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== SIMPLE_SIGNER_URL) return

      const eventMessage = e.data
      console.log('Message from simple signer received:', eventMessage)

      switch (eventMessage.type) {
        case 'onReady':
          if (eventMessage.page === 'connect') {
            console.log('Connect page is ready')
          }
          break

        case 'onConnect':
          const newPublicKey = eventMessage.message.publicKey
          try {
            // Validate the public key
            StellarSdk.Keypair.fromPublicKey(newPublicKey)
            localStorage.setItem('stellarPublicKey', newPublicKey)
            setPublicKey(newPublicKey)
            setIsConnecting(false)
            toast({
              title: "Wallet Connected",
              description: "Your wallet has been connected successfully.",
            })
          } catch (error) {
            console.error('Invalid public key received:', error)
            toast({
              title: "Connection Failed",
              description: "Invalid public key received.",
              variant: "destructive",
            })
          }
          break

        case 'onCancel':
          setIsConnecting(false)
          toast({
            title: "Connection Cancelled",
            description: "Wallet connection was cancelled.",
          })
          break

        case 'onLogOut':
          handleDisconnect()
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [StellarSdk, toast])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      setIsError(false)

      // Check if Freighter is installed
      if (window.freighterApi) {
        try {
          const isConnected = await window.freighterApi.isConnected()
          if (isConnected) {
            const newPublicKey = await window.freighterApi.getPublicKey()
            localStorage.setItem('stellarPublicKey', newPublicKey)
            setPublicKey(newPublicKey)
            toast({
              title: "Wallet Connected",
              description: "Your wallet has been connected successfully.",
            })
            return
          }
        } catch (error) {
          console.error('Freighter connection failed:', error)
        }
      }

      // If Freighter is not available or connection failed, use Simple Stellar Signer
      const signerWindow = window.open(`${SIMPLE_SIGNER_URL}/connect`, 'Connect_Window', 'width=360, height=450')
      setConnectWindow(signerWindow)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setIsError(true)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (window.freighterApi) {
        await window.freighterApi.disconnect()
      } else {
        const logoutWindow = window.open(`${SIMPLE_SIGNER_URL}/logout`, 'Logout_Window', 'width=100, height=100')
        if (logoutWindow) {
          logoutWindow.addEventListener('message', (e) => {
            if (e.origin === SIMPLE_SIGNER_URL && e.data.type === 'onLogOut') {
              logoutWindow.postMessage({ type: 'logout' }, SIMPLE_SIGNER_URL)
              localStorage.removeItem('stellarPublicKey')
              setPublicKey(null)
              toast({
                title: "Wallet Disconnected",
                description: "Your wallet has been disconnected.",
              })
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      })
    }
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
            disabled={isError}
          >
            {isError ? "Connection Failed" : "Connect Wallet"}
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
              <p className="text-muted-foreground">Please complete the connection in the popup window...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 