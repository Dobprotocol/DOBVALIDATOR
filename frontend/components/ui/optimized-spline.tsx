"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Global flag to prevent multiple script loads
let splineScriptLoaded = false

interface OptimizedSplineProps {
  url: string
  className?: string
  placeholderImage?: string
  onLoad?: () => void
  onError?: (error: any) => void
  loadingDelay?: number
  fallbackContent?: React.ReactNode
  forceRefresh?: boolean
}

export function OptimizedSpline({
  url,
  className,
  placeholderImage = '/images/FLOWCARD + COINS - Clonable@1-1512x869.webp',
  onLoad,
  onError,
  loadingDelay = 500,
  fallbackContent,
  forceRefresh = false
}: OptimizedSplineProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const splineViewerRef = useRef<HTMLDivElement>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()
  const scriptLoadedRef = useRef(false)
  const splineInstanceRef = useRef<any>(null)
  const isInitializedRef = useRef(false)

  // Load Spline viewer script
  const loadSplineScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      console.log('Starting Spline script loading...')
      
      // Check if script is already loaded globally
      if (splineScriptLoaded && customElements.get('spline-viewer')) {
        console.log('Spline script already available globally')
        scriptLoadedRef.current = true
        resolve()
        return
      }

      // Check for existing script tag
      const existingScript = document.querySelector('script[src*="spline-viewer"]')
      if (existingScript && !forceRefresh) {
        console.log('Spline script tag exists, waiting for it to load...')
        // Wait for the existing script to load
        const checkInterval = setInterval(() => {
          console.log('Checking for spline-viewer custom element...')
          if (customElements.get('spline-viewer')) {
            clearInterval(checkInterval)
            splineScriptLoaded = true
            scriptLoadedRef.current = true
            console.log('Spline custom element found from existing script')
            resolve()
          }
        }, 100)
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          console.error('Existing script failed to load within timeout')
          reject(new Error('Existing script failed to load'))
        }, 5000)
        return
      }

      // Remove existing script if force refresh is enabled
      if (forceRefresh && existingScript) {
        console.log('Force refresh enabled, removing existing script...')
        existingScript.remove()
        splineScriptLoaded = false
        scriptLoadedRef.current = false
      }

      // Create and load new script with cache busting
      console.log('Creating new Spline script element...')
      const script = document.createElement('script')
      const timestamp = Date.now()
      script.src = `https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js?v=${timestamp}`
      script.type = 'module'
      script.async = true
      
      const loadTimeout = setTimeout(() => {
        console.error('Script load timeout')
        reject(new Error('Script load timeout'))
      }, 10000)

      script.onload = () => {
        clearTimeout(loadTimeout)
        console.log('Spline script loaded successfully')
        splineScriptLoaded = true
        scriptLoadedRef.current = true
        resolve()
      }
      
      script.onerror = (error) => {
        clearTimeout(loadTimeout)
        console.error('Failed to load Spline viewer script:', error)
        reject(new Error('Failed to load Spline viewer script'))
      }

      console.log('Appending script to document head...')
      document.head.appendChild(script)
    })
  }, [forceRefresh])

  // Create Spline viewer element
  const createSplineViewer = useCallback(() => {
    if (!splineViewerRef.current || isInitializedRef.current) {
      console.log('Spline container not ready or already initialized')
      return false
    }

    if (!customElements.get('spline-viewer')) {
      console.log('Spline viewer custom element not available')
      return false
    }

    const container = splineViewerRef.current
    
    // Clear existing content
    container.innerHTML = ''
    
    try {
      const splineViewer = document.createElement('spline-viewer')
      // Add cache-busting parameter to the URL
      const cacheBustedUrl = forceRefresh ? `${url}?v=${Date.now()}` : url
      splineViewer.setAttribute('url', cacheBustedUrl)
      splineViewer.style.width = '100%'
      splineViewer.style.height = '100%'
      splineViewer.style.border = 'none'
      splineViewer.style.background = 'transparent'
      splineViewer.style.minWidth = '100px'
      splineViewer.style.minHeight = '100px'
      splineViewer.style.position = 'absolute'
      splineViewer.style.top = '0'
      splineViewer.style.left = '0'
      splineViewer.style.zIndex = '0'
      splineViewer.style.pointerEvents = 'auto'
      splineViewer.style.userSelect = 'none'
      splineViewer.style.touchAction = 'manipulation'

      // Prevent the scene from losing focus
      splineViewer.addEventListener('blur', (e) => {
        e.preventDefault()
        splineViewer.focus()
      })

      // Prevent default browser behaviors that might interfere
      splineViewer.addEventListener('contextmenu', (e) => {
        e.preventDefault()
      })

      splineViewer.addEventListener('selectstart', (e) => {
        e.preventDefault()
      })

      // Add error handling
      splineViewer.addEventListener('error', (error) => {
        console.error('Spline viewer error:', error)
        setHasError(true)
        setIsLoading(false)
        onError?.(error)
      })

      // Add load handling
      splineViewer.addEventListener('load', () => {
        console.log('Spline viewer loaded successfully')
        splineInstanceRef.current = splineViewer
        setIsLoaded(true)
        setIsLoading(false)
        
        // Immediate transition for seamless experience
        setShowPlaceholder(false)
        
        onLoad?.()
      })

      // Add a timeout to detect if load event doesn't fire
      const loadTimeout = setTimeout(() => {
        if (!isLoaded && !hasError) {
          console.log('Spline load timeout, forcing load state')
          splineInstanceRef.current = splineViewer
          setIsLoaded(true)
          setIsLoading(false)
          
          // Immediate transition for seamless experience
          setShowPlaceholder(false)
          
          onLoad?.()
        }
      }, 8000) // 8 second timeout

      container.appendChild(splineViewer)
      isInitializedRef.current = true
      
      // Clean up timeout if component unmounts
      return () => clearTimeout(loadTimeout)
    } catch (error) {
      console.error('Error creating Spline viewer:', error)
      setHasError(true)
      setIsLoading(false)
      onError?.(error)
      return false
    }
  }, [url, onLoad, onError, isLoaded, hasError, forceRefresh])

  // Initialize Spline
  useEffect(() => {
    let mounted = true

    const initializeSpline = async () => {
      try {
        console.log('Initializing Spline...')
        await loadSplineScript()
        
        if (!mounted) return

        // Wait for custom elements to be defined
        let attempts = 0
        const maxAttempts = 100 // 10 seconds max
        
        const waitForCustomElement = () => {
          console.log(`Checking for spline-viewer custom element (attempt ${attempts + 1}/${maxAttempts})...`)
          if (customElements.get('spline-viewer')) {
            console.log('Spline custom element ready')
            if (mounted) {
              createSplineViewer()
            }
          } else if (attempts < maxAttempts) {
            attempts++
            setTimeout(waitForCustomElement, 100)
          } else {
            console.error('Spline custom element not available after timeout')
            setHasError(true)
            setIsLoading(false)
            onError?.(new Error('Spline custom element not available'))
          }
        }
        
        waitForCustomElement()
      } catch (error) {
        console.error('Failed to initialize Spline:', error)
        if (mounted) {
          setHasError(true)
          setIsLoading(false)
          onError?.(error)
        }
      }
    }

    // Add loading delay for better UX
    loadingTimeoutRef.current = setTimeout(() => {
      if (mounted) {
        initializeSpline()
      }
    }, loadingDelay)

    return () => {
      mounted = false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [loadSplineScript, createSplineViewer, loadingDelay, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  // Prevent scroll events from affecting the Spline scene
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (splineInstanceRef.current) {
        // Prevent scroll events from bubbling to the Spline scene
        e.stopPropagation()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (splineInstanceRef.current) {
        // Prevent wheel events from affecting the Spline scene
        e.stopPropagation()
      }
    }

    if (splineViewerRef.current) {
      splineViewerRef.current.addEventListener('scroll', handleScroll, { passive: false })
      splineViewerRef.current.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (splineViewerRef.current) {
        splineViewerRef.current.removeEventListener('scroll', handleScroll)
        splineViewerRef.current.removeEventListener('wheel', handleWheel)
      }
    }
  }, [isLoaded])

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {/* Placeholder Image - positioned absolutely to prevent layout shifts */}
      {showPlaceholder && (
        <div className="absolute inset-0 transition-opacity duration-150 ease-in-out z-0">
          <Image
            src={placeholderImage}
            alt="Loading 3D Scene"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>
      )}

      {/* Spline Container - positioned absolutely to prevent layout shifts */}
      <div 
        ref={splineViewerRef}
        className={cn(
          'absolute inset-0 transition-opacity duration-150 ease-in-out',
          isLoaded ? 'opacity-100 z-10' : 'opacity-0 z-0'
        )}
        style={{
          minHeight: '400px'
        }}
      >
        {/* Fallback content */}
        {hasError && (
          <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
            {fallbackContent || (
              <div className="text-center text-muted-foreground">
                <div className="text-sm">3D Scene Unavailable</div>
                <div className="text-xs mt-1">The page will work normally</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 