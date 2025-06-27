"use client"

import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, User, ChevronDown, Home, Settings, FileText, Users, HelpCircle, MessageCircle, TrendingUp } from 'lucide-react'
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
  const [showDobDropdown, setShowDobDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  // Refs for hover detection
  const dobDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const dobTriggerRef = useRef<HTMLDivElement>(null)
  const userTriggerRef = useRef<HTMLDivElement>(null)

  // Check if we're on the homepage
  const isHomepage = pathname === '/'

  useEffect(() => {
    const checkAuth = async () => {
      // If we're on the homepage, show minimal navbar immediately
      if (isHomepage) {
        setIsLoading(false)
        setIsAuth(false)
        return
      }
      
      try {
        // Set a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 3000)
        )
        
        const authPromise = isAuthenticated()
        const auth = await Promise.race([authPromise, timeoutPromise]) as boolean
        
        setIsAuth(auth)
        
        if (auth) {
          const token = getAuthToken()
          if (token) {
            try {
              const response = await apiService.getProfile()
              if (response.success) {
                setPublicKey(response.profile.publicKey)
                setHasProfile(true)
              }
            } catch (error) {
              console.error('Profile check failed:', error)
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Set auth to false on error to show minimal navbar
        setIsAuth(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [isHomepage])

  // Handle DOB dropdown hover with delay
  const handleDobMouseEnter = () => {
    if (!isHomepage || isAuth) {
      setShowDobDropdown(true)
    }
  }

  const handleDobMouseLeave = () => {
    setTimeout(() => {
      if (!dobDropdownRef.current?.matches(':hover') && !dobTriggerRef.current?.matches(':hover')) {
        setShowDobDropdown(false)
      }
    }, 150)
  }

  // Handle User dropdown hover with delay
  const handleUserMouseEnter = () => {
    setShowUserDropdown(true)
  }

  const handleUserMouseLeave = () => {
    setTimeout(() => {
      if (!userDropdownRef.current?.matches(':hover') && !userTriggerRef.current?.matches(':hover')) {
        setShowUserDropdown(false)
      }
    }, 150)
  }

  const handleLogout = async () => {
    try {
      // Clear all local storage
      localStorage.removeItem('stellarPublicKey')
      localStorage.removeItem('stellarWallet')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userProfile')
      sessionStorage.clear()
      
      // Update state
      setIsAuth(false)
      setPublicKey(null)
      setHasProfile(false)
      
      // Navigate to home
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-700 animate-pulse rounded"></div>
            <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* DOB Logo */}
          <div 
            ref={dobTriggerRef}
            className="relative"
            onMouseEnter={handleDobMouseEnter}
            onMouseLeave={handleDobMouseLeave}
          >
            <div className="flex items-center space-x-2 cursor-pointer group">
              <Image
                src="/images/dob imagotipo.svg"
                alt="DOB Protocol"
                width={120}
                height={40}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              {/* Only show chevron if not on homepage or if authenticated */}
              {(!isHomepage || isAuth) && (
                <ChevronDown className="text-gray-400 transition-transform duration-200 group-hover:rotate-180" size={16} />
              )}
            </div>

            {/* DOB Dropdown Menu - Only show if not on homepage or if authenticated */}
            {showDobDropdown && (!isHomepage || isAuth) && (
              <div
                ref={dobDropdownRef}
                className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl transition-all duration-300 ease-out"
                onMouseEnter={handleDobMouseEnter}
                onMouseLeave={handleDobMouseLeave}
              >
                <div className="p-2">
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    onClick={() => router.push('/')}
                  >
                    <Home size={18} className="text-gray-300" />
                    <span className="text-white">Home</span>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    onClick={() => router.push('/dashboard')}
                  >
                    <FileText size={18} className="text-gray-300" />
                    <span className="text-white">My Projects</span>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    onClick={() => window.open('https://dobprotocol.com/faq', '_blank')}
                  >
                    <HelpCircle size={18} className="text-gray-300" />
                    <span className="text-white">FAQ</span>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    onClick={() => window.open('https://dobprotocol.com/support', '_blank')}
                  >
                    <MessageCircle size={18} className="text-gray-300" />
                    <span className="text-white">Support</span>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    onClick={() => window.open('https://dobprotocol.com/liquidity-pools', '_blank')}
                  >
                    <TrendingUp size={18} className="text-gray-300" />
                    <span className="text-white">Liquidity Pools</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Actions - Only show if authenticated */}
          {isAuth ? (
            <div 
              ref={userTriggerRef}
              className="relative"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200">
                  <User size={18} className="text-gray-300" />
                  <span className="text-white text-sm font-medium">
                    {publicKey ? truncateAddress(publicKey) : 'User'}
                  </span>
                  <ChevronDown className="text-gray-400 transition-transform duration-200 group-hover:rotate-180" size={16} />
                </div>
              </div>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div
                  ref={userDropdownRef}
                  className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl transition-all duration-300 ease-out"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-600">
                      <p className="text-white text-sm font-medium">
                        {publicKey ? truncateAddress(publicKey) : 'User'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {publicKey ? publicKey : ''}
                      </p>
                    </div>
                    <div className="p-2">
                      <div 
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                        onClick={() => router.push('/profile')}
                      >
                        <User size={18} className="text-gray-300" />
                        <span className="text-white">Edit Profile</span>
                      </div>
                      <div 
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} className="text-gray-300" />
                        <span className="text-white">Disconnect Wallet</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Empty div to maintain layout when not authenticated
            <div></div>
          )}
        </div>
      </div>
    </header>
  )
}
