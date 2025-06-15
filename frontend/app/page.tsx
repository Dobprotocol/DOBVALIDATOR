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
      <StellarWallet />
    </main>
  )
}
