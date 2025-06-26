"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StellarWallet } from '@/components/stellar-wallet'
import { OptimizedSpline } from '@/components/ui/optimized-spline'
import { isAuthenticated, getAuthToken } from '@/lib/auth'
import { apiService } from '@/lib/api-service'
import { walletStateManager } from '@/lib/wallet-state'

function clearAllLocalStorage() {
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
    window.dispatchEvent(new Event('walletStateChange'))
  }
}

function isValidJWT(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    return payload.exp > currentTime
  } catch {
    return false
  }
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [splineLoaded, setSplineLoaded] = useState(false)
  const hasRedirected = useRef(false)
  const hasCheckedInitial = useRef(false)
  const isCheckingProfile = useRef(false)
  const lastCheckTime = useRef(0)
  const router = useRouter()

  // Mouse movement effect
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window
      
      // Normalize mouse position to -1 to 1 range
      const x = (clientX / innerWidth) * 2 - 1
      const y = (clientY / innerHeight) * 2 - 1
      
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const checkUserProfile = async () => {
      // Prevent multiple simultaneous profile checks
      if (isCheckingProfile.current) {
        return
      }

      // Prevent redirects if we've already redirected
      if (hasRedirected.current) {
        return
      }

      // Prevent too frequent checks (debounce)
      const now = Date.now()
      if (now - lastCheckTime.current < 2000) { // 2 second debounce
        return
      }
      lastCheckTime.current = now

      // Check if user is authenticated
      if (!isAuthenticated()) {
        return
      }

      const authData = getAuthToken()
      if (!authData?.token) {
        return
      }

      // Validate JWT token structure and expiration
      if (!isValidJWT(authData.token)) {
        clearAllLocalStorage()
        return
      }

      isCheckingProfile.current = true

      try {
        // Use the backend API service to check profile
        const response = await apiService.getProfile()

        // If user has a profile, redirect to dashboard
        hasRedirected.current = true
        window.location.href = '/dashboard'
      } catch (error: any) {
        if (error.message?.includes('404') || error.message?.includes('Profile not found')) {
          // If user doesn't have a profile, redirect to profile creation
          hasRedirected.current = true
          window.location.href = '/profile'
        } else if (error.message?.includes('401') || error.message?.includes('Authentication')) {
          // Token is invalid, clear it
          clearAllLocalStorage()
        } else {
          console.error('Error checking user profile:', error)
          // Don't redirect on error, just stay on home page
        }
      } finally {
        isCheckingProfile.current = false
      }
    }

    // Listen for wallet state changes
    const handleWalletChange = () => {
      // Reset redirect flag when wallet state changes
      hasRedirected.current = false
      // Only check profile if user is authenticated
      if (isAuthenticated()) {
        checkUserProfile()
      } else {
        // Clear any existing redirect flags when not authenticated
        hasRedirected.current = false
      }
    }

    // Subscribe to wallet state changes
    const unsubscribe = walletStateManager.subscribe((state) => {
      if (state.isAuthenticated && isAuthenticated()) {
        // Reset redirect flag when wallet authenticates
        hasRedirected.current = false
        checkUserProfile()
      } else {
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
  }, [router])

  return (
    <div className="relative w-full">
      {/* Optimized Spline 3D Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 spline-background parallax-bg"
          style={{
            transform: `scale(1.2) translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <OptimizedSpline
            url="https://prod.spline.design/Bfe9XFwx9BFcwE6l/scene.splinecode"
            className="w-full h-full"
            placeholderImage="/images/FLOWCARD + COINS - Clonable@1-1512x869.webp"
            onLoad={() => setSplineLoaded(true)}
            onError={(error) => console.error('Spline failed to load:', error)}
            loadingDelay={500}
            fallbackContent={
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">3D Background Unavailable</div>
                  <div className="text-xs mt-1">The page will work normally</div>
                </div>
              </div>
            }
          />
        </div>
      </div>
      
      {/* Main content container */}
      <div className="relative z-10 w-full">
        {/* Hero section - fixed and centered, but not covering footer */}
        <section className="fixed top-0 left-0 right-0 bottom-16 flex flex-col items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="spline-content rounded-2xl p-8">
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-foreground sm:text-5xl">
                DOB Validator
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Connect your wallet to begin your device validation and get investment-ready on our RWA platform.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="w-full flex justify-center">
                  <div className="w-auto">
                    <div className="inline-block">
                      <div className="[&>button]:text-lg [&>button]:py-4 [&>button]:px-10 [&>button]:rounded-xl [&>button]:font-semibold [&>button]:shadow-lg [&>button]:text-black [&>button]:dark:text-foreground [&>button]:border-2 [&>button]:border-black [&>button]:dark:border-foreground pointer-events-auto">
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
        </section>
      </div>
    </div>
  )
}
