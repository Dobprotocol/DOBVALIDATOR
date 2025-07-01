import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { requestChallenge, verifySignature } from '@/lib/auth'
import stellarSigner from '@/lib/stellar-sdk'

// Simple Signer configuration
const SIMPLE_SIGNER_URL = 'https://sign.bigger.systems'

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
      const { challenge } = await requestChallenge('temp')

      // Generate XDR for the challenge
      const xdr = stellarSigner.generateChallengeXDR(challenge)

      // Open Simple Signer in a new window
      const signWindow = window.open(
        `${SIMPLE_SIGNER_URL}/connect`,
        'Sign_Window',
        'width=360,height=700'
      )

      if (!signWindow) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      // Create a promise that resolves when the user completes signing
      const waitForSignature = new Promise<{ signedXDR: string, publicKey: string }>((resolve, reject) => {
        let hasConnected = false
        let userPublicKey = ''
        let timeoutId: NodeJS.Timeout

        const messageHandler = (e: MessageEvent) => {
          if (e.origin !== SIMPLE_SIGNER_URL) return

          // Clear timeout on any message
          if (timeoutId) {
            clearTimeout(timeoutId)
          }

          switch (e.data.type) {
            case 'onReady':
              // When Simple Signer is ready, send the XDR
              if (e.data.page === 'connect') {
                signWindow?.postMessage(
                  {
                    xdr,
                    description: 'Please sign this challenge to authenticate with DOB Validator',
                  },
                  SIMPLE_SIGNER_URL
                )
                // Set a 5-minute timeout
                timeoutId = setTimeout(() => {
                  window.removeEventListener('message', messageHandler)
                  reject(new Error('Connection timed out. Please try again.'))
                  signWindow?.close()
                }, 300000) // 5 minutes
              }
              break

            case 'onConnect':
              // When user connects their wallet
              hasConnected = true
              userPublicKey = e.data.message.publicKey
              break

            case 'onSign':
              // When user signs the transaction
              if (hasConnected && userPublicKey) {
                resolve({
                  signedXDR: e.data.message.signedXDR,
                  publicKey: userPublicKey
                })
                window.removeEventListener('message', messageHandler)
                if (timeoutId) clearTimeout(timeoutId)
                signWindow?.close()
              }
              break

            case 'onCancel':
              // When user cancels or closes the window
              window.removeEventListener('message', messageHandler)
              if (timeoutId) clearTimeout(timeoutId)
              reject(new Error('Operation cancelled by user'))
              signWindow?.close()
              break
          }
        }

        window.addEventListener('message', messageHandler)

        // Cleanup if window is closed
        const checkClosed = setInterval(() => {
          if (signWindow?.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageHandler)
            if (timeoutId) clearTimeout(timeoutId)
            if (!hasConnected) {
              reject(new Error('Operation cancelled'))
            }
          }
        }, 500)
      })

      // Wait for signature
      const { signedXDR, publicKey } = await waitForSignature

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
    // Open Simple Signer logout window
    const logoutWindow = window.open(
      `${SIMPLE_SIGNER_URL}/logout`,
      'Logout_Window',
      'width=100, height=100'
    )

    // Handle logout message
    const messageHandler = (e: MessageEvent) => {
      if (e.origin === SIMPLE_SIGNER_URL && e.data.type === 'onLogOut') {
        window.removeEventListener('message', messageHandler)
        logoutWindow?.close()
      }
    }

    window.addEventListener('message', messageHandler)

    // Send logout message
    logoutWindow?.postMessage({ type: 'logout' }, SIMPLE_SIGNER_URL)

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