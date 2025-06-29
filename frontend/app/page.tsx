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
    <div className="relative w-full">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="text-white text-lg font-semibold animate-pulse">Checking authentication...</div>
        </div>
      )}
      {/* Optimized Spline 3D Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: 'scale(1.2)',
            transformOrigin: 'top center',
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
                  <div className="text-xs mt-1">The page will work normally</div>
                </div>
              </div>
            }
          />
        </div>
        
        {/* Parallax overlay for mouse movement effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>
      
      {/* Main content container - 150vh for full Spline scene scrolling (desktop only) */}
      <div className="relative z-10 w-full h-screen md:h-[150vh]">
        {/* Hero section - fixed content that stays in place while scrolling */}
        <section className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-4 z-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="spline-content rounded-2xl p-8">
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-foreground sm:text-5xl">
                DOB Validator
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Connect your wallet to begin your device validation <br></br>and get investment-ready on our RWA platform.
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
        
        {/* Spacer section to create the full 150vh scroll space (desktop only) */}
        <section className="hidden md:flex h-screen items-center justify-center">
          <div className="text-center opacity-0 pointer-events-none">
            {/* This section is invisible but creates scroll space on desktop */}
          </div>
        </section>
      </div>
    </div>
  )
}
