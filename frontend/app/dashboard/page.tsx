"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  const handleCreateDevice = () => {
    router.push('/form')
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">My Devices</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your device submissions and track their status
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-card shadow rounded-lg p-8 text-center border">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-foreground">No devices</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new device submission.
            </p>
            <div className="mt-6">
              <Button
                onClick={handleCreateDevice}
                className="inline-flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Validate New Device
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 