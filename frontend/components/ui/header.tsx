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
      setPublicKey(key)
      setIsAuth(!!authToken)
    }
    
    const checkProfile = async () => {
      if (!isAuthenticated()) {
        setHasProfile(false)
        setIsLoading(false)
        return
      }

      try {
        const authData = getAuthToken()
        if (!authData?.token) {
          setHasProfile(false)
          setIsLoading(false)
          return
        }

        try {
          const profileResponse = await apiService.getProfile()
          const hasProfileResult = profileResponse.success
          setHasProfile(hasProfileResult)
        } catch (error) {
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 bg-background border-b h-16">
      <div className="flex items-center gap-6 ">
        <div className="h-12 overflow-hidden flex items-center">
          <Image
            src="/images/dob imagotipo.svg"
            alt="DOB Protocol"
            width={300}
            height={200}
            className="h-24 w-auto"
            priority
          />
        </div>
        {isAuth && (
          <a href="/dashboard" className="text-foreground hover:text-primary font-medium transition-colors">My Devices</a>
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
