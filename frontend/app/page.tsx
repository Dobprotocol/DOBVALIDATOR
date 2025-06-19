"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StellarWallet } from '@/components/stellar-wallet'
import { isAuthenticated, getAuthToken } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUserProfile = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('User not authenticated, staying on home page')
        return
      }

      const token = getAuthToken()?.token
      if (!token) {
        console.log('No JWT token available, staying on home page')
        return
      }

      try {
        console.log('Checking user profile with token...')
        // Use authenticated request to check profile
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Profile check response status:', response.status)

        if (response.ok) {
          // If user has a profile, redirect to devices dashboard
          console.log('User has profile, redirecting to dashboard')
          router.push('/dashboard')
        } else if (response.status === 404) {
          // If user doesn't have a profile, redirect to profile creation
          console.log('User has no profile, redirecting to profile creation')
          router.push('/profile')
        } else {
          console.error('Unexpected response status:', response.status)
          // Don't throw error, just stay on home page
          return
        }
      } catch (error) {
        console.error('Error checking user profile:', error)
        // Don't redirect on error, just stay on home page
        return
      }
    }

    // Listen for wallet connection events
    const handleWalletChange = () => {
      console.log('Wallet state changed, checking profile...')
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          DOB Validator
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Connect your wallet to begin your device validation and get investment-ready on our RWA platform.
        </p>
        <div className="mt-10 flex justify-center">
          <div className="w-full flex justify-center">
            <div className="w-auto">
              <div className="inline-block">
                <div className="[&>button]:text-lg [&>button]:py-4 [&>button]:px-10 [&>button]:rounded-xl [&>button]:font-semibold [&>button]:shadow-lg">
                  <StellarWallet />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-16 text-lg text-muted-foreground">
          Submit your documentation and unlock new funding opportunities.
        </p>
      </div>
    </div>
  )
}
