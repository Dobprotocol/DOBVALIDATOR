"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import StellarSdk from "stellar-sdk"

const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

export function WalletButton() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [connectWindow, setConnectWindow] = useState<Window | null>(null)

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
            setPublicKey(newPublicKey)
            toast.success('Wallet connected successfully')
          } catch (error) {
            toast.error('Invalid public key received')
          }
          break

        case 'onCancel':
          toast.info('Connection cancelled by user')
          break

        case 'onLogOut':
          setPublicKey(null)
          toast.info('Wallet disconnected')
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleConnect = () => {
    const window = open(`${SIMPLE_SIGNER_URL}/connect`, 'Connect_Window', 'width=360, height=450')
    setConnectWindow(window)
  }

  const handleDisconnect = () => {
    const window = open(`${SIMPLE_SIGNER_URL}/logout`, 'Logout_Window', 'width=100, height=100')
    window?.addEventListener('message', (e) => {
      if (e.origin === SIMPLE_SIGNER_URL && e.data.type === 'onLogOut') {
        window.postMessage({ type: 'logout' }, SIMPLE_SIGNER_URL)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {!publicKey ? (
        <Button
          onClick={handleConnect}
          variant="outline"
          className="flex items-center gap-2 rounded-full bg-[#6366F1]/10 border-[#6366F1]/20 text-[#6366F1]"
        >
          <span className="text-sm">Connect Wallet</span>
        </Button>
      ) : (
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="flex items-center gap-2 rounded-full bg-[#6366F1]/10 border-[#6366F1]/20 text-[#6366F1]"
        >
          <span className="text-sm font-mono">
            {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
          </span>
        </Button>
      )}
    </div>
  )
} 