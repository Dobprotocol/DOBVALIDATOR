"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StellarWallet } from '@/components/stellar-wallet'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const checkAndRedirect = () => {
      const wallet = typeof window !== 'undefined' ? localStorage.getItem('stellarWallet') : null
      if (wallet) {
        router.replace('/form')
      }
    }
    checkAndRedirect()
    window.addEventListener('walletStateChange', checkAndRedirect)
    window.addEventListener('storage', checkAndRedirect)
    window.addEventListener('visibilitychange', checkAndRedirect)
    window.addEventListener('focus', checkAndRedirect)
    return () => {
      window.removeEventListener('walletStateChange', checkAndRedirect)
      window.removeEventListener('storage', checkAndRedirect)
      window.removeEventListener('visibilitychange', checkAndRedirect)
      window.removeEventListener('focus', checkAndRedirect)
    }
  }, [router])
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-2">DOB Validator</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Connect your wallet to begin your device validation and get investment-ready on our RWA platform.
      </p>
      <StellarWallet />
      <p className="text-gray-500 text-xs mt-4 text-center max-w-xs">
        Submit your documentation and unlock new funding opportunities.
      </p>
    </main>
  )
}
