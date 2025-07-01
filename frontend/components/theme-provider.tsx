'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Force dark theme on mount
  React.useEffect(() => {
    // Set mounted state
    setMounted(true)
    
    // Force dark theme
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
    
    // Remove light theme if present
    document.documentElement.classList.remove('light')
  }, [])

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }} aria-hidden="true">
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider 
      {...props}
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      attribute="class"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
