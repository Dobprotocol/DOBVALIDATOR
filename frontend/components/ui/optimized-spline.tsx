"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Add type for Spline Viewer Element
interface SplineViewerElement extends HTMLElement {
  style: CSSStyleDeclaration;
  splineRuntimeRef?: any;
}

interface OptimizedSplineProps {
  url: string
  className?: string
  placeholderImage?: string
  onLoad?: () => void
  onError?: (error: any) => void
  loadingDelay?: number
  fallbackContent?: React.ReactNode
}

// Keep track of active Spline instances
const activeSplineInstances = new Set<SplineViewerElement>()

export function OptimizedSpline({
  url,
  className,
  placeholderImage = '/images/FLOWCARD + COINS - Clonable@1-1512x869.webp',
  onLoad,
  onError,
  loadingDelay = 500,
  fallbackContent
}: OptimizedSplineProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false)
  const splineViewerRef = useRef<HTMLDivElement>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const scriptLoadedRef = useRef(false)
  const splineInstanceRef = useRef<SplineViewerElement | null>(null)
  const isInitializedRef = useRef(false)

  // Cleanup function
  const cleanup = useCallback(() => {
    // Remove from active instances
    if (splineInstanceRef.current) {
      activeSplineInstances.delete(splineInstanceRef.current)
      splineInstanceRef.current = null
    }

    // Clear container
    if (splineViewerRef.current) {
      splineViewerRef.current.innerHTML = ''
    }

    // Reset state
    isInitializedRef.current = false
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
  }, [])

  // Load Spline viewer script
  const loadSplineScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      console.log('Starting Spline script loading...')
      
      // Always remove existing script to ensure fresh load
      const existingScript = document.querySelector('script[src*="spline-viewer"]')
      if (existingScript) {
        console.log('Removing existing Spline script...')
        existingScript.remove()
        scriptLoadedRef.current = false
      }

      // Create and load new script with cache busting
      console.log('Creating new Spline script element...')
      const script = document.createElement('script')
      const timestamp = Date.now()
      script.src = `https://unpkg.com/@splinetool/viewer/build/spline-viewer.js?v=${timestamp}`
      script.type = 'module'
      script.async = true
      
      const loadTimeout = setTimeout(() => {
        console.error('Script load timeout')
        reject(new Error('Script load timeout'))
      }, 10000)

      script.onload = () => {
        clearTimeout(loadTimeout)
        console.log('Spline script loaded successfully')
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
  }, [])

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

    // Clean up any existing instances
    cleanup()
    
    try {
      const splineViewer = document.createElement('spline-viewer') as SplineViewerElement
      // Add cache-busting parameter to the URL
      const timestamp = Date.now()
      const cacheBustedUrl = `${url}${url.includes('?') ? '&' : '?'}v=${timestamp}`
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
      splineViewer.style.opacity = '0'
      splineViewer.style.transition = 'opacity 0.5s ease-in-out'

      // Add load handling
      splineViewer.addEventListener('load', () => {
        console.log('Spline viewer loaded successfully')
        splineInstanceRef.current = splineViewer
        activeSplineInstances.add(splineViewer)
        setIsLoaded(true)
        setIsLoading(false)
        
        // Fade out placeholder and fade in Spline
        if (placeholderLoaded) {
          splineViewer.style.opacity = '1'
          setTimeout(() => {
            setShowPlaceholder(false)
          }, 500)
        }
        
        onLoad?.()
      })

      // Add error handling
      splineViewer.addEventListener('error', (error) => {
        console.error('Spline viewer error:', error)
        setHasError(true)
        setIsLoading(false)
        onError?.(error)
      })

      splineViewerRef.current.appendChild(splineViewer)
      isInitializedRef.current = true
      return true
    } catch (error) {
      console.error('Error creating Spline viewer:', error)
      setHasError(true)
      setIsLoading(false)
      onError?.(error)
      return false
    }
  }, [url, onLoad, onError, cleanup])

  // Initialize Spline
  useEffect(() => {
    const initSpline = async () => {
      try {
        await loadSplineScript()
        createSplineViewer()
      } catch (error) {
        console.error('Failed to initialize Spline:', error)
        setHasError(true)
        setIsLoading(false)
        onError?.(error)
      }
    }

    initSpline()

    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [loadSplineScript, createSplineViewer, cleanup])

  return (
    <div className={cn("relative w-full h-full", className)}>
      {showPlaceholder && placeholderImage && (
        <div 
          className="absolute inset-0 z-10 transition-opacity duration-500"
          style={{ opacity: placeholderLoaded ? 1 : 0 }}
        >
          <Image
            src={placeholderImage}
            alt="Loading placeholder"
            layout="fill"
            objectFit="cover"
            priority
            onLoadingComplete={() => {
              setPlaceholderLoaded(true)
              // If Spline is already loaded, start the transition
              if (isLoaded && splineInstanceRef.current) {
                splineInstanceRef.current.style.opacity = '1'
                setTimeout(() => {
                  setShowPlaceholder(false)
                }, 500)
              }
            }}
          />
        </div>
      )}
      
      <div
        ref={splineViewerRef}
        className="relative w-full h-full"
        style={{ minHeight: '100px' }}
      />

      {hasError && fallbackContent && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {fallbackContent}
        </div>
      )}
    </div>
  )
} 