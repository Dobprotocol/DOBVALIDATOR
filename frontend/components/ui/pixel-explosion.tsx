"use client"

import { useEffect, useState } from "react"

interface Pixel {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  opacity: number
}

interface PixelExplosionProps {
  isActive: boolean
  onComplete: () => void
  x: number
  y: number
}

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
]

export function PixelExplosion({ isActive, onComplete, x, y }: PixelExplosionProps) {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true)
      
      // Create pixels
      const newPixels: Pixel[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
        opacity: 1
      }))

      setPixels(newPixels)

      // Animate pixels
      const animate = () => {
        setPixels(prevPixels => {
          const updatedPixels = prevPixels.map(pixel => ({
            ...pixel,
            x: pixel.x + pixel.vx,
            y: pixel.y + pixel.vy,
            vy: pixel.vy + 0.2, // gravity
            opacity: pixel.opacity - 0.02
          })).filter(pixel => pixel.opacity > 0)

          if (updatedPixels.length === 0) {
            setIsAnimating(false)
            onComplete()
            return []
          }

          return updatedPixels
        })
      }

      const interval = setInterval(animate, 16) // ~60fps

      return () => clearInterval(interval)
    }
  }, [isActive, isAnimating, x, y, onComplete])

  if (!isActive || pixels.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {pixels.map(pixel => (
        <div
          key={pixel.id}
          className="absolute rounded-sm"
          style={{
            left: pixel.x,
            top: pixel.y,
            width: pixel.size,
            height: pixel.size,
            backgroundColor: pixel.color,
            opacity: pixel.opacity,
            transform: `translate(-50%, -50%)`,
            transition: 'none'
          }}
        />
      ))}
    </div>
  )
} 