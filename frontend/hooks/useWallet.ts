import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { requestChallenge, verifySignature } from '@/lib/auth'
import stellarSigner from '@/lib/stellar-sdk'

interface WalletState {
  walletAddress: string | null
  isAuthenticating: boolean
  authToken: string | null
  setWalletAddress: (address: string | null) => void
  setAuthToken: (token: string | null) => void
  setIsAuthenticating: (isAuthenticating: boolean) => void
  clearWallet: () => void
}

const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      walletAddress: null,
      isAuthenticating: false,
      authToken: null,
      setWalletAddress: (address) => set({ walletAddress: address }),
      setAuthToken: (token) => set({ authToken: token }),
      setIsAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
      clearWallet: () => set({ walletAddress: null, authToken: null, isAuthenticating: false }),
    }),
    {
      name: 'wallet-storage',
    }
  )
)

export function useWallet() {
  const { 
    walletAddress, 
    isAuthenticating,
    authToken,
    setWalletAddress, 
    setAuthToken,
    setIsAuthenticating,
    clearWallet 
  } = useWalletStore()

  const connectWallet = async () => {
    try {
      setIsAuthenticating(true)

      // Request challenge from backend
      const { challenge } = await requestChallenge('temp') // We'll get the real address from Simple Signer

      // Generate XDR for the challenge
      const xdr = stellarSigner.generateChallengeXDR(challenge)

      // Open Simple Signer in a new window
      const signerUrl = stellarSigner.getSimpleSignerUrl(xdr)
      const signerWindow = window.open(signerUrl, '_blank')

      // Create a promise that resolves when the user completes signing
      const waitForSignature = new Promise<{ signedXDR: string, publicKey: string }>((resolve, reject) => {
        let pollCount = 0
        const maxPolls = 300 // 5 minutes timeout
        
        const pollInterval = setInterval(() => {
          pollCount++
          
          // Check if window is closed
          if (signerWindow?.closed) {
            clearInterval(pollInterval)
            reject(new Error('Signing window was closed'))
            return
          }

          // Ask user for signature after window closes
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval)
            const signedXDR = prompt('Please paste the signed transaction XDR:')
            const publicKey = prompt('Please paste your public key:')
            
            if (!signedXDR || !publicKey) {
              reject(new Error('No signature or public key provided'))
              return
            }
            
            resolve({ signedXDR, publicKey })
          }
        }, 1000)
      })

      // Wait for signature
      const { signedXDR, publicKey } = await waitForSignature

      // Verify the challenge response
      if (!stellarSigner.verifyChallenge(challenge, signedXDR)) {
        throw new Error('Invalid signature')
      }

      // Verify signature with backend
      const authResult = await verifySignature(publicKey, signedXDR, challenge)

      // Store authentication data
      setWalletAddress(publicKey)
      setAuthToken(authResult.token)

      // Store in cookies for middleware
      document.cookie = `authToken=${authResult.token}; path=/; max-age=${authResult.expiresIn}; SameSite=Lax`
      document.cookie = `stellarPublicKey=${publicKey}; path=/; max-age=${authResult.expiresIn}; SameSite=Lax`

      return publicKey
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  const disconnectWallet = () => {
    // Clear cookies
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'stellarPublicKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    clearWallet()
  }

  return {
    walletAddress,
    isConnected: !!walletAddress && !!authToken,
    isAuthenticating,
    connectWallet,
    disconnectWallet,
  }
} 