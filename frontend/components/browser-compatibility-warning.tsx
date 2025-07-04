"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, X, HelpCircle, ExternalLink, Shield } from "lucide-react"

interface BrowserCompatibilityWarningProps {
  onDismiss?: () => void
  showOnConnect?: boolean
}

export function BrowserCompatibilityWarning({ onDismiss, showOnConnect = false }: BrowserCompatibilityWarningProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSeenWarning, setHasSeenWarning] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Check if user has already seen the warning
    const warningSeen = localStorage.getItem('stellar-wallet-warning-seen')
    if (warningSeen) {
      setHasSeenWarning(true)
    }
  }, [])

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('stellar-wallet-warning-seen', 'true')
    }
    setIsOpen(false)
    onDismiss?.()
  }

  const handleShowWarning = () => {
    setIsOpen(true)
  }

  // Don't show if user has already seen it and chose not to show again
  if (hasSeenWarning && !showOnConnect) {
    return null
  }

  return (
    <>
      {showOnConnect && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Wallet Connection Notice</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Some browsers may block the wallet connection popup. If you experience issues, please check your popup blocker settings or try a different browser.
            <Button 
              variant="link" 
              className="p-0 h-auto text-yellow-700 underline ml-1"
              onClick={handleShowWarning}
            >
              Learn more
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Browser Compatibility Notice
            </DialogTitle>
            <DialogDescription>
              Important information about wallet connection compatibility
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Why might the wallet connection be blocked?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Popup blockers:</strong> Modern browsers block popups by default</li>
                <li>• <strong>Security policies:</strong> Cross-origin wallet connectors are restricted</li>
                <li>• <strong>Browser extensions:</strong> Some security extensions block wallet connections</li>
                <li>• <strong>Privacy settings:</strong> Enhanced privacy modes may block external connections</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">How to resolve connection issues:</h4>
              <div className="text-sm text-green-800 space-y-3">
                <div>
                  <strong>1. Allow popups for this site:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Click the popup blocker icon in your browser's address bar</li>
                    <li>• Select "Always allow popups" for validator.dobprotocol.com</li>
                  </ul>
                </div>
                
                <div>
                  <strong>2. Browser-specific solutions:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• <strong>Chrome/Edge:</strong> Click the shield icon → "Site settings" → "Popups and redirects" → "Allow"</li>
                    <li>• <strong>Firefox:</strong> Click the shield icon → "Enhanced Tracking Protection" → "Site Permissions" → "Pop-ups" → "Allow"</li>
                    <li>• <strong>Brave:</strong> Click the shield icon → "Site and Shield settings" → "Pop-ups" → "Allow"</li>
                    <li>• <strong>Safari:</strong> Safari → Preferences → Websites → Pop-up Windows → "Allow" for this site</li>
                  </ul>
                </div>

                <div>
                  <strong>3. Alternative browsers:</strong>
                  <p className="ml-4 mt-1">If issues persist, try using Chrome, Firefox, or Edge with default settings.</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">About the Simple Signer</h4>
              <p className="text-sm text-orange-800">
                We use the Bigger Simple Signer (<code className="bg-orange-100 px-1 rounded">sign.bigger.systems</code>) for secure wallet connections. 
                This is a trusted Stellar wallet connector that operates in a separate window for enhanced security.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dont-show-again" 
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <label htmlFor="dont-show-again" className="text-sm text-gray-600">
                Don't show this warning again
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleDismiss}>
                Got it
              </Button>
              <Button 
                onClick={() => window.open('https://dobprotocol-1.gitbook.io/dobprotocol-wiki/dob-validator/overview', '_blank')}
                variant="outline"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & FAQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 