"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              DOB Validator Backoffice
            </h1>
            <p className="text-muted-foreground">
              Welcome to the validator dashboard
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Submissions</h3>
              <p className="text-muted-foreground mb-4">
                Review and manage device submissions
              </p>
              <button 
                onClick={() => router.push('/submission-review')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                View Submissions
              </button>
            </div>

            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground mb-4">
                View validation statistics and metrics
              </p>
              <button 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                View Analytics
              </button>
            </div>

            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Settings</h3>
              <p className="text-muted-foreground mb-4">
                Configure validator settings and preferences
              </p>
              <button 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Open Settings
              </button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">New submission received</p>
                  <p className="text-sm text-muted-foreground">Device ID: ABC123</p>
                </div>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">Validation completed</p>
                  <p className="text-sm text-muted-foreground">Device ID: XYZ789</p>
                </div>
                <span className="text-sm text-muted-foreground">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">System update</p>
                  <p className="text-sm text-muted-foreground">Backend services updated</p>
                </div>
                <span className="text-sm text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 