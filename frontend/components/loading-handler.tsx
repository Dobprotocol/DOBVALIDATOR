'use client'

import { useEffect } from 'react'

export function LoadingHandler() {
  useEffect(() => {
    // Remove no-js class and add js-ready class
    document.documentElement.classList.remove('no-js')
    document.documentElement.classList.add('js-ready')

    // Ensure all styles are loaded
    const styleSheets = Array.from(document.styleSheets)
    const stylePromises = styleSheets.map(sheet => {
      if (sheet.href) {
        return fetch(sheet.href)
          .then(response => response.text())
          .catch(() => null)
      }
      return Promise.resolve(null)
    })

    Promise.all(stylePromises).then(() => {
      // Add ready class to trigger fade-in animation
      document.documentElement.classList.add('ready')
    })
  }, [])

  return null
} 