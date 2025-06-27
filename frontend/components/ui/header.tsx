"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, User, ChevronDown, Home, Settings, FileText, Users } from 'lucide-react'
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
  const [showLogoDropdown, setShowLogoDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const logoDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
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

        // Add a small delay to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 100))

        try {
          const profileResponse = await apiService.getProfile()
          const hasProfileResult = profileResponse.success
          setHasProfile(hasProfileResult)
          console.log('✅ Header: Profile check successful, hasProfile:', hasProfileResult)
        } catch (error) {
          console.log('ℹ️ Header: Profile not found or error:', error)
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

    // Listen for wallet state changes with debouncing
    let timeoutId: NodeJS.Timeout
    const handleWalletChange = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        updateWallet()
        checkProfile()
      }, 500) // Debounce to 500ms
    }

    window.addEventListener('walletStateChange', handleWalletChange)
    window.addEventListener('storage', handleWalletChange)
    window.addEventListener('visibilitychange', handleWalletChange)
    window.addEventListener('focus', handleWalletChange)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('walletStateChange', handleWalletChange)
      window.removeEventListener('storage', handleWalletChange)
      window.removeEventListener('visibilitychange', handleWalletChange)
      window.removeEventListener('focus', handleWalletChange)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logoDropdownRef.current && !logoDropdownRef.current.contains(event.target as Node)) {
        setShowLogoDropdown(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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
    setShowUserDropdown(false)
    router.push('/')
  }

  const handleEditProfile = () => {
    setShowUserDropdown(false)
    router.push('/profile')
  }

  const handleNavigate = (path: string) => {
    setShowLogoDropdown(false)
    router.push(path)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 bg-background/80 backdrop-blur-md border-b border-white/20 h-16">
      <div className="flex items-center gap-6">
        {/* DOB Logo with Dropdown */}
        <div className="relative" ref={logoDropdownRef}>
          <div 
            className="h-12 overflow-hidden flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onMouseEnter={() => setShowLogoDropdown(true)}
            onMouseLeave={() => setShowLogoDropdown(false)}
          >
            <Image
              src="/images/dob imagotipo.svg"
              alt="DOB Protocol"
              width={300}
              height={200}
              className="h-24 w-auto"
              priority
            />
            <ChevronDown className="w-4 h-4 ml-1 text-white/70" />
          </div>
          
          {/* Logo Dropdown Menu */}
          {showLogoDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => handleNavigate('/')}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              {isAuth && (
                <button
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  My Devices
                </button>
              )}
              <button
                onClick={() => window.open('https://home.dobprotocol.com', '_blank')}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
              >
                <Users className="w-4 h-4" />
                DOB Protocol
              </button>
              <button
                onClick={() => window.open('https://docs.dobprotocol.com', '_blank')}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Documentation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center justify-end">
        {isAuth && (
          <div className="relative" ref={userDropdownRef}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-background/50 backdrop-blur-sm border-white/30 hover:bg-background/70"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <User className="w-4 h-4" />
              {publicKey ? truncateAddress(publicKey) : 'User'}
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-background/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg py-2 z-50">
                {!isLoading && hasProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
