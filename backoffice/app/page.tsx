"use client"

import { StellarWallet } from "@/components/stellar-wallet"

export default function LandingPage() {
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
          <StellarWallet />
        </div>
      </div>
    </div>
  )
}
