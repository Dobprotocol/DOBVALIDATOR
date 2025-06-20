"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { StellarWallet } from '@/components/stellar-wallet'
import { isAuthenticated, getAuthToken, removeAuthToken } from '@/lib/auth'
import { walletStateManager } from '@/lib/wallet-state'

// Helper function to clear all localStorage data
function clearAllLocalStorage() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('stellarPublicKey')
  localStorage.removeItem('stellarWallet')
  localStorage.removeItem('userProfile')
  console.log('🧹 Cleared all localStorage data')
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllLocalStorage = clearAllLocalStorage
  console.log('🔧 Debug function available: window.clearAllLocalStorage()')
}

// Helper function to validate JWT token structure
function isValidJWT(token: string): boolean {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }
    
    // Decode the payload (second part) to check expiration
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // Check if token is expired
    if (payload.exp && payload.exp < now) {
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

export default function Home() {
  const router = useRouter()
  const isCheckingProfile = useRef(false)
  const lastCheckTime = useRef(0)
  const hasCheckedInitial = useRef(false)
  const hasRedirected = useRef(false)

  useEffect(() => {
    const checkUserProfile = async () => {
      // Prevent multiple simultaneous profile checks
      if (isCheckingProfile.current) {
        console.log('🔒 Profile check already in progress, skipping...')
        return
      }

      // Prevent redirects if we've already redirected
      if (hasRedirected.current) {
        console.log('🔄 Already redirected, skipping profile check...')
        return
      }

      // Prevent too frequent checks (debounce)
      const now = Date.now()
      if (now - lastCheckTime.current < 2000) { // 2 second debounce
        console.log('⏱️ Profile check too frequent, skipping...')
        return
      }
      lastCheckTime.current = now

      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('User not authenticated, staying on home page')
        return
      }

      const authData = getAuthToken()
      if (!authData?.token) {
        console.log('No JWT token available, staying on home page')
        return
      }

      // Validate JWT token structure and expiration
      if (!isValidJWT(authData.token)) {
        console.log('Invalid or expired JWT token, clearing auth data')
        clearAllLocalStorage()
        return
      }

      isCheckingProfile.current = true

      try {
        console.log('Checking user profile with valid token...')
        // Use authenticated request to check profile
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        })

        console.log('Profile check response status:', response.status)

        if (response.ok) {
          // If user has a profile, redirect to mockup dashboard for development
          console.log('User has profile, redirecting to mockup dashboard')
          hasRedirected.current = true
          console.log('🚀 About to redirect to /mockup-dashboard')
          window.location.href = '/mockup-dashboard'
          console.log('✅ Redirect command executed')
        } else if (response.status === 404) {
          // If user doesn't have a profile, redirect to profile creation
          console.log('User has no profile, redirecting to profile creation')
          hasRedirected.current = true
          console.log('🚀 About to redirect to /profile')
          window.location.href = '/profile'
          console.log('✅ Redirect command executed')
        } else if (response.status === 401) {
          // Token is invalid, clear it
          console.log('Token invalid (401), clearing auth data')
          clearAllLocalStorage()
        } else if (response.status === 500) {
          // Server error, likely invalid token on server side
          console.log('Server error (500), clearing auth data')
          clearAllLocalStorage()
        } else {
          console.error('Unexpected response status:', response.status)
          // Don't throw error, just stay on home page
        }
      } catch (error) {
        console.error('Error checking user profile:', error)
        // Don't redirect on error, just stay on home page
      } finally {
        isCheckingProfile.current = false
      }
    }

    // Listen for wallet state changes
    const handleWalletChange = () => {
      console.log('Wallet state changed, checking profile...')
      // Reset redirect flag when wallet state changes
      hasRedirected.current = false
      // Only check profile if user is authenticated
      if (isAuthenticated()) {
        checkUserProfile()
      } else {
        console.log('No authentication, skipping profile check')
        // Clear any existing redirect flags when not authenticated
        hasRedirected.current = false
      }
    }

    // Subscribe to wallet state changes
    const unsubscribe = walletStateManager.subscribe((state) => {
      if (state.isAuthenticated && isAuthenticated()) {
        console.log('Wallet authenticated, checking profile...')
        // Reset redirect flag when wallet authenticates
        hasRedirected.current = false
        checkUserProfile()
      } else {
        console.log('Wallet not authenticated, clearing redirect flags')
        hasRedirected.current = false
      }
    })

    // Only add event listeners if user is authenticated
    if (isAuthenticated()) {
      window.addEventListener('walletStateChange', handleWalletChange)
    }

    // Initial check only if authenticated and not already checked
    if (isAuthenticated() && !hasCheckedInitial.current) {
      hasCheckedInitial.current = true
      // Add a small delay for initial check to prevent race conditions
      setTimeout(() => {
        checkUserProfile()
      }, 100)
    }

    return () => {
      unsubscribe()
      window.removeEventListener('walletStateChange', handleWalletChange)
    }
  }, [router]) // Add router back as dependency since we're using it

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
