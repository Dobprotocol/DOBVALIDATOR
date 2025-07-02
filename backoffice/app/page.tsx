"use client"

import { Button } from "@/components/ui/button"
import { Wallet, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const handleConnectWallet = () => {
    // For now, just redirect to dashboard
    // In a real implementation, this would handle wallet connection
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">DOB Validator Backoffice</h1>
          <p className="text-muted-foreground">
            Connect your wallet to access the validator dashboard
          </p>
        </div>
        <div className="space-y-4">
          <Button 
            onClick={handleConnectWallet}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <Wallet className="h-5 w-5" />
            Connect Wallet
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Click to proceed to dashboard (wallet connection will be implemented later)
          </p>
        </div>
      </div>
    </div>
  )
}
