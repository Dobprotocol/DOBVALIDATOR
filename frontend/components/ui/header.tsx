"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { isAuthenticated, getAuthToken } from '@/lib/auth'
import { apiService } from '@/lib/api-service'

function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function Header() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const updateWallet = () => {
      const key = localStorage.getItem('stellarPublicKey')
      const authToken = localStorage.getItem('authToken')
      console.log('🔍 Header: Public key:', key ? key.substring(0, 10) + '...' : 'null')
      console.log('🔍 Header: Auth token exists:', !!authToken)
      setPublicKey(key)
      setIsAuth(!!authToken)
    }
    
    const checkProfile = async () => {
      if (!isAuthenticated()) {
        console.log('🔍 Header: Not authenticated')
        setHasProfile(false)
        setIsLoading(false)
        return
      }

      try {
        const authData = getAuthToken()
        if (!authData?.token) {
          console.log('🔍 Header: No auth token')
          setHasProfile(false)
          setIsLoading(false)
          return
        }

        console.log('🔍 Header: Checking profile...')
        try {
          const profileResponse = await apiService.getProfile()
          const hasProfileResult = profileResponse.success
          console.log('🔍 Header: Profile check result:', hasProfileResult)
          setHasProfile(hasProfileResult)
        } catch (error) {
          console.log('🔍 Header: No profile found')
          setHasProfile(false)
        }
      } catch (error) {
        console.error('Error checking profile:', error)
        setHasProfile(false)
      } finally {
        setIsLoading(false)
      }
    }

    updateWallet()
    checkProfile()

    // Listen for wallet state changes
    const handleWalletChange = () => {
      console.log('🔍 Header: Wallet state changed')
      updateWallet()
      checkProfile()
    }

    window.addEventListener('walletStateChange', handleWalletChange)
    window.addEventListener('storage', handleWalletChange)
    window.addEventListener('visibilitychange', handleWalletChange)
    window.addEventListener('focus', handleWalletChange)
    
    return () => {
      window.removeEventListener('walletStateChange', handleWalletChange)
      window.removeEventListener('storage', handleWalletChange)
      window.removeEventListener('visibilitychange', handleWalletChange)
      window.removeEventListener('focus', handleWalletChange)
    }
  }, [])

  const handleDisconnect = () => {
    console.log('🔌 Header: Disconnecting wallet...')
    // Call the global clear function to ensure everything is cleared
    if (typeof window !== 'undefined' && (window as any).clearAllLocalStorage) {
      (window as any).clearAllLocalStorage()
    }
    
    localStorage.removeItem('stellarPublicKey')
    localStorage.removeItem('stellarWallet')
    localStorage.removeItem('authToken')
    localStorage.removeItem('userProfile')
    sessionStorage.clear()
    
    window.dispatchEvent(new Event('walletStateChange'))
    setPublicKey(null)
    setHasProfile(false)
    setIsAuth(false)
    router.push('/')
  }

  const handleEditProfile = () => {
    router.push('/profile')
  }

  console.log('🔍 Header: Render state:', {
    publicKey: publicKey ? publicKey.substring(0, 10) + '...' : 'null',
    hasProfile,
    isLoading,
    isAuth,
    isAuthenticated: isAuthenticated()
  })

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 bg-gray-50 border-b">
      <div className="flex items-center gap-6">
        <a href="https://www.dobprotocol.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/images/dob imagotipo.svg"
            alt="DOB Protocol"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </a>
        {isAuth && (
          <a href="/mockup-dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">My Devices</a>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {isAuth && (
          <>
            {!isLoading && hasProfile && (
              <Button
                onClick={handleEditProfile}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2 px-3 py-1 text-sm"
              onClick={handleDisconnect}
              title="Disconnect wallet"
            >
              {publicKey ? truncateAddress(publicKey) : 'Disconnect'}
              <LogOut size={16} className="ml-1" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
