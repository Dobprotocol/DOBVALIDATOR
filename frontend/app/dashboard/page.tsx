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
        <div className="flex justify-end mt-8 mb-8">
          <Button
            onClick={handleCreateDevice}
            className="inline-flex items-center gap-2 text-base py-3 px-6 rounded-lg font-semibold shadow-md"
          >
            <PlusCircle className="h-5 w-5" />
            Validate New Device
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          {/* Empty state for now */}
        </div>
      </div>
    </div>
  )
} 