"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie'

const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

// ASCII Art for wallet connection
const WALLET_ASCII = `
                  .*%@@@@@@@@@#:                  
              .-@@@@@@@@@%@@@@@@@@+.     .:*@#    
            .#@@@@#:.        ..+*.    .+@@@@@#    
           =@@@@:                 .-%@@@@@#-      
          #@@@.                .*@@@@@@=.    .    
         #@@%              .=%@@@@@*.    .+@@#    
        =@@@           ..@@@@@@@:    .:@@@@@@*    
        %@@=        .*@@@@@@=.    .*@@@@@@@.      
       .@@@.    .:@@@@@@%     .-@@@@@@#%@@+       
       :@@@  .#@@@@@%-     :#@@@@@@-.  #@@+       
       :@@@@@@@@@*.    .=@@@@@@+.      %@@=       
      =@@@@@@%:.    =%@@@@@*:.        -@@@.       
    -@@@@%=.    :#@@@@@%=            .%@@+        
    -@+..   .+@@@@@@+.               @@@#         
         -%@@@@@#:.               .=@@@*          
      #@@@@@@-.                  -@@@@-           
    -@@@@*.    .+@@#-.      .-*@@@@@=.            
    -@.         +@@@@@@@@@@@@@@@@%.               
                   .-+#@@@@#*=:.                  
`

const WALLET_TEXT = `
   __      ___                  ___ _         _      _         _      
   \\ \\    / / |_  ___ _ _ ___  | _ ) |___  __| |____| |_  __ _(_)_ _  
    \\ \\/\\/ /| ' \\/ -_) '_/ -_) | _ \\ / _ \\/ _| / / _| ' \\/ _\` | | ' \\ 
  __ \\_/\\_/ |_||_\\___|_| \\___|_|___/_\\___/\\__|_\\_\\__|_||_\\__,_|_|_||_|
 |  \\/  |___ ___| |_ ___ | |_| |_  ___  | _ \\___ __ _| |              
 | |\\/| / -_) -_)  _(_-< |  _| ' \\/ -_) |   / -_) _\` | |              
 |_|  |_\\___\\___|\\__/__/  \\__|_||_\\___| |_|_\\___\\__,_|_|              
 \\ \\    / /__ _ _| |__| |                                             
  \\ \\/\\/ / _ \\ '_| / _\` |_                                            
   \\_/\\_/\\___/_| |_\\__,_(_)                                           
`

// Helper function to truncate wallet address
function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// Create a custom event for wallet state changes
const walletStateChangeEvent = new Event('walletStateChange')

export function StellarWallet() {
  const [isOpen, setIsOpen] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Load saved public key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('stellarPublicKey')
    if (savedKey) {
      setPublicKey(savedKey)
      console.log('Wallet loaded:', {
        address: savedKey,
        truncated: truncateAddress(savedKey),
        timestamp: new Date().toISOString()
      })
      // Set cookie for middleware
      Cookies.set('stellarPublicKey', savedKey, { expires: 7 }) // Expires in 7 days
    }
  }, [])

  // Handle messages from Simple Signer
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Reject messages that are not coming from Simple Signer
      if (e.origin !== SIMPLE_SIGNER_URL) {
        return
      }

      const messageEvent = e.data

      if (messageEvent.type === 'onConnect') {
        const publicKey = messageEvent.message.publicKey
        const wallet = messageEvent.message.wallet
        
        console.log('Wallet connected:', {
          address: publicKey,
          truncated: truncateAddress(publicKey),
          walletType: wallet,
          timestamp: new Date().toISOString()
        })
        
        // Store the public key and wallet type
        localStorage.setItem('stellarPublicKey', publicKey)
        localStorage.setItem('stellarWallet', wallet)
        // Set cookie for middleware
        Cookies.set('stellarPublicKey', publicKey, { expires: 7 }) // Expires in 7 days
        setPublicKey(publicKey)
        setIsOpen(false)
        setIsConnecting(false)
        toast({
          title: "Connected successfully",
          description: `Connected with ${wallet} wallet`,
        })
        // Dispatch wallet state change event
        window.dispatchEvent(walletStateChangeEvent)
        // Redirect to dashboard after successful connection
        window.location.href = '/dashboard'
      } else if (messageEvent.type === 'onCancel') {
        setIsConnecting(false)
        console.log('Wallet connection cancelled by user')
        toast({
          title: "Connection cancelled",
          description: "Wallet connection was cancelled.",
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [toast])

  const handleConnect = () => {
    setIsConnecting(true)
    console.log('Initiating wallet connection...')
    console.log(WALLET_ASCII)
    console.log(WALLET_TEXT)
    const connectWindow = window.open(
      `${SIMPLE_SIGNER_URL}/connect`,
      'Connect_Window',
      'width=360, height=450'
    )

    // Configure available wallets
    window.addEventListener('message', (e) => {
      if (
        e.origin === SIMPLE_SIGNER_URL &&
        e.data.type === 'onReady' &&
        e.data.page === 'connect'
      ) {
        console.log('Simple Signer ready, configuring available wallets...')
        connectWindow?.postMessage(
          { wallets: ['freighter', 'xbull', 'albedo'] },
          SIMPLE_SIGNER_URL
        )
      }
    })
  }

  const handleDisconnect = () => {
    console.log('=== Starting Wallet Disconnection ===')
    console.log('Current wallet state:', {
      publicKey,
      isOpen,
      isConnecting,
      timestamp: new Date().toISOString()
    })

    try {
      // Clear all wallet-related data
      console.log('Clearing localStorage...')
      localStorage.removeItem('stellarPublicKey')
      localStorage.removeItem('stellarWallet')
      
      console.log('Removing cookie...')
      Cookies.remove('stellarPublicKey')
      
      console.log('Clearing component state...')
      setPublicKey(null)
      setIsOpen(false)
      
      console.log('Dispatching wallet state change event...')
      window.dispatchEvent(walletStateChangeEvent)
      
      console.log('Showing disconnect toast...')
      toast({
        title: "Disconnected",
        description: "Your wallet has been disconnected.",
      })

      console.log('Redirecting to landing page...')
      // Force a hard redirect to ensure clean state
      window.location.href = '/'
      
      console.log('=== Wallet Disconnection Complete ===')
    } catch (error) {
      console.error('Error during wallet disconnection:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Expose the disconnect function globally
  useEffect(() => {
    console.log('Setting up global disconnect handler...')
    // @ts-ignore
    window.handleWalletDisconnect = handleDisconnect
    return () => {
      console.log('Cleaning up global disconnect handler...')
      // @ts-ignore
      delete window.handleWalletDisconnect
    }
  }, [handleDisconnect])

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full"
      >
        {publicKey ? truncateAddress(publicKey) : "Connect Wallet"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              You will be redirected to sign with a Stellar-compatible web3 wallet (Freighter, xBull, or Albedo) to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {publicKey ? (
              <Button
                onClick={handleDisconnect}
                className="w-full"
                variant="destructive"
              >
                Disconnect Wallet
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="w-full"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 