"use client"

import { Suspense } from "react"
import { SubmissionReview } from "@/components/submission-review"
import { SimpleSidebar, SimpleSidebarContent, SimpleSidebarHeader, SimpleSidebarMenu, SimpleSidebarMenuButton } from "@/components/ui/simple-sidebar"
import { Button } from "@/components/ui/button"
import { Shield, FileText, BarChart3, Settings, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SubmissionReviewPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SimpleSidebar>
        <SimpleSidebarHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">DOB Backoffice</span>
          </div>
        </SimpleSidebarHeader>
        <SimpleSidebarContent>
          <SimpleSidebarMenu>
            <SimpleSidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/dashboard')}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </SimpleSidebarMenuButton>
            <SimpleSidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start bg-accent" onClick={() => router.push('/submission-review')}>
                <FileText className="mr-2 h-4 w-4" />
                Review Submissions
              </Button>
            </SimpleSidebarMenuButton>
            <SimpleSidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </SimpleSidebarMenuButton>
            <SimpleSidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </SimpleSidebarMenuButton>
          </SimpleSidebarMenu>
        </SimpleSidebarContent>
      </SimpleSidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
              <h1 className="text-xl font-bold">Submission Review</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading submission review...</p>
                </div>
              </div>
            }>
              <SubmissionReview />
            </Suspense>
          </main>
        </div>
      </div>
  )
} 