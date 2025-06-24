"use client"

import { useEffect, useRef, useState } from 'react'
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [lastScrollEvent, setLastScrollEvent] = useState('')
  const [splineReady, setSplineReady] = useState(false)
  const splineViewerRef = useRef<any>(null)

  // Function to create the spline-viewer element
  const createSplineViewer = () => {
    if (splineViewerRef.current && customElements.get('spline-viewer')) {
      const container = splineViewerRef.current
      container.innerHTML = ''
      
      // Ensure container has proper dimensions
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.minWidth = '100px'
      container.style.minHeight = '100px'
      
      const splineViewer = document.createElement('spline-viewer')
      splineViewer.setAttribute('url', 'https://prod.spline.design/Bfe9XFwx9BFcwE6l/scene.splinecode')
      splineViewer.style.width = '100%'
      splineViewer.style.height = '100%'
      splineViewer.style.border = 'none'
      splineViewer.style.background = 'transparent'
      splineViewer.style.minWidth = '100px'
      splineViewer.style.minHeight = '100px'
      
      // Add error handling
      splineViewer.addEventListener('error', (error) => {
        console.error('Spline viewer error:', error)
        setSplineReady(false)
      })
      
      // Add load event listener
      splineViewer.addEventListener('load', () => {
        setSplineReady(true)
        splineViewerRef.current = splineViewer
      })
      
      // Add the element to the container
      container.appendChild(splineViewer)
      
    } else {
      setTimeout(createSplineViewer, 1000)
    }
  }

  // Add Spline viewer script to head
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="spline-viewer"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = 'https://unpkg.com/@splinetool/viewer@1.10.13/build/spline-viewer.js'
        script.async = true
        script.onload = () => {
          createSplineViewer()
        }
        script.onerror = () => {
          console.error('Failed to load Spline viewer script')
        }
        document.head.appendChild(script)
      } else {
        setTimeout(createSplineViewer, 1000)
      }
    }
  }, [])

  // Check page dimensions on load
  useEffect(() => {
    const forceDocumentHeight = () => {
      const bodyHeight = document.body.scrollHeight
      const windowHeight = window.innerHeight
      
      if (bodyHeight > windowHeight) {
        // Force the document element to have the proper height
        document.documentElement.style.height = `${bodyHeight}px`
        document.documentElement.style.minHeight = `${bodyHeight}px`
      }
    }
    
    // Force height after content loads
    setTimeout(forceDocumentHeight, 500)
    setTimeout(forceDocumentHeight, 2000)
  }, [])

  // Helper function to safely trigger Spline events
  const triggerSplineEvent = (eventName: string, data: any) => {
    if (splineReady && splineViewerRef.current) {
      try {
        // Try to use the _spline instance if available
        if (splineViewerRef.current._spline) {
          const splineInstance = splineViewerRef.current._spline
          
          // Try _onScroll for scroll events
          if (eventName === 'scroll' && typeof splineInstance._onScroll === 'function') {
            const scrollValue = data.value || data.scrollY || data.progress || 0
            splineInstance._onScroll(scrollValue)
          }
          
          // Try animation controls if available
          if (splineInstance._animationControls) {
            if (typeof splineInstance._animationControls.setScrollProgress === 'function') {
              splineInstance._animationControls.setScrollProgress(data.value || 0)
            }
            
            if (typeof splineInstance._animationControls.trigger === 'function') {
              splineInstance._animationControls.trigger('scroll', data)
            }
          }
          
          // Try requestRender for any event
          if (typeof splineInstance.requestRender === 'function') {
            splineInstance.requestRender()
          }
        }
        
        // Try using the onInteract method
        if (typeof splineViewerRef.current.onInteract === 'function') {
          const eventNames = [eventName, 'scroll', 'scrollProgress', 'scrollY', 'onScroll']
          
          for (const name of eventNames) {
            try {
              splineViewerRef.current.onInteract(name, data)
              return true
            } catch (e) {
              // Continue to next event name
            }
          }
        }
        
        return false
      } catch (error) {
        console.error(`Error triggering Spline event ${eventName}:`, error)
        return false
      }
    }
    return false
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window
      
      // Normalize mouse position to -1 to 1 range
      const x = (clientX / innerWidth) * 2 - 1
      const y = (clientY / innerHeight) * 2 - 1
      
      setMousePosition({ x, y })
    }

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const newProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
      
      setScrollProgress(newProgress)
      setLastScrollEvent(`Wheel Scroll: ${(newProgress * 100).toFixed(1)}%`)
      
      // Send scroll event to Spline
      if (splineReady) {
        triggerSplineEvent('scroll', {
          value: newProgress,
          scrollY: scrollTop,
          scrollHeight: scrollHeight
        })
      }
    }

    const handlePageScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const newProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
      
      setScrollProgress(newProgress)
      setLastScrollEvent(`Page Scroll: ${(newProgress * 100).toFixed(1)}%`)
      
      // Send scroll event to Spline
      if (splineReady) {
        triggerSplineEvent('scroll', {
          value: newProgress,
          scrollY: scrollTop,
          scrollHeight: scrollHeight
        })
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const newProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
        
        setScrollProgress(newProgress)
        setLastScrollEvent(`Key Scroll: ${(newProgress * 100).toFixed(1)}%`)
        
        // Send scroll event to Spline
        if (splineReady) {
          triggerSplineEvent('scroll', {
            value: newProgress,
            scrollY: scrollTop,
            scrollHeight: scrollHeight
          })
        }
      }
    }

    // Add a more robust scroll handler that works with all scroll methods
    const handleAllScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const newProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
      
      setScrollProgress(newProgress)
      setLastScrollEvent(`All Scroll: ${(newProgress * 100).toFixed(1)}%`)
      
      // Only send events if Spline is ready
      if (splineReady) {
        triggerSplineEvent('scroll', {
          value: newProgress,
          scrollY: scrollTop,
          scrollHeight: scrollHeight
        })
      }
    }

    // Listen for messages from Spline
    const handleMessage = (event: MessageEvent) => {
      // Handle any messages from Spline if needed
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('wheel', handleScroll)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handlePageScroll)
    window.addEventListener('message', handleMessage)
    
    // Add additional scroll listeners for better coverage
    document.addEventListener('scroll', handleAllScroll)
    window.addEventListener('scroll', handleAllScroll)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('wheel', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handlePageScroll)
      window.removeEventListener('message', handleMessage)
      document.removeEventListener('scroll', handleAllScroll)
      window.removeEventListener('scroll', handleAllScroll)
    }
  }, [scrollProgress])

  // Effect to handle scroll events when Spline becomes ready
  useEffect(() => {
    if (splineReady) {
      // Test the current scroll position when Spline becomes ready
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
      
      if (currentProgress > 0) {
        triggerSplineEvent('scroll', {
          value: currentProgress,
          scrollY: scrollTop,
          scrollHeight: scrollHeight
        })
      }
    }
  }, [splineReady])

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
        // Use authenticated request to check profile
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        })

        if (response.ok) {
          // If user has a profile, redirect to mockup dashboard for development
          hasRedirected.current = true
          window.location.href = '/mockup-dashboard'
        } else if (response.status === 404) {
          // If user doesn't have a profile, redirect to profile creation
          hasRedirected.current = true
          window.location.href = '/profile'
        } else if (response.status === 401) {
          // Token is invalid, clear it
          clearAllLocalStorage()
        } else if (response.status === 500) {
          // Server error, likely invalid token on server side
          clearAllLocalStorage()
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
  }, [router]) // Add router back as dependency since we're using it

  return (
    <div className="relative w-full">
      {/* Spline 3D Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 spline-background parallax-bg"
          style={{
            transform: `scale(1.2) translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div 
            ref={splineViewerRef}
            id="spline-viewer-container"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent'
            }}
          >
            {/* Fallback content if Spline fails to load */}
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-sm">Loading 3D Background...</div>
                <div className="text-xs mt-1">If this doesn't load, the page will still work normally</div>
              </div>
            </div>
          </div>
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
