"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StellarWallet } from '@/components/stellar-wallet'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUserProfile = async () => {
      const publicKey = localStorage.getItem('stellarPublicKey')
      if (!publicKey) {
        return
      }

      try {
        // Check if user has a profile
        const response = await fetch(`/api/profile?address=${publicKey}`)
        const hasProfile = response.ok

        if (hasProfile) {
          // If user has a profile, redirect to devices dashboard
          router.push('/devices')
        } else {
          // If user doesn't have a profile, redirect to profile creation
          router.push('/profile')
        }
      } catch (error) {
        console.error('Error checking user profile:', error)
        // On error, redirect to profile creation as a fallback
        router.push('/profile')
      }
    }

    // Listen for wallet connection events
    const handleWalletChange = () => {
      checkUserProfile()
    }

    window.addEventListener('walletStateChange', handleWalletChange)
    window.addEventListener('storage', handleWalletChange)
    window.addEventListener('visibilitychange', handleWalletChange)
    window.addEventListener('focus', handleWalletChange)

    // Initial check
    checkUserProfile()

    return () => {
      window.removeEventListener('walletStateChange', handleWalletChange)
      window.removeEventListener('storage', handleWalletChange)
      window.removeEventListener('visibilitychange', handleWalletChange)
      window.removeEventListener('focus', handleWalletChange)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to DOB Validator
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your wallet to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Please connect your wallet to access the validator system
            </p>
            <StellarWallet />
          </div>
        </div>
      </div>
    </div>
  )
}
