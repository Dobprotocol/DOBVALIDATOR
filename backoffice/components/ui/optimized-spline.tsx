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

// Global script loading state
let isScriptLoading = false
let scriptLoadPromise: Promise<void> | null = null

// Load Spline viewer script once
const loadSplineScript = async () => {
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (customElements.get('spline-viewer')) {
      resolve()
      return
    }

    isScriptLoading = true
    const script = document.createElement('script')
    const timestamp = Date.now()
    script.src = `https://unpkg.com/@splinetool/viewer@1.0.37/build/spline-viewer.js?v=${timestamp}`
    script.type = 'module'
    script.async = true

    const loadTimeout = setTimeout(() => {
      reject(new Error('Script load timeout'))
    }, 10000)

    script.onload = () => {
      clearTimeout(loadTimeout)
      isScriptLoading = false
      resolve()
    }

    script.onerror = (error) => {
      clearTimeout(loadTimeout)
      isScriptLoading = false
      scriptLoadPromise = null
      reject(error)
    }

    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

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
  const splineInstanceRef = useRef<SplineViewerElement | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (splineInstanceRef.current) {
      splineInstanceRef.current.remove()
      splineInstanceRef.current = null
    }
  }, [])

  // Create Spline viewer element
  const createSplineViewer = useCallback(() => {
    if (!splineViewerRef.current || !customElements.get('spline-viewer')) {
      return false
    }

    cleanup()

    try {
      const splineViewer = document.createElement('spline-viewer') as SplineViewerElement
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
        splineInstanceRef.current = splineViewer
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
        setHasError(true)
        setIsLoading(false)
        onError?.(error)
      })

      splineViewerRef.current.appendChild(splineViewer)
      return true
    } catch (error) {
      console.error('Error creating Spline viewer:', error)
      setHasError(true)
      setIsLoading(false)
      onError?.(error)
      return false
    }
  }, [url, onLoad, onError, cleanup, placeholderLoaded])

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

    return cleanup
  }, [createSplineViewer, cleanup, onError])

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {showPlaceholder && placeholderImage && (
        <div 
          className="absolute inset-0 z-10 transition-opacity duration-500"
          style={{ opacity: placeholderLoaded ? 1 : 0 }}
        >
          <div className="relative w-full h-full">
            <Image
              src={placeholderImage}
              alt="Loading placeholder"
              fill
              style={{ objectFit: 'cover' }}
              priority
              onLoad={() => {
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