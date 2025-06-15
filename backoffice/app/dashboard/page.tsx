"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BackOfficeDashboard } from "@/components/backoffice-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const publicKey = localStorage.getItem('stellarPublicKey')
    const cookie = document.cookie.includes('stellarPublicKey')
    
    console.log('Dashboard auth check:', {
      hasPublicKey: !!publicKey,
      hasCookie: cookie,
      timestamp: new Date().toISOString()
    })

    if (!publicKey || !cookie) {
      console.log('User not authenticated, redirecting to landing page...')
      // Clear any stale data
      localStorage.removeItem('stellarPublicKey')
      localStorage.removeItem('stellarWallet')
      document.cookie = 'stellarPublicKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // Force redirect to landing page
      window.location.href = '/'
    } else {
      console.log('User authenticated, showing dashboard...')
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">DOB Validator Backoffice</h1>
        </div>
      </header>
      <main className="container py-6">
        <BackOfficeDashboard />
      </main>
    </div>
  )
} 