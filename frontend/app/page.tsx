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
  const [loading, setLoading] = useState(false)
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
      console.log('🔍 Starting profile check...')
      if (isCheckingProfile.current) {
        console.log('⏳ Already checking profile, skipping')
        return
      }
      if (hasRedirected.current) {
        console.log('⏳ Already redirected, skipping')
        return
      }
      const now = Date.now()
      if (now - lastCheckTime.current < 2000) {
        console.log('⏳ Too soon since last check, skipping')
        return
      }
      lastCheckTime.current = now
      if (!isAuthenticated()) {
        console.log('❌ Not authenticated, skipping')
        return
      }
      const authData = getAuthToken()
      if (!authData?.token) {
        console.log('❌ No auth token, skipping')
        return
      }
      if (!isValidJWT(authData.token)) {
        console.log('❌ Invalid JWT, clearing storage')
        clearAllLocalStorage()
        return
      }
      console.log('✅ Authentication valid, checking profile...')
      isCheckingProfile.current = true
      setLoading(true)
      try {
        const response = await apiService.getProfile()
        console.log('✅ Profile found, redirecting to dashboard')
        hasRedirected.current = true
        router.push('/dashboard')
      } catch (error: any) {
        console.log('🔍 Profile check error:', error.message)
        if (error.message?.includes('404') || 
            error.message?.includes('Profile not found') || 
            error.message?.includes('Endpoint not found')) {
          console.log('❌ Profile not found, redirecting to profile creation')
          hasRedirected.current = true
          router.push('/profile')
        } else if (error.message?.includes('401') || error.message?.includes('Authentication')) {
          console.log('❌ Authentication failed, clearing storage')
          clearAllLocalStorage()
        } else {
          console.error('❌ Unexpected error checking user profile:', error)
          // For unexpected errors, still try to redirect to profile creation
          hasRedirected.current = true
          router.push('/profile')
        }
      } finally {
        isCheckingProfile.current = false
        setLoading(false)
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
    <div className="relative w-full min-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="text-white text-lg font-semibold animate-pulse">Checking authentication...</div>
        </div>
      )}
      
      {/* Animated Stars Background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black opacity-70" />
      </div>
      
      {/* Optimized Spline 3D Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `scale(1.2) translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease-out',
            width: '100%',
            height: '100%'
          }}
        >
          <OptimizedSpline
            url="https://prod.spline.design/Bfe9XFwx9BFcwE6l/scene.splinecode"
            className="w-full h-full"
            placeholderImage="/images/FLOWCARD + COINS - Clonable@1-1512x869.webp"
            onLoad={() => {
              console.log('Spline loaded successfully in main page')
              setSplineLoaded(true)
            }}
            onError={(error) => {
              console.error('Spline failed to load in main page:', error)
            }}
            loadingDelay={200}
            forceRefresh={false}
            fallbackContent={
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-sm">3D Background Unavailable</div>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            DOB Validator
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Secure and efficient device validation on the Stellar network
          </p>
        </div>

        <div className="w-full max-w-sm">
          <StellarWallet />
        </div>
      </div>
    </div>
  )
}
