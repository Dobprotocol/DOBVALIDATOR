"use client"

import React, { useEffect, useState } from "react"
import { Twitter, Globe, Linkedin, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

function playClickSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    // White noise
    data[i] = (Math.random() * 2 - 1) * Math.exp(-40 * i / data.length)
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
  source.onended = () => ctx.close()
}

export function Footer() {
  const { theme, setTheme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Show footer only when user has scrolled through the entire viewport (100% of screen height)
      // This means they've seen the full Spline scene
      const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100
      const threshold = 100 // Show footer when 100% scrolled through the scene
      
      setIsVisible(scrollPercentage >= threshold)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleThemeToggle = () => {
    playClickSound()
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <>
      {/* Spacer div to maintain footer space */}
      <div className="h-16" />
      
      {/* Footer */}
      <footer 
        className={`
          fixed bottom-0 left-0 right-0 
          flex items-center justify-between px-4 py-4 
          bg-background/95 backdrop-blur-sm border-t
          transition-all duration-300 ease-in-out
          pointer-events-auto
          z-50
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThemeToggle}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-[5vw]"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} DOB Protocol. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://twitter.com/dobprotocol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <Twitter size={20} />
          </a>
          <a
            href="https://www.dobprotocol.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <Globe size={20} />
          </a>
          <a
            href="https://www.linkedin.com/company/dobprotocol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </footer>
    </>
  )
} 