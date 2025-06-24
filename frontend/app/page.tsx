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
  console.log('🧹 Cleared all localStorage data')
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
      console.log('Creating spline-viewer element...')
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
      
      console.log('Spline viewer element created, adding event listeners...')
      
      // Add error handling
      splineViewer.addEventListener('error', (error) => {
        console.error('Spline viewer error:', error)
        setSplineReady(false)
      })
      
      // Add load event listener
      splineViewer.addEventListener('load', () => {
        console.log('🎉 Spline viewer load event fired!')
        setSplineReady(true)
        
        // Test access after a short delay to ensure Spline is initialized
        setTimeout(() => {
          console.log('Testing Spline viewer after load...')
          console.log('Spline viewer element:', splineViewer)
          console.log('Spline viewer properties:', Object.getOwnPropertyNames(splineViewer))
          
          if (splineViewer && typeof splineViewer.triggerEvent === 'function') {
            console.log('✅ Spline viewer ready with triggerEvent method')
            // Update the ref to point to the actual spline-viewer element
            splineViewerRef.current = splineViewer
            testSplineAccess()
          } else {
            console.log('⚠️ Spline viewer loaded but triggerEvent method not available')
            console.log('Available methods:', Object.getOwnPropertyNames(splineViewer))
            splineViewerRef.current = splineViewer
            testSplineAccess() // Still test to see what's available
          }
        }, 2000)
      })
      
      // Add the element to the container
      container.appendChild(splineViewer)
      console.log('Spline viewer element added to container')
      
      // Also try to trigger load manually after a delay
      setTimeout(() => {
        if (!splineReady) {
          console.log('Manual load check - trying to trigger load event...')
          const loadEvent = new Event('load')
          splineViewer.dispatchEvent(loadEvent)
        }
      }, 5000)
      
    } else {
      console.log('Container or custom element not ready, retrying...')
      console.log('Container exists:', !!splineViewerRef.current)
      console.log('Custom element defined:', !!customElements.get('spline-viewer'))
      setTimeout(createSplineViewer, 1000)
    }
  }

  // Add Spline viewer script to head
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="spline-viewer"]')
      if (!existingScript) {
        console.log('Loading Spline viewer script...')
        const script = document.createElement('script')
        script.type = 'module'
        script.src = 'https://unpkg.com/@splinetool/viewer@1.10.13/build/spline-viewer.js'
        script.async = true
        script.onload = () => {
          console.log('Spline viewer script loaded successfully')
          // Create the spline-viewer element after script loads
          createSplineViewer()
        }
        script.onerror = () => {
          console.error('Failed to load Spline viewer script')
        }
        document.head.appendChild(script)
      } else {
        console.log('Spline viewer script already exists')
        // Script already exists, try to create the viewer
        setTimeout(createSplineViewer, 1000)
      }
    }
  }, [])

  // Check page dimensions on load
  useEffect(() => {
    const checkPageDimensions = () => {
      console.log('📏 Page dimensions check:')
      console.log('Document height:', document.documentElement.scrollHeight)
      console.log('Window height:', window.innerHeight)
      console.log('Body height:', document.body.scrollHeight)
      console.log('Scrollable height:', document.documentElement.scrollHeight - window.innerHeight)
      console.log('Is scrollable:', document.documentElement.scrollHeight > window.innerHeight)
    }
    
    // Check immediately
    checkPageDimensions()
    
    // Check after a delay to ensure content is rendered
    setTimeout(checkPageDimensions, 1000)
    setTimeout(checkPageDimensions, 3000)
    
    // Force document element to reflect content height
    const forceDocumentHeight = () => {
      const bodyHeight = document.body.scrollHeight
      const windowHeight = window.innerHeight
      
      if (bodyHeight > windowHeight) {
        // Force the document element to have the proper height
        document.documentElement.style.height = `${bodyHeight}px`
        document.documentElement.style.minHeight = `${bodyHeight}px`
        console.log('🔧 Forced document height to:', bodyHeight)
      }
    }
    
    // Force height after content loads
    setTimeout(forceDocumentHeight, 500)
    setTimeout(forceDocumentHeight, 2000)
  }, [])

  // Test function to check Spline accessibility
  const testSplineAccess = () => {
    if (splineViewerRef.current) {
      try {
        console.log('Testing Spline viewer with available methods...')
        
        // Check if the Spline viewer has the _spline property (the actual Spline instance)
        if (splineViewerRef.current._spline) {
          console.log('✅ Found _spline instance:', splineViewerRef.current._spline)
          
          // Try to access the Spline instance methods
          const splineInstance = splineViewerRef.current._spline
          console.log('Spline instance methods:', Object.getOwnPropertyNames(splineInstance))
          
          // Try to trigger scroll using _onScroll method
          if (typeof splineInstance._onScroll === 'function') {
            splineInstance._onScroll(0.5) // Test with 50% scroll
            console.log('✅ Sent scroll event via _spline._onScroll')
          } else {
            console.log('⚠️ _spline._onScroll not available')
          }
          
          // Try to use the event manager
          if (splineInstance._eventManager) {
            console.log('✅ Found _eventManager:', splineInstance._eventManager)
            console.log('Event manager methods:', Object.getOwnPropertyNames(splineInstance._eventManager))
            
            // Try trigger method
            if (typeof splineInstance._eventManager.trigger === 'function') {
              splineInstance._eventManager.trigger('scroll', { value: 0.5 })
              console.log('✅ Sent scroll event via _eventManager.trigger')
            }
            
            // Try emit method
            if (typeof splineInstance._eventManager.emit === 'function') {
              splineInstance._eventManager.emit('scroll', { value: 0.5 })
              console.log('✅ Sent scroll event via _eventManager.emit')
            }
            
            // Note: publish method is not available based on test results
            console.log('ℹ️ publish method not available on _eventManager')
          }
          
          // Try animation controls if available
          if (splineInstance._animationControls) {
            console.log('✅ Found _animationControls:', splineInstance._animationControls)
            console.log('Animation controls methods:', Object.getOwnPropertyNames(splineInstance._animationControls))
            
            try {
              if (typeof splineInstance._animationControls.setScrollProgress === 'function') {
                splineInstance._animationControls.setScrollProgress(0.5)
                console.log('✅ Sent scroll via _animationControls.setScrollProgress')
              }
              
              if (typeof splineInstance._animationControls.trigger === 'function') {
                splineInstance._animationControls.trigger('scroll', { value: 0.5 })
                console.log('✅ Sent scroll via _animationControls.trigger')
              }
              
              if (typeof splineInstance._animationControls.play === 'function') {
                splineInstance._animationControls.play()
                console.log('✅ Triggered animation play')
              }
            } catch (e) {
              console.log('❌ Error with animation controls:', e)
            }
          }
          
          // Try to trigger render to see if that helps
          if (typeof splineInstance.requestRender === 'function') {
            splineInstance.requestRender()
            console.log('✅ Requested render')
          }
          
        } else {
          console.log('⚠️ _spline instance not available')
        }
        
        // Try using the onLoaded callback
        if (typeof splineViewerRef.current.onLoaded === 'function') {
          console.log('✅ onLoaded method available')
        }
        
        // Try using the onInteract callback
        if (typeof splineViewerRef.current.onInteract === 'function') {
          console.log('✅ onInteract method available')
          // Test onInteract with different event names
          const testEvents = ['scroll', 'scrollProgress', 'scrollY']
          for (const eventName of testEvents) {
            try {
              splineViewerRef.current.onInteract(eventName, { value: 0.5 })
              console.log(`✅ Tested onInteract with ${eventName}`)
            } catch (e) {
              console.log(`❌ onInteract failed for ${eventName}:`, e)
            }
          }
        }
        
      } catch (error) {
        console.log('Error testing Spline viewer:', error)
      }
    } else {
      console.log('Spline viewer ref is null')
    }
  }

  // Helper function to safely trigger Spline events
  const triggerSplineEvent = (eventName: string, data: any) => {
    if (splineReady && splineViewerRef.current) {
      try {
        // Try to use the _spline instance if available
        if (splineViewerRef.current._spline) {
          const splineInstance = splineViewerRef.current._spline
          
          // Try _onScroll for scroll events with different data formats
          if (eventName === 'scroll' && typeof splineInstance._onScroll === 'function') {
            // Try different data formats
            const scrollValues = [
              data.value || 0,
              data.scrollY || 0,
              data.progress || 0
            ]
            
            for (const value of scrollValues) {
              try {
                splineInstance._onScroll(value)
                console.log(`✅ Sent scroll via _onScroll: ${value}`)
              } catch (e) {
                // Continue to next value
              }
            }
          }
          
          // Try animation controls if available
          if (splineInstance._animationControls) {
            try {
              if (typeof splineInstance._animationControls.setScrollProgress === 'function') {
                splineInstance._animationControls.setScrollProgress(data.value || 0)
                console.log('✅ Sent scroll via _animationControls.setScrollProgress')
              }
              
              if (typeof splineInstance._animationControls.trigger === 'function') {
                splineInstance._animationControls.trigger('scroll', data)
                console.log('✅ Sent scroll via _animationControls.trigger')
              }
            } catch (e) {
              // Continue to next method
            }
          }
          
          // Try requestRender for any event
          if (typeof splineInstance.requestRender === 'function') {
            splineInstance.requestRender()
            console.log('✅ Requested render')
          }
        }
        
        // Try using the onInteract method (this is working based on test results)
        if (typeof splineViewerRef.current.onInteract === 'function') {
          // Try different event names that might work
          const eventNames = [
            eventName,
            'scroll',
            'scrollProgress',
            'scrollY',
            'onScroll'
          ]
          
          for (const name of eventNames) {
            try {
              splineViewerRef.current.onInteract(name, data)
              console.log(`✅ Sent event via onInteract: ${name}`, data)
            } catch (e) {
              // Continue to next event name
            }
          }
          return true
        }
        
        console.log(`Could not send ${eventName} trigger - no suitable method found`)
        return false
      } catch (error) {
        console.log(`Could not send ${eventName} trigger to Spline scene:`, error)
        return false
      }
    } else {
      if (!splineReady) {
        console.log('Spline viewer not ready yet')
      } else {
        console.log('Spline viewer ready but no suitable trigger method available')
      }
      return false
    }
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
      // Don't prevent default scrolling - let the page scroll normally
      // Just capture the scroll event to trigger Spline animations
      
      // Calculate scroll progress based on actual page scroll
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const newProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
      
      // Debug scroll dimensions
      if (scrollHeight === 0) {
        console.log('⚠️ Scroll height is 0 - page not scrollable')
        console.log('Document height:', document.documentElement.scrollHeight)
        console.log('Window height:', window.innerHeight)
        console.log('Body height:', document.body.scrollHeight)
      }
      
      setScrollProgress(newProgress)
      setLastScrollEvent(`Wheel Scroll: ${(newProgress * 100).toFixed(1)}%`)
      
      // Only send events if Spline is ready
      if (splineReady) {
        // Send scroll trigger to Spline scene
        const eventData = { 
          value: newProgress,
          scrollY: scrollTop,
          scrollHeight: scrollHeight,
          direction: event.deltaY > 0 ? 'down' : 'up'
        }
        
        const success = triggerSplineEvent('scroll', eventData)
        
        console.log('Wheel scroll event captured:', { 
          progress: newProgress, 
          scrollTop, 
          scrollHeight,
          delta: event.deltaY,
          eventSent: success
        })
      } else {
        console.log('Spline viewer not ready yet')
      }
    }

    const handlePageScroll = () => {
      // Capture actual page scroll events (this is the main scroll handler)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const newProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
      
      setScrollProgress(newProgress)
      setLastScrollEvent(`Page Scroll: ${(newProgress * 100).toFixed(1)}%`)
      
      // Only send events if Spline is ready
      if (splineReady) {
        // Send scroll trigger to Spline scene
        const success = triggerSplineEvent('scroll', { 
          value: newProgress,
          scrollY: scrollTop,
          scrollHeight: scrollHeight
        })
        
        console.log('Page scroll captured:', { 
          progress: newProgress, 
          scrollTop, 
          scrollHeight,
          eventSent: success
        })
      } else {
        console.log('Spline viewer not ready yet')
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't prevent default key behavior - let normal scrolling happen
      // Just capture the event to trigger Spline animations
      
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || 
          event.key === 'ArrowUp' || event.key === 'PageUp') {
        
        // Get current scroll position
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const newProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
        
        setScrollProgress(newProgress)
        
        // Only send events if Spline is ready
        if (splineReady) {
          const success = triggerSplineEvent('scroll', {
            value: newProgress,
            scrollY: scrollTop,
            scrollHeight: scrollHeight,
            direction: event.key === 'ArrowDown' || event.key === 'PageDown' ? 'down' : 'up'
          })
          
          console.log('Key scroll captured:', { 
            progress: newProgress, 
            key: event.key,
            eventSent: success
          })
        } else {
          console.log('Spline viewer not ready yet')
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
        const success = triggerSplineEvent('scroll', {
          value: newProgress,
          scrollY: scrollTop,
          scrollHeight: scrollHeight
        })
        
        console.log('All scroll captured:', { 
          progress: newProgress, 
          scrollTop, 
          scrollHeight,
          eventSent: success
        })
      } else {
        console.log('Spline viewer not ready yet')
      }
    }

    // Listen for messages from Spline
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message from Spline:', event.data)
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
      console.log('🎉 Spline viewer is now ready! Testing current scroll position...')
      
      // Test the current scroll position when Spline becomes ready
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0
      
      if (currentProgress > 0) {
        console.log('Sending initial scroll position to Spline:', currentProgress)
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
        {/* Hero section */}
        <section className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl">
            <div className="spline-content rounded-2xl p-8">
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
        </section>
        
        {/* Additional content to make page scrollable */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">About DOB Protocol</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                The DOB Protocol enables real-world asset tokenization and validation through blockchain technology.
                Our platform provides a secure and transparent way to validate physical assets and make them investment-ready.
              </p>
            </div>
            
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect your wallet, submit device documentation, and get your assets validated for investment opportunities.
                Our validation process ensures that your real-world assets meet the highest standards for blockchain investment.
              </p>
            </div>
            
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">Benefits</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Unlock new funding opportunities and increase the value of your real-world assets through blockchain validation.
                Access global investment markets and benefit from increased liquidity and transparency.
              </p>
            </div>
            
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">Get Started</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Ready to validate your assets? Connect your wallet above to begin the process.
                Our team will guide you through every step of the validation process.
              </p>
            </div>
            
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">Technology</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built on cutting-edge blockchain technology, our platform ensures security, transparency, and efficiency.
                We use advanced validation algorithms and secure smart contracts to protect your assets.
              </p>
            </div>
            
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">Security</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Your assets and data are protected by enterprise-grade security measures.
                We implement multi-layer encryption and secure validation protocols to ensure your safety.
              </p>
            </div>
            
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">Additional Content</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                This section ensures the page has enough content to be scrollable.
                The document element should now properly reflect the full content height.
              </p>
            </div>
            
            <div className="spline-content rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-foreground">More Content</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Additional content to make sure the page is definitely scrollable.
                This should fix the scroll height issue we were seeing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
