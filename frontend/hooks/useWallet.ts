import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { requestChallenge, verifySignature } from '@/lib/auth'
import { SIMPLE_SIGNER_URL, NETWORK, generateChallengeXDR } from '@/lib/stellar-sdk'
import { apiService } from '@/lib/api-service'

interface WalletState {
  address: string | null
  isConnected: boolean
  isAuthenticating: boolean
  authToken: string | null
}

export function useWallet() {
  const router = useRouter()
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isAuthenticating: false,
    authToken: null
  })

  const checkProfile = async () => {
    try {
      const profile = await apiService.getProfile()
      console.log('✅ Profile found:', profile)
      // Profile exists, force redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.log('❌ Profile check error:', error)
      if (error.response?.status === 404 || 
          error.message?.includes('404') || 
          error.message?.includes('Profile not found') || 
          error.message?.includes('Endpoint not found')) {
        console.log('⚠️ No profile found, redirecting to profile creation')
        // No profile found, force redirect to profile creation
        window.location.href = '/profile'
      } else {
        console.error('❌ Unexpected error checking profile:', error)
        throw error
      }
    }
  }

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      try {
        const storedAddress = localStorage.getItem('stellarPublicKey')
        const storedToken = localStorage.getItem('authToken')
        
        if (storedAddress && storedToken) {
          const tokenData = JSON.parse(storedToken)
          if (tokenData.expiresAt > Date.now()) {
            setWalletState({
              address: storedAddress,
              isConnected: true,
              isAuthenticating: false,
              authToken: tokenData.token
            })
          } else {
            // Token expired, clear storage
            localStorage.removeItem('stellarPublicKey')
            localStorage.removeItem('authToken')
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
        localStorage.removeItem('stellarPublicKey')
        localStorage.removeItem('authToken')
      }
    }

    checkWalletConnection()
  }, [])

  const connectWallet = async () => {
    try {
      setWalletState(prev => ({ ...prev, isAuthenticating: true }))

      // Open Simple Signer in a new window first to get the public key
      const connectWindow = window.open(
        `${SIMPLE_SIGNER_URL}/connect`,
        'Connect_Window',
        'width=360,height=700'
      )

      if (!connectWindow) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      // Wait for connection and get public key
      const publicKey = await new Promise<string>((resolve, reject) => {
        const messageHandler = (e: MessageEvent) => {
          if (e.origin !== SIMPLE_SIGNER_URL) return

          if (e.data.type === 'onConnect') {
            window.removeEventListener('message', messageHandler)
            connectWindow.close()
            resolve(e.data.message.publicKey)
          }

          if (e.data.type === 'onCancel') {
            window.removeEventListener('message', messageHandler)
            connectWindow.close()
            reject(new Error('Connection cancelled by user'))
          }
        }

        window.addEventListener('message', messageHandler)

        // Check if window is closed
        const checkClosed = setInterval(() => {
          if (connectWindow.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageHandler)
            reject(new Error('Connection cancelled'))
          }
        }, 500)
      })

      // Now that we have the public key, request a challenge
      const { challenge } = await requestChallenge(publicKey)

      // Generate the XDR for signing
      const xdr = generateChallengeXDR(challenge, publicKey)

      // Open Simple Signer again for signing
      const signWindow = window.open(
        `${SIMPLE_SIGNER_URL}/sign?xdr=${encodeURIComponent(xdr)}&network=${NETWORK.toLowerCase()}&description=${encodeURIComponent('Please sign this challenge to authenticate with DOB Validator')}`,
        'Sign_Window',
        'width=360,height=700'
      )

      if (!signWindow) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      // Wait for signature
      const signedXDR = await new Promise<string>((resolve, reject) => {
        const messageHandler = (e: MessageEvent) => {
          if (e.origin !== SIMPLE_SIGNER_URL) return

          if (e.data.type === 'onSign') {
            window.removeEventListener('message', messageHandler)
            signWindow.close()
            resolve(e.data.message.signedXDR)
          }

          if (e.data.type === 'onCancel') {
            window.removeEventListener('message', messageHandler)
            signWindow.close()
            reject(new Error('Signing cancelled by user'))
          }

          if (e.data.type === 'error') {
            window.removeEventListener('message', messageHandler)
            signWindow.close()
            reject(new Error(e.data.message || 'Failed to sign transaction'))
          }
        }

        window.addEventListener('message', messageHandler)

        // Check if window is closed
        const checkClosed = setInterval(() => {
          if (signWindow.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageHandler)
            reject(new Error('Signing cancelled'))
          }
        }, 500)
      })

      // Verify signature with backend
      const authResult = await verifySignature(publicKey, signedXDR, challenge)

      // Store authentication data
      const authData = {
        token: authResult.token,
        expiresIn: authResult.expiresIn,
        expiresAt: Date.now() + (parseInt(authResult.expiresIn.toString()) * 1000)
      }

      localStorage.setItem('stellarPublicKey', publicKey)
      localStorage.setItem('authToken', JSON.stringify(authData))

      // Store in cookies for middleware
      document.cookie = `authToken=${authResult.token}; path=/; max-age=${authResult.expiresIn}; SameSite=Lax`
      document.cookie = `stellarPublicKey=${publicKey}; path=/; max-age=${authResult.expiresIn}; SameSite=Lax`

      setWalletState({
        address: publicKey,
        isConnected: true,
        isAuthenticating: false,
        authToken: authResult.token
      })

      // Check profile and redirect after successful authentication
      await checkProfile()

      return publicKey
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setWalletState({
        address: null,
        isConnected: false,
        isAuthenticating: false,
        authToken: null
      })
      throw error
    }
  }

  const disconnectWallet = () => {
    // Clear storage
    localStorage.removeItem('stellarPublicKey')
    localStorage.removeItem('authToken')
    
    // Clear cookies
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'stellarPublicKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    setWalletState({
      address: null,
      isConnected: false,
      isAuthenticating: false,
      authToken: null
    })
  }

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  }
} 