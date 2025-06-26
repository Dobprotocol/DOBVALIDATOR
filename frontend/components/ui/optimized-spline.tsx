"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedSplineProps {
  url: string
  className?: string
  placeholderImage?: string
  onLoad?: () => void
  onError?: (error: any) => void
  loadingDelay?: number
  fallbackContent?: React.ReactNode
}

export function OptimizedSpline({
  url,
  className,
  placeholderImage = '/images/FLOWCARD + COINS - Clonable@1-1512x869.webp',
  onLoad,
  onError,
  loadingDelay = 1000,
  fallbackContent
}: OptimizedSplineProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [splineReady, setSplineReady] = useState(false)
  const splineViewerRef = useRef<HTMLDivElement>(null)
  const splineInstanceRef = useRef<any>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()

  // Function to create the spline-viewer element
  const createSplineViewer = useCallback(() => {
    if (!splineViewerRef.current || !customElements.get('spline-viewer')) {
      return
    }

    const container = splineViewerRef.current
    
    // Clear existing content
    container.innerHTML = ''
    
    try {
      const splineViewer = document.createElement('spline-viewer')
      splineViewer.setAttribute('url', url)
      splineViewer.style.width = '100%'
      splineViewer.style.height = '100%'
      splineViewer.style.border = 'none'
      splineViewer.style.background = 'transparent'
      splineViewer.style.minWidth = '100px'
      splineViewer.style.minHeight = '100px'

      // Add error handling
      splineViewer.addEventListener('error', (error) => {
        console.error('Spline viewer error:', error)
        setHasError(true)
        setIsLoading(false)
        setSplineReady(false)
        onError?.(error)
      })

      // Add load handling
      splineViewer.addEventListener('load', () => {
        setSplineReady(true)
        splineInstanceRef.current = splineViewer
        setIsLoaded(true)
        setIsLoading(false)
        setShowPlaceholder(false)
        onLoad?.()
      })

      container.appendChild(splineViewer)
    } catch (error) {
      console.error('Error creating Spline viewer:', error)
      setHasError(true)
      setIsLoading(false)
      onError?.(error)
    }
  }, [url, onLoad, onError])

  // Load Spline viewer script
  const loadSplineScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="spline-viewer"]')
      
      if (existingScript) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@splinetool/viewer@1.10.13/build/spline-viewer.js'
      script.async = true
      
      script.onload = () => {
        resolve()
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Spline viewer script'))
      }

      document.head.appendChild(script)
    })
  }, [])

  // Initialize Spline
  useEffect(() => {
    let mounted = true

    const initializeSpline = async () => {
      try {
        await loadSplineScript()
        
        if (!mounted) return

        // Add a small delay to ensure script is fully loaded
        setTimeout(() => {
          if (mounted) {
            createSplineViewer()
          }
        }, 100)
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

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Placeholder Image */}
      {showPlaceholder && (
        <div className="absolute inset-0 transition-opacity duration-500">
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

      {/* Spline Container */}
      <div 
        ref={splineViewerRef}
        className={cn(
          'w-full h-full transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
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