"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface FooterContextType {
  isFooterVisible: boolean
}

const FooterContext = createContext<FooterContextType | undefined>(undefined)

export function FooterProvider({ children }: { children: React.ReactNode }) {
  const [isFooterVisible, setIsFooterVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100

      // Show footer when scrolled more than 20% of the page
      setIsFooterVisible(scrollPercentage > 20)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <FooterContext.Provider value={{ isFooterVisible }}>
      {children}
    </FooterContext.Provider>
  )
}

export function useFooter() {
  const context = useContext(FooterContext)
  if (context === undefined) {
    throw new Error('useFooter must be used within a FooterProvider')
  }
  return context
} 