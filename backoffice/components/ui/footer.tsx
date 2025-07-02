"use client"

import React, { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useFooter } from "./footer-context"

function playClickSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  if (data && data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      // White noise
      data[i] = (Math.random() * 2 - 1) * Math.exp(-40 * i / data.length)
    }
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
  source.onended = () => ctx.close()
}

export function Footer() {
  const { theme, setTheme } = useTheme()
  const { isFooterVisible } = useFooter()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    playClickSound()
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Don't render theme toggle until mounted to prevent hydration mismatch
  const renderThemeToggle = () => {
    if (!mounted) {
      return <div className="w-5 h-5" /> // Placeholder with same dimensions
    }
    
    return theme === "dark" ? <Sun size={20} /> : <Moon size={20} />
  }

  return (
    <footer 
      className={`fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-4 bg-background border-t transition-all duration-300 z-[100] ${
        isFooterVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
      }`}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleThemeToggle}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {renderThemeToggle()}
        </Button>
      </div>
      <div className="flex items-center">
        <a
          href="https://home.dotprotocol.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <Image
            src="/favicon-32x32.png"
            alt="DOB Protocol"
            width={20}
            height={20}
            className="rounded-sm"
          />
        </a>
      </div>
    </footer>
  )
} 