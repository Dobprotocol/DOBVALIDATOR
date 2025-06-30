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
    setMounted(true)
    document.documentElement.classList.add('dark')
  }, [])

  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider 
      defaultTheme="dark" 
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme="dark"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
