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
  const [showDobDropdown, setShowDobDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const router = useRouter()
  
  // Refs for hover detection
  const dobDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const dobTriggerRef = useRef<HTMLDivElement>(null)
  const userTriggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated()
        setIsAuth(auth)
        
        if (auth) {
          const token = getAuthToken()
          if (token) {
            const response = await apiService.getProfile()
            if (response.success) {
              setPublicKey(response.profile.publicKey)
              setHasProfile(true)
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Handle DOB dropdown hover with delay
  const handleDobMouseEnter = () => {
    setShowDobDropdown(true)
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
          {/* DOB Logo with Dropdown */}
          <div 
            ref={dobTriggerRef}
            className="relative"
            onMouseEnter={handleDobMouseEnter}
            onMouseLeave={handleDobMouseLeave}
          >
            <div className="flex items-center space-x-2 cursor-pointer group">
              <Image
                src="/images/dob-logo.png"
                alt="DOB Protocol"
                width={40}
                height={40}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg">DOB Protocol</span>
                <span className="text-gray-400 text-xs">Validator</span>
              </div>
              <ChevronDown className="text-gray-400 transition-transform duration-200 group-hover:rotate-180" size={16} />
            </div>

            {/* DOB Dropdown Menu */}
            {showDobDropdown && (
              <div
                ref={dobDropdownRef}
                className="absolute top-full left-0 mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl transition-all duration-300 ease-out"
                onMouseEnter={handleDobMouseEnter}
                onMouseLeave={handleDobMouseLeave}
              >
                <div className="p-2">
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                    onClick={() => router.push('/')}
                  >
                    <Home size={18} className="text-gray-300" />
                    <span className="text-white">Home</span>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                    onClick={() => router.push('/dashboard')}
                  >
                    <FileText size={18} className="text-gray-300" />
                    <span className="text-white">My Devices</span>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                    onClick={() => router.push('/form')}
                  >
                    <Settings size={18} className="text-gray-300" />
                    <span className="text-white">Add Device</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Actions */}
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
                  className="absolute top-full right-0 mt-2 w-56 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl transition-all duration-300 ease-out"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-white text-sm font-medium">
                        {publicKey ? truncateAddress(publicKey) : 'User'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {hasProfile ? 'Profile Verified' : 'Profile Pending'}
                      </p>
                    </div>
                    <div className="p-2">
                      <div 
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                        onClick={() => router.push('/profile')}
                      >
                        <User size={18} className="text-gray-300" />
                        <span className="text-white">Edit Profile</span>
                      </div>
                      <div 
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/form')}
                className="text-white hover:bg-white/10 transition-colors duration-200"
              >
                Add Device
              </Button>
              <Button
                onClick={() => router.push('/form')}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
