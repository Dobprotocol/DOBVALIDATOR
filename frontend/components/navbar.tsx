'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { StellarWallet } from '@/components/stellar-wallet'
import { isAuthenticated, getAuthToken } from '@/lib/auth'
import { walletStateManager } from '@/lib/wallet-state'

export function Navbar() {
  const router = useRouter()
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkProfile = async () => {
      console.log('🔍 Navbar: Checking profile...')
      console.log('🔍 Navbar: isAuthenticated() =', isAuthenticated())
      
      if (!isAuthenticated()) {
        console.log('❌ Navbar: User not authenticated')
        setIsLoading(false)
        return
      }

      try {
        const authData = getAuthToken()
        console.log('🔍 Navbar: authData =', authData ? 'exists' : 'null')
        
        if (!authData?.token) {
          console.log('❌ Navbar: No auth token')
          setIsLoading(false)
          return
        }

        // Check local storage first in development mode
        const isDevelopment = process.env.NODE_ENV === 'development' || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname.includes('vercel.app');
        
        if (isDevelopment) {
          console.log('🔧 Navbar: Development mode - checking local storage...')
          const walletAddress = localStorage.getItem('stellarPublicKey') || authData.walletAddress
          if (walletAddress) {
            const localProfileKey = `localProfile_${walletAddress}`
            const localProfile = localStorage.getItem(localProfileKey)
            const userProfile = localStorage.getItem('userProfile')
            
            if (localProfile || userProfile) {
              console.log('✅ Navbar: Profile found in local storage')
              setHasProfile(true)
              setIsLoading(false)
              return
            }
          }
        }

        console.log('🔍 Navbar: Making profile API call...')
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        })

        console.log('🔍 Navbar: Profile response status =', response.status)
        const hasProfileResult = response.ok
        console.log('🔍 Navbar: hasProfile =', hasProfileResult)
        setHasProfile(hasProfileResult)
      } catch (error) {
        console.error('❌ Navbar: Error checking profile:', error)
        
        // In development mode, if API fails, check if we have local profile
        const isDevelopment = process.env.NODE_ENV === 'development' || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname.includes('vercel.app');
        
        if (isDevelopment) {
          console.log('🔧 Navbar: Development mode - checking local storage after API error...')
          const walletAddress = localStorage.getItem('stellarPublicKey')
          if (walletAddress) {
            const localProfileKey = `localProfile_${walletAddress}`
            const localProfile = localStorage.getItem(localProfileKey)
            const userProfile = localStorage.getItem('userProfile')
            
            if (localProfile || userProfile) {
              console.log('✅ Navbar: Profile found in local storage after API error')
              setHasProfile(true)
              setIsLoading(false)
              return
            }
          }
        }
        
        setHasProfile(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkProfile()

    // Listen for wallet state changes
    const unsubscribe = walletStateManager.subscribe((state) => {
      console.log('🔍 Navbar: Wallet state changed:', state)
      if (state.isAuthenticated) {
        console.log('✅ Navbar: Wallet authenticated, checking profile...')
        checkProfile()
      } else {
        console.log('❌ Navbar: Wallet not authenticated, hiding profile button')
        setHasProfile(false)
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const handleEditProfile = () => {
    router.push('/profile')
  }

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          {(() => {
            console.log('🔍 Navbar: Render condition check:', {
              isLoading,
              isAuthenticated: isAuthenticated(),
              hasProfile
            })
            return !isLoading && isAuthenticated() && hasProfile ? (
              <Button
                onClick={handleEditProfile}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : null
          })()}
          <StellarWallet />
        </div>
      </div>
    </nav>
  )
} 