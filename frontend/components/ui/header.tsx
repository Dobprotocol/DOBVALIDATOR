"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function WalletStatus() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const updateWallet = () => {
      const key = localStorage.getItem('stellarPublicKey')
      setPublicKey(key)
    }
    updateWallet()
    window.addEventListener('walletStateChange', updateWallet)
    window.addEventListener('storage', updateWallet)
    window.addEventListener('visibilitychange', updateWallet)
    window.addEventListener('focus', updateWallet)
    return () => {
      window.removeEventListener('walletStateChange', updateWallet)
      window.removeEventListener('storage', updateWallet)
      window.removeEventListener('visibilitychange', updateWallet)
      window.removeEventListener('focus', updateWallet)
    }
  }, [])

  const handleDisconnect = () => {
    localStorage.removeItem('stellarPublicKey')
    localStorage.removeItem('stellarWallet')
    window.dispatchEvent(new Event('walletStateChange'))
    setPublicKey(null)
    router.push('/')
  }

  if (!publicKey) return null
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 px-3 py-1 text-sm"
      onClick={handleDisconnect}
      title="Disconnect wallet"
    >
      {truncateAddress(publicKey)}
      <LogOut size={16} className="ml-1" />
    </Button>
  )
}

export function Header() {
  const [walletConnected, setWalletConnected] = useState(false)

  useEffect(() => {
    const updateWallet = () => {
      setWalletConnected(!!localStorage.getItem('stellarWallet'))
    }
    updateWallet()
    window.addEventListener('walletStateChange', updateWallet)
    window.addEventListener('storage', updateWallet)
    window.addEventListener('visibilitychange', updateWallet)
    window.addEventListener('focus', updateWallet)
    return () => {
      window.removeEventListener('walletStateChange', updateWallet)
      window.removeEventListener('storage', updateWallet)
      window.removeEventListener('visibilitychange', updateWallet)
      window.removeEventListener('focus', updateWallet)
    }
  }, [])

  // Show wallet status in navbar whenever wallet is connected
  const showWallet = walletConnected
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 bg-gray-50 border-b">
      <div className="flex items-center">
        <Image
          src="/images/dob-logo.png"
          alt="DOB Protocol"
          width={120}
          height={40}
          className="h-8 w-auto"
          priority
        />
      </div>
      <div className="flex items-center justify-end">
        {showWallet && <WalletStatus />}
      </div>
    </header>
  )
}
