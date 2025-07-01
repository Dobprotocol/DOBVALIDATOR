"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StellarWallet } from '@/components/stellar-wallet'
import { OptimizedSpline } from '@/components/ui/optimized-spline'
import { isAuthenticated, getAuthToken } from '@/lib/auth'
import { apiService } from '@/lib/api-service'
import { walletStateManager } from '@/lib/wallet-state'
import { StarsBackground } from '@/components/ui/stars-background'
import { useTheme } from 'next-themes'
import { Header } from '@/components/ui/header'

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
  const { theme } = useTheme()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState(0)
  const [splineLoaded, setSplineLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const hasRedirected = useRef(false)
  const hasCheckedInitial = useRef(false)
  const isCheckingProfile = useRef(false)
  const lastCheckTime = useRef(0)
  const router = useRouter()

  // Mouse movement and scroll effect
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth) * 2 - 1
      const y = (clientY / innerHeight) * 2 - 1
      setMousePosition({ x, y })
    }

    const handleScroll = () => {
      const position = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = Math.min((position / maxScroll) * 100, 100)
      setScrollPosition(scrollPercentage)
      
      // Update Spline scene based on scroll
      const splineViewer = document.querySelector('spline-viewer')
      if (splineViewer) {
        // @ts-ignore - splineRuntimeRef is available on the element
        const runtime = (splineViewer as any).splineRuntimeRef
        if (runtime) {
          runtime.setScrollValue?.(scrollPercentage / 100)
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
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
    <div className="relative w-full" style={{ height: '160vh' }}>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="text-white text-lg font-semibold animate-pulse">Checking authentication...</div>
        </div>
      )}
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      
      {/* Stars Background - Now moves with mouse */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <StarsBackground />
      </div>
      
      {/* Optimized Spline 3D Background - Now fixed */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${-scrollPosition * 0.5}px)`, // Smooth scroll effect
            transition: 'transform 0.3s ease-out',
            width: '100%',
            height: '100%'
          }}
        >
          <OptimizedSpline
            url="https://prod.spline.design/Bfe9XFwx9BFcwE6l/scene.splinecode"
            className="w-full h-full"
            placeholderImage="/images/FLOWCARD + COINS - Clonable@1-1512x869.webp"
            onLoad={() => setSplineLoaded(true)}
            onError={(error) => console.error('Spline failed to load:', error)}
          />
        </div>
      </div>

      {/* Main Content - Fixed Position */}
      <div className="fixed top-0 left-0 right-0 z-10 flex flex-col items-center justify-center h-screen px-4">
        <div className="max-w-2xl mx-auto space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl text-center">
            DOB Validator
          </h1>

          <p className="text-xl text-gray-300 text-center">
            Connect your wallet to begin your device validation
            and get investment-ready on our RWA platform.
          </p>

          <div className="mt-8 flex justify-center">
            <StellarWallet />
          </div>

          <p className="mt-6 text-sm text-gray-400 text-center">
            Submit your documentation and unlock new funding opportunities.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 p-4 text-center transition-colors duration-200"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: theme === 'dark' ? '#fff' : '#000'
        }}
      >
        <p className="text-sm">© 2024 DOB Protocol. All rights reserved.</p>
      </footer>
    </div>
  )
}
